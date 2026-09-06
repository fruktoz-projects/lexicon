import { GoogleGenAI } from '@google/genai';
import {
  CefrLevel,
  LearningPackGenerationDto,
  LearningPackGenerationSchema,
  WritingFeedbackDto,
  WritingFeedbackSchema,
  ZoneType,
} from '@lexicon/types';
import { env } from '../config/env';

/**
 * Normalizes the raw AI JSON to coerce common Gemini mismatches before Zod validation.
 */
function normalizeLearningPackJson(raw: any): any {
  if (!raw || typeof raw !== 'object') return raw;

  if (Array.isArray(raw.exercises)) {
    raw.exercises = raw.exercises.map((ex: any) => {
      if (typeof ex.payload === 'string') {
        try { ex.payload = JSON.parse(ex.payload); } catch { ex.payload = { raw: ex.payload }; }
      }
      if (ex.payload === null || ex.payload === undefined) ex.payload = {};
      if (typeof ex.solution !== 'string') ex.solution = JSON.stringify(ex.solution ?? '');
      if (typeof ex.type === 'string') ex.type = ex.type.toUpperCase().replace(/ /g, '_');

      // Normalize CLOZE payload: map 'sentence' -> 'sentenceWithGap' for frontend compatibility
      if (ex.type === 'CLOZE' && ex.payload.sentence && !ex.payload.sentenceWithGap) {
        ex.payload.sentenceWithGap = ex.payload.sentence;
      }

      // Normalize MATCHING payload: convert string[][] -> MatchingPair[]
      if (ex.type === 'MATCHING' && Array.isArray(ex.payload.pairs)) {
        const rawPairs = ex.payload.pairs;
        if (rawPairs.length > 0 && Array.isArray(rawPairs[0])) {
          // AI returned [["English", "Magyar"], ...] format
          ex.payload.pairs = rawPairs.map((pair: string[], idx: number) => ({
            id: `pair_${idx}`,
            left: pair[0] || '',
            right: pair[1] || '',
          }));
        } else if (rawPairs.length > 0 && typeof rawPairs[0] === 'object' && !rawPairs[0].id) {
          // Has objects but no id field
          ex.payload.pairs = rawPairs.map((pair: any, idx: number) => ({
            id: `pair_${idx}`,
            left: pair.left || pair.english || pair.en || '',
            right: pair.right || pair.hungarian || pair.hu || '',
          }));
        }
      }


      return ex;
    });
  }

  if (Array.isArray(raw.vocabulary)) {
    raw.vocabulary = raw.vocabulary.map((v: any) => {
      if (!Array.isArray(v.collocations)) v.collocations = [];
      if (!Array.isArray(v.examples)) v.examples = typeof v.examples === 'string' ? [v.examples] : [];
      if (!v.translationHu && v.translation) v.translationHu = v.translation;
      if (!v.translationHu && v.meaningHu) v.translationHu = v.meaningHu;
      if (!v.translationHu) v.translationHu = v.term;
      return v;
    });
  }

  if (Array.isArray(raw.chunks)) {
    raw.chunks = raw.chunks.map((c: any) => {
      if (!c.meaningHu && c.meaning) c.meaningHu = c.meaning;
      if (!c.meaningHu && c.translationHu) c.meaningHu = c.translationHu;
      if (!c.contextSentence && c.example) c.contextSentence = c.example;
      if (!c.contextSentence && c.exampleSentence) c.contextSentence = c.exampleSentence;
      if (!c.contextSentence) c.contextSentence = c.phrase;
      return c;
    });
  }

  if (Array.isArray(raw.contrastiveNotes)) {
    raw.contrastiveNotes = raw.contrastiveNotes.map((n: any) => {
      if (!n.hunglishTrap && n.trap) n.hunglishTrap = n.trap;
      if (!n.hunglishTrap && n.incorrect) n.hunglishTrap = n.incorrect;
      if (!n.correctUsage && n.correct) n.correctUsage = n.correct;
      if (!n.correctUsage && n.correction) n.correctUsage = n.correction;
      if (!n.explanationHu && n.explanation) n.explanationHu = n.explanation;
      return n;
    });
  }

  if (raw.reading && typeof raw.reading === 'object') {
    if (!raw.reading.bodyText && raw.reading.body) raw.reading.bodyText = raw.reading.body;
    if (!raw.reading.bodyText && raw.reading.text) raw.reading.bodyText = raw.reading.text;
    if (Array.isArray(raw.reading.questions)) {
      raw.reading.questions = raw.reading.questions.map((q: any) => {
        if (typeof q.answer !== 'string') q.answer = String(q.answer ?? '');
        if (Array.isArray(q.options)) {
          q.options = q.options.map((o: any) => (typeof o === 'string' ? o : JSON.stringify(o)));
        }
        return q;
      });
    }
  }

  return raw;
}

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

    const prompt = `You are an elite linguistic architect specializing in contrastive Hungarian -> English language acquisition for CEFR level ${cefr}.
Generate a comprehensive learning pack for Hungarian native speakers learning English.
Topic: "${topic}" | Zone: "${zone}" | Focus: "${customFocus}" | CEFR: "${cefr}"
Seed: "${Date.now()}-${Math.random().toString(36).substring(7)}"

RULES:
1. Hungarian-facing fields (translationHu, meaningHu, explanationHu, hunglishTrap, correctUsage) MUST be in natural Hungarian.
2. English-facing fields (term, examples, collocations, bodyText, solution) MUST be in authentic English.
3. Highlight real Hunglish traps in contrastiveNotes.
4. MAXIMUM VARIETY — never repeat textbook examples, always use fresh creative sentences.
5. Each vocabulary item MUST have at least 3 collocations and 2 example sentences.

Respond with ONLY a valid JSON object (no markdown, no code blocks) with this exact shape:
{
  "title": "string",
  "cefr": "${cefr}",
  "topic": "string",
  "focus": "string",
  "estimatedMinutes": number,
  "lesson": { "title": "string", "contentMd": "string (min 300 chars, in Hungarian with embedded English examples, use markdown headings and bullet points)" },
  "vocabulary": [
    { "term": "string", "phonetics": "string (IPA)", "translationHu": "string (REQUIRED, Hungarian)", "definitionEn": "string (English definition)", "collocations": ["string1", "string2", "string3", "string4"], "examples": ["English sentence 1", "English sentence 2"] }
  ],
  "chunks": [
    { "phrase": "string (fixed English phrase/idiom)", "meaningHu": "string (REQUIRED, Hungarian)", "contextSentence": "string (REQUIRED, full English sentence using the phrase)" }
  ],
  "contrastiveNotes": [
    { "hunglishTrap": "string (REQUIRED, the typical Hungarian error in English)", "correctUsage": "string (REQUIRED, the correct English form)", "explanationHu": "string (REQUIRED, explanation in Hungarian why the error occurs)" }
  ],
  "exercises": [
    {
      "type": "CLOZE or MULTIPLE_CHOICE or MATCHING or TRANSLATION_HU_TO_EN or TRANSLATION_EN_TO_HU",
      "prompt": "string (instruction in Hungarian)",
      "payload": { "key": "value" },
      "solution": "plain text string (NEVER an object or array)"
    }
  ],
  "reading": {
    "title": "string",
    "bodyText": "string (min 200 chars authentic English text with topic-relevant vocabulary)",
    "questions": [ { "question": "string", "options": ["string1","string2","string3","string4"], "answer": "string (must exactly match one of the options)" } ]
  },
  "writingPrompt": "string (instruction in Hungarian, asking for a 100-150 word English essay using vocabulary from this pack)"
}

IMPORTANT payload formats:
- CLOZE: {"sentence": "The ___ is critical for performance", "blank": "correct word", "options": ["word1","word2","word3","word4"]}
- MULTIPLE_CHOICE: {"options": ["A) ...","B) ...","C) ...","D) ..."]}
- MATCHING: {"pairs": [["English phrase 1","Magyar fordítás 1"],["English phrase 2","Magyar fordítás 2"],["English phrase 3","Magyar fordítás 3"],["English phrase 4","Magyar fordítás 4"]]}
- TRANSLATION_HU_TO_EN: {"sourceHu": "Hungarian text to translate", "hint": "optional grammar hint"}
- TRANSLATION_EN_TO_HU: {"sourceEn": "English text to translate", "hint": "optional hint"}

MINIMUM REQUIREMENTS (strictly enforced):
- vocabulary: MINIMUM 8 items (target 10), each with 3-4 collocations
- chunks: MINIMUM 6 items (target 8)
- contrastiveNotes: MINIMUM 5 items (target 6)
- exercises: MINIMUM 8 items (target 10), must include at least: 2x CLOZE, 2x MULTIPLE_CHOICE, 1x MATCHING, 2x TRANSLATION_HU_TO_EN, 1x TRANSLATION_EN_TO_HU
- reading.questions: MINIMUM 3 questions`;

    if (this.geminiClient) {
      for (const model of [env.GEMINI_PRIMARY_MODEL, env.GEMINI_FALLBACK_MODEL]) {
        try {
          const response = await this.geminiClient.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: { responseMimeType: 'application/json', temperature: 0.85 },
          });

          const rawText = response.text || '';
          let parsed: any;
          try {
            parsed = JSON.parse(rawText);
          } catch (jsonErr) {
            console.warn(`[AI Gateway] JSON parse failed for model "${model}":`, jsonErr);
            continue;
          }

          const normalized = normalizeLearningPackJson(parsed);
          const result = LearningPackGenerationSchema.safeParse(normalized);

          if (result.success) {
            return result.data;
          }

          console.warn(
            `[AI Gateway] Zod validation failed for model "${model}":`,
            JSON.stringify(result.error.issues.map(i => ({ path: i.path.join('.'), msg: i.message })), null, 2)
          );
        } catch (err) {
          console.warn(`[AI Gateway] model "${model}" request failed:`, err);
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

Return ONLY valid JSON (no markdown) with:
- score: integer 0-100
- overallAssessmentHu: string (2-4 sentences in Hungarian)
- errors: array of { original: string, replacement: string, explanationHu: string, ruleHu: string }
- positives: string[] (2-4 items)
- suggestedCefr: one of ["A1","A2","B1","B2","C1","C2"]`;

    if (this.geminiClient) {
      for (const model of [env.GEMINI_PRIMARY_MODEL, env.GEMINI_FALLBACK_MODEL]) {
        try {
          const response = await this.geminiClient.models.generateContent({
            model,
            contents: [{ role: 'user', parts: [{ text: systemPrompt }] }],
            config: { responseMimeType: 'application/json' },
          });

          const rawText = response.text || '';
          const parsed = JSON.parse(rawText);
          return WritingFeedbackSchema.parse(parsed);
        } catch (err) {
          console.warn(`[AI Gateway] model "${model}" failed for evaluateWriting:`, err);
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
          config: { responseMimeType: 'application/json' },
        });
        return response.text || '';
      } catch (err) {
        console.warn(`[AI Gateway] model "${model}" failed for generateText:`, err);
      }
    }

    throw new Error('All AI models failed to generate a response.');
  }

}
