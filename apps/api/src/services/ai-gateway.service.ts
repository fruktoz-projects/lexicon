import { GoogleGenAI } from '@google/genai';
import {
  CefrLevel,
  ExerciseType,
  LearningPackGenerationDto,
  LearningPackGenerationSchema,
  WritingFeedbackDto,
  WritingFeedbackSchema,
  ZoneType,
} from '@lexicon/types';
import { env } from '../config/env';

export class AiGatewayService {
  private geminiClient: GoogleGenAI | null = null;

  constructor() {
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.trim() !== '') {
      this.geminiClient = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
    }
  }

  /**
   * Generates a complete Hungarian -> English contrastive learning pack
   */
  async generateLearningPack(params: {
    topic: string;
    cefr: CefrLevel;
    zone?: ZoneType | string;
    customFocus?: string;
  }): Promise<LearningPackGenerationDto> {
    const { topic, cefr, zone = ZoneType.IT, customFocus = 'Comprehensive Field Guide' } = params;

    const systemPrompt = `You are an elite linguistic architect specializing in contrastive Hungarian -> English language acquisition for CEFR level ${cefr}.
Your mission is to generate a comprehensive, structured expedition learning pack for Hungarian native speakers learning English on the topic "${topic}" in the zone "${zone}".

CRITICAL PEDAGOGICAL RULES (L1 Anchor -> L2 Target):
1. All lesson explanations, grammar notes, translations (translationHu, meaningHu, explanationHu), and prompts MUST BE IN HIGH-QUALITY NATURAL HUNGARIAN.
2. All vocabulary target terms, definitions (for B2+), collocations, example sentences, English reading body, chunks, and exercise solutions MUST BE IN AUTHENTIC NATURAL ENGLISH.
3. Contrastive Notes must highlight real "Hunglish traps" (false friends, missing prepositions, word order errors, Hungarian transfer errors).
4. Output strictly valid JSON matching the requested schema without markdown formatting or code blocks.
5. ENSURE MAXIMUM VARIETY: Every time you generate a pack, use completely different vocabulary items, unique reading scenarios, and novel exercise sentences. Do not repeat standard textbook examples. Be creative and highly varied!`;

    const userPrompt = `Generate a LearningPack JSON for:
Topic: "${topic}"
CEFR: "${cefr}"
Zone: "${zone}"
Focus: "${customFocus}"
Generation ID/Seed: "${Date.now()}-${Math.random().toString(36).substring(7)}"

Ensure at least:
- 1 detailed Lesson in Hungarian with English embedded examples.
- 4-6 Vocabulary items with collocations & examples.
- 3-4 Chunks (fixed collocations/idiomatic phrases).
- 2-3 Contrastive Notes (Hunglish traps with Hungarian explanations).
- 4-5 Exercises (including CLOZE, TRANSLATION_HU_TO_EN, MULTIPLE_CHOICE).
- 1 Authentic Reading material with 2-3 comprehension questions.
- 1 Writing prompt in Hungarian asking for an English short essay.`;

    if (this.geminiClient) {
      for (const model of [env.GEMINI_PRIMARY_MODEL, env.GEMINI_FALLBACK_MODEL]) {
        try {
          const response = await this.geminiClient.models.generateContent({
            model,
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\n${userPrompt}\n\nRespond ONLY with a valid JSON object.` }] },
            ],
            config: {
              responseMimeType: 'application/json',
              temperature: 0.9,
            },
          });

          const rawText = response.text || '';
          const parsed = JSON.parse(rawText);
          return LearningPackGenerationSchema.parse(parsed);
        } catch (err) {
          console.warn(`Gemini model "${model}" failed for generateLearningPack, trying next:`, err);
        }
      }
    }
    throw new Error('Hiba történt a generálás során. Kérlek ellenőrizd az API kulcsot vagy próbáld újra később.');
  }

  /**
   * Evaluates an English essay with contrastive Hungarian explanations
   */
  async evaluateWriting(params: {
    promptText: string;
    submittedText: string;
    targetCefr?: CefrLevel;
  }): Promise<WritingFeedbackDto> {
    const { promptText, submittedText, targetCefr = CefrLevel.B2 } = params;

    const systemPrompt = `You are a senior English language examiner evaluating an essay written by a Hungarian native speaker targeting CEFR ${targetCefr}.
Prompt: "${promptText}"
Student's English Submission:
"""
${submittedText}
"""

Evaluate the submission and produce a structured JSON with:
- score: 0 to 100 integer
- overallAssessmentHu: A thoughtful 2-4 sentence summary in Hungarian analyzing fluency, grammar, and vocabulary range.
- errors: Array of identified errors, each with:
    - original: exact substring from student's text
    - replacement: natural English correction
    - explanationHu: Clear explanation in Hungarian of why this is incorrect
    - ruleHu: The grammatical or lexical rule in Hungarian (e.g. "Prepozíció használata", "Igeidő egyeztetés", "Hunglish szórend")
- positives: Array of 2-4 strong expressions or grammar constructs the student used well
- suggestedCefr: One of ["A1","A2","B1","B2","C1","C2"]

Respond ONLY with valid JSON.`;

    if (this.geminiClient) {
      for (const model of [env.GEMINI_PRIMARY_MODEL, env.GEMINI_FALLBACK_MODEL]) {
        try {
          const response = await this.geminiClient.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            config: {
              responseMimeType: 'application/json',
            },
          });

          const rawText = response.text || '';
          const parsed = JSON.parse(rawText);
          return WritingFeedbackSchema.parse(parsed);
        } catch (err) {
          console.warn(`Gemini model "${model}" failed for evaluateWriting, trying next:`, err);
        }
      }
    }
    throw new Error('Hiba történt az értékelés során. Kérlek ellenőrizd az API kulcsot vagy próbáld újra később.');
  }

  /**
   * Generic method to call the AI provider for a text/JSON prompt.
   */
  async generateText(prompt: string): Promise<string> {
    if (!this.geminiClient) {
      throw new Error('AI Provider is not configured (Missing API Key)');
    }

    for (const model of [env.GEMINI_PRIMARY_MODEL, env.GEMINI_FALLBACK_MODEL]) {
      try {
        const response = await this.geminiClient.models.generateContent({
          model,
          contents: [{ role: 'user', parts: [{ text: prompt }] }],
          config: {
            responseMimeType: 'application/json',
          },
        });
        return response.text || '';
      } catch (err) {
        console.warn(`Gemini model "${model}" failed for generateText, trying next:`, err);
      }
    }
    
    throw new Error('All AI models failed to generate a response.');
  }

}
