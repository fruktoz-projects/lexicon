import { PrismaClient } from '@prisma/client';
import { CefrLevel, WritingFeedbackDto, WritingSubmissionModel } from '@lexicon/types';
import { AiGatewayService } from './ai-gateway.service';

export class WritingService {
  constructor(
    private prisma: PrismaClient,
    private aiGateway: AiGatewayService
  ) {}

  async submitAndEvaluate(params: {
    userId: string;
    promptText: string;
    submittedText: string;
    targetCefr?: CefrLevel;
  }): Promise<WritingSubmissionModel> {
    const { userId, promptText, submittedText, targetCefr = CefrLevel.B2 } = params;

    // Evaluate via AI Gateway
    const evaluation: WritingFeedbackDto = await this.aiGateway.evaluateWriting({
      promptText,
      submittedText,
      targetCefr,
    });

    // Save to database
    const submission = await this.prisma.writingSubmission.create({
      data: {
        userId,
        promptText,
        submittedText,
        aiScore: evaluation.score,
        aiFeedback: evaluation as any,
      },
    });

    return {
      id: submission.id,
      userId: submission.userId,
      promptText: submission.promptText,
      submittedText: submission.submittedText,
      aiScore: submission.aiScore,
      aiFeedback: evaluation,
      createdAt: submission.createdAt.toISOString(),
    };
  }

  async getUserSubmissions(userId: string, limit: number = 20): Promise<WritingSubmissionModel[]> {
    const submissions = await this.prisma.writingSubmission.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return submissions.map((s) => ({
      id: s.id,
      userId: s.userId,
      promptText: s.promptText,
      submittedText: s.submittedText,
      aiScore: s.aiScore,
      aiFeedback: s.aiFeedback as any,
      createdAt: s.createdAt.toISOString(),
    }));
  }
}
