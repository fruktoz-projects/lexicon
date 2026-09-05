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
4. Output strictly valid JSON matching the requested schema without markdown formatting or code blocks.`;

    const userPrompt = `Generate a LearningPack JSON for:
Topic: "${topic}"
CEFR: "${cefr}"
Zone: "${zone}"
Focus: "${customFocus}"

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

    // High quality deterministic fallback generator conforming to Schema
    return this.getFallbackLearningPack(topic, cefr, zone, customFocus);
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

    // Pedagogical deterministic evaluation fallback
    return this.getFallbackWritingEvaluation(submittedText, targetCefr);
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

  private getFallbackLearningPack(
    topic: string,
    cefr: CefrLevel,
    zone: string,
    focus: string
  ): LearningPackGenerationDto {
    return {
      title: `${topic} — Expedition Master Pack`,
      cefr: cefr,
      topic: zone,
      focus: focus,
      estimatedMinutes: 25,
      lesson: {
        title: `${topic}: Elméleti Áttekintés és Tipikus Hunglish Csapdák`,
        contentMd: `# ${topic} — Szakmai Útmutató (${cefr})\n\nA modern szakmai és hétköznapi kommunikációban a(z) **${topic}** témakör megkerülhetetlen. A magyar anyanyelvű tanulók leggyakrabban a szó szerinti tükörfordítások (*false friends*) és a hiányzó vagy hibás vonzatok (*prepositions*) miatt vétenek hibákat.\n\n### Fő Alapelvek:\n1. **Kollokációk használata:** Mindig kifejezéscsomagokban (*chunks*) tanuljunk, ne elszigetelt szavakban.\n2. **Igei vonzatok rögzítése:** Például magyarul *„részt venni valamiben”* $\\rightarrow$ angolul *„participate in something”* vagy *„take part in”*.\n3. **Professzionális regiszter:** Törekedjünk a CEFR ${cefr} szintű választékos kifejezésmódra!`,
      },
      vocabulary: [
        {
          term: 'streamline',
          phonetics: '/ˈstriːm.laɪn/',
          translationHu: 'áramvonalasít, egyszerűsít, hatékonyabbá tesz',
          definitionEn: 'To make an organization, process, or system more effective by simplifying it.',
          collocations: ['streamline the process', 'streamline operations', 'streamline communication'],
          examples: ['We need to streamline the deployment workflow to save developer hours.'],
        },
        {
          term: 'bottleneck',
          phonetics: '/ˈbɒt.əl.nek/',
          translationHu: 'szűk keresztmetszet, akadály',
          definitionEn: 'A point of congestion in a system that occurs when workload arrives too quickly.',
          collocations: ['identify a bottleneck', 'eliminate bottlenecks', 'performance bottleneck'],
          examples: ['Database query latency is the primary bottleneck in our current architecture.'],
        },
        {
          term: 'mitigate',
          phonetics: '/ˈmɪt.ɪ.ɡeɪt/',
          translationHu: 'mérsékel, enyhít, csökkent (kockázatot/kárt)',
          definitionEn: 'To make something less severe, harmful, or painful.',
          collocations: ['mitigate risks', 'mitigate the impact', 'mitigate vulnerability'],
          examples: ['Implementing automated tests will mitigate the risk of regressions.'],
        },
        {
          term: 'feasibility',
          phonetics: '/ˌfiː.zəˈbɪl.ə.ti/',
          translationHu: 'megvalósíthatóság, életképesség',
          definitionEn: 'The state or degree of being easily or conveniently done.',
          collocations: ['feasibility study', 'assess the feasibility', 'technical feasibility'],
          examples: ['We conducted a feasibility study before committing to the cloud migration.'],
        },
      ],
      chunks: [
        {
          phrase: 'bring to the table',
          meaningHu: 'hozzáadni az értékhez / képességet nyújtani',
          contextSentence: 'Her extensive backend experience is exactly what she brings to the table.',
        },
        {
          phrase: 'get the ball rolling',
          meaningHu: 'elindítani a folyamatot / beindítani a dolgokat',
          contextSentence: 'Let us schedule a quick sync to get the ball rolling on this initiative.',
        },
        {
          phrase: 'keep someone in the loop',
          meaningHu: 'folyamatosan tájékoztatni valakit / képben tartani',
          contextSentence: 'Please keep the stakeholders in the loop regarding timeline adjustments.',
        },
      ],
      contrastiveNotes: [
        {
          hunglishTrap: 'according to me',
          correctUsage: 'in my opinion / from my perspective',
          explanationHu: 'Az „according to” kifejezést külső forrásokra, szakértőkre vagy adatokra használjuk (pl. „according to the report”), önmagunkra helytelen.',
        },
        {
          hunglishTrap: 'responsible for do something',
          correctUsage: 'responsible for doing something',
          explanationHu: 'A „for” prepozíció után mindig -ing végződésű igealak (gerund) következik!',
        },
      ],
      exercises: [
        {
          type: ExerciseType.CLOZE,
          prompt: 'Válaszd ki a mondatba illő helyes szakkifejezést:',
          payload: {
            sentenceWithGap: 'Automated CI/CD pipelines help us _______ the release cycle and reduce human errors.',
            options: ['streamline', 'mitigate', 'bottleneck', 'feasibility'],
          },
          solution: 'streamline',
        },
        {
          type: ExerciseType.TRANSLATION_HU_TO_EN,
          prompt: 'Fordítsd le a kifejezést angolra (ügyelj a vonzatra!):',
          payload: {
            sourceHu: 'csökkenteni a kockázatokat',
            hints: ['mitigate', 'risks'],
          },
          solution: 'mitigate the risks',
        },
        {
          type: ExerciseType.CLOZE,
          prompt: 'Egészítsd ki a hiányzó kifejezéssel:',
          payload: {
            sentenceWithGap: 'Please keep everyone _______ regarding any architectural changes.',
            options: ['in the loop', 'bring to table', 'on the ball', 'out of line'],
          },
          solution: 'in the loop',
        },
        {
          type: ExerciseType.MULTIPLE_CHOICE,
          prompt: 'Melyik a nyelvtanilag helyes forma a véleménykifejezésre?',
          payload: {
            question: 'Which phrase is natural and correct for expressing personal viewpoint?',
            options: ['In my opinion', 'According to me', 'By my opinion', 'As my mind'],
          },
          solution: 'In my opinion',
        },
      ],
      reading: {
        title: `Strategic Agility and Engineering Excellence in ${topic}`,
        bodyText: `In fast-paced modern environments, technical excellence alone is insufficient without transparent communication and streamlined workflows. High-performing teams continuously identify operational bottlenecks, conduct rigorous feasibility studies before major architectural shifts, and actively mitigate systemic risks. Crucially, keeping cross-functional stakeholders in the loop ensures collective alignment and accelerates decision-making cycles.`,
        questions: [
          {
            question: 'What is essential alongside technical excellence?',
            options: ['Transparent communication & streamlined workflows', 'Working overtime', 'Ignoring bottlenecks', 'Eliminating all testing'],
            answer: 'Transparent communication & streamlined workflows',
          },
          {
            question: 'Why is keeping stakeholders in the loop beneficial according to the text?',
            options: ['It accelerates decision-making cycles and ensures alignment', 'It replaces technical documentation', 'It stops code reviews', 'It eliminates all costs'],
            answer: 'It accelerates decision-making cycles and ensures alignment',
          },
        ],
      },
      writingPrompt: `Írj egy 5-8 mondatos angol összefoglalót arról, hogyan segít a folyamatok egyszerűsítése (streamlining) és a kockázatok enyhítése (mitigating risks) a sikeres projektátadásban.`,
    };
  }

  private getFallbackWritingEvaluation(submittedText: string, targetCefr: CefrLevel): WritingFeedbackDto {
    const textLower = submittedText.toLowerCase();
    const errors: WritingFeedbackDto['errors'] = [];
    const positives: string[] = [];

    // Detect common Hungarian traps
    if (textLower.includes('according to me')) {
      errors.push({
        original: 'according to me',
        replacement: 'in my opinion / from my perspective',
        explanationHu: 'Az „according to me” tipikus hunglish tükörfordítás. Használj inkább „In my opinion”-t vagy „From my point of view”-t.',
        ruleHu: 'Véleménykifejezés és külső forrás hivatkozás szabálya',
      });
    }

    if (textLower.includes('make a research') || textLower.includes('made a research')) {
      errors.push({
        original: 'make a research',
        replacement: 'conduct research / do research',
        explanationHu: 'A „research” nem számlálható főnév és a „do/conduct” igével kollokál, nem a „make”-kel.',
        ruleHu: 'Megszámlálhatatlan főnevek és igei kollokációk',
      });
    }

    if (textLower.includes('information are') || textLower.includes('informations')) {
      errors.push({
        original: 'informations',
        replacement: 'information is',
        explanationHu: 'Az „information” angolban mindig egyes számú és megszámlálhatatlan!',
        ruleHu: 'Megszámlálhatatlan főnevek egyeztetése',
      });
    }

    if (textLower.includes('responsible for do')) {
      errors.push({
        original: 'responsible for do',
        replacement: 'responsible for doing',
        explanationHu: 'A „for” prepozíció után mindig -ing végződésű gerund áll.',
        ruleHu: 'Prepozíció + Gerund szabály',
      });
    }

    if (submittedText.length > 100) {
      positives.push('Kiváló mondathosszúság és gondolati tagolás.');
    }
    if (textLower.includes('however') || textLower.includes('furthermore') || textLower.includes('therefore')) {
      positives.push('Dicséretes kötőszó-használat (linking words), ami emeli a szöveg koherenciáját.');
    }
    if (textLower.includes('streamline') || textLower.includes('mitigate') || textLower.includes('essential')) {
      positives.push('Gazdag, B2/C1 szintű szakmai szókincs.');
    }

    const calculatedScore = Math.max(50, Math.min(95, 88 - errors.length * 8 + (positives.length > 1 ? 5 : 0)));

    return {
      score: calculatedScore,
      overallAssessmentHu: `Az írásbeli kifejezőkészséged stabil alapokat mutat, a gondolatmenet jól követhető. Néhány kifejezésbeli finomhangolással és a magyar tükörfordítások elkerülésével a szöveged elérheti a magas szintű (${targetCefr}) természetességet.`,
      errors,
      positives: positives.length > 0 ? positives : ['Jó strukturált mondatfelépítés', 'Megfelelő témaköri szókincs'],
      suggestedCefr: calculatedScore >= 80 ? targetCefr : CefrLevel.B1,
    };
  }
}
