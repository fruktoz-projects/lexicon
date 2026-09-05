import { PrismaClient } from '@prisma/client';
import { AiGatewayService } from './ai-gateway.service';
import { CefrLevel, PlacementTestModel, PlacementTestQuestion } from '@lexicon/types';
import crypto from 'crypto';

export class PlacementService {
  constructor(
    private prisma: PrismaClient,
    private aiGateway: AiGatewayService
  ) {}

  async generateTest(userId: string): Promise<PlacementTestModel> {
    // 1. Generate questions using AI
    const prompt = `
      Create a 10-question English placement test to determine a user's CEFR level (A2, B1, B2, C1).
      The test should include a mix of grammar, vocabulary, and reading comprehension.
      For each question, provide 4 options (A, B, C, D) and the correct answer.
      Format the output as a clean JSON array of objects.
      Each object must have:
      - "question": string
      - "options": string[] (exactly 4 items)
      - "correctAnswer": string (must exactly match one of the options)

      Return ONLY the JSON array, no markdown blocks.
    `;

    const aiResponse = await this.aiGateway.generateText(prompt);
    
    let questions: PlacementTestQuestion[] = [];
    try {
      const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      questions = parsed.map((q: any) => ({
        id: crypto.randomUUID(),
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer
      }));
    } catch (e) {
      console.error('Failed to parse AI placement test response:', e);
      throw new Error('Failed to generate placement test. Please try again.');
    }

    // 2. Save test to database
    const test = await this.prisma.placementTest.create({
      data: {
        userId,
        questionsJson: questions as any,
      }
    });

    return {
      id: test.id,
      userId: test.userId,
      questionsJson: questions,
      createdAt: test.createdAt.toISOString(),
    };
  }

  async evaluateTest(testId: string, userId: string, answers: Record<string, string>): Promise<PlacementTestModel> {
    const test = await this.prisma.placementTest.findUnique({
      where: { id: testId }
    });

    if (!test || test.userId !== userId) {
      throw new Error('Test not found');
    }

    if (test.completedAt) {
      throw new Error('Test already completed');
    }

    const questions = test.questionsJson as unknown as PlacementTestQuestion[];
    let correctCount = 0;

    const detailedAnswers = questions.map(q => {
      const userAnswer = answers[q.id];
      const isCorrect = userAnswer === q.correctAnswer;
      if (isCorrect) correctCount++;
      return {
        question: q.question,
        userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect
      };
    });

    const score = Math.round((correctCount / questions.length) * 100);

    // AI evaluation
    const prompt = `
      Evaluate the following English placement test results and determine the user's CEFR level (A1, A2, B1, B2, C1, C2).
      The user answered ${correctCount} out of ${questions.length} questions correctly (Score: ${score}%).
      
      Details:
      ${JSON.stringify(detailedAnswers, null, 2)}

      Return a JSON object with:
      - "cefr": string (one of: "A1", "A2", "B1", "B2", "C1", "C2")
      - "feedback": string (a short, encouraging Hungarian message explaining the result and suggesting focus areas)

      Return ONLY the JSON object, no markdown blocks.
    `;

    const aiResponse = await this.aiGateway.generateText(prompt);
    
    let evaluatedCefr: CefrLevel = CefrLevel.B1;
    let aiFeedback = '';
    
    try {
      const cleanJson = aiResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      evaluatedCefr = parsed.cefr as CefrLevel;
      aiFeedback = parsed.feedback;
    } catch (e) {
      console.error('Failed to parse AI placement evaluation:', e);
      // Fallback logic
      if (score < 40) evaluatedCefr = CefrLevel.A2;
      else if (score < 70) evaluatedCefr = CefrLevel.B1;
      else if (score < 90) evaluatedCefr = CefrLevel.B2;
      else evaluatedCefr = CefrLevel.C1;
      aiFeedback = `Elért pontszám: ${score}%. A javasolt szinted: ${evaluatedCefr}.`;
    }

    // Update test
    const updatedTest = await this.prisma.placementTest.update({
      where: { id: testId },
      data: {
        answersJson: answers,
        score,
        evaluatedCefr: evaluatedCefr as any,
        aiFeedback,
        completedAt: new Date()
      }
    });

    // Automatically update the user's current CEFR level
    await this.prisma.user.update({
      where: { id: userId },
      data: { currentCefr: evaluatedCefr as any }
    });

    return {
      id: updatedTest.id,
      userId: updatedTest.userId,
      questionsJson: questions,
      answersJson: answers,
      score,
      evaluatedCefr,
      aiFeedback,
      createdAt: updatedTest.createdAt.toISOString(),
      completedAt: updatedTest.completedAt?.toISOString()
    };
  }
}
