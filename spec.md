Markdown# Lexicon: English Expedition Log — Technical Specification & Architecture

- **Version:** 1.3 (HU $\rightarrow$ EN Specialized Expedition Architecture)
- **Status:** Approved Implementation Plan
- **Primary Design Paradigm:** Tactical Field Guide / Lexical Approach (HU Native $\rightarrow$ EN Target)
- **Linguistic Focus:** Contrastive learning (Hunglish error pattern elimination, chunk-based acquisition, L1 $\rightarrow$ L2 active recall)

---

## 1. Product Philosophy & Expedition Design System

The system abandons generic AI wrapper clichés (sparkles, floating chatbot widgets, neon glows). It is designed as an intellectual, tactile **Expedition Field Guide** tailored specifically for Hungarian native speakers learning English.

### 1.1 Pedagogical Foundation: Contrastive Lexical Acquisition
- **L1 (Hungarian) as Anchor, L2 (English) as Target:** Explanations and structural nuances are framed in Hungarian for cognitive clarity, while all immersion, active production, and collocation chunks remain strictly English.
- **Hunglish Trap Prevention:** Dedicated focus on false friends (*false friends*), missing prepositions, word order collisions, and tense mismatches specific to Hungarian learners.
- **Chunk-Based Lexical Memory:** Emphasis on fixed collocations and phrases over isolated words.

### 1.2 Visual Tokens & Color Palette
- **Pergament Background (Base Canvas):** `#F5EFE6`
- **Sepia Card / Border Surface:** `#E3DAC9`
- **Charcoal Text (Primary Ink):** `#1F2421`
- **Wax Rust / Terracotta (Primary CTA / Accent):** `#B85D3B`
- **Sage / Moss Green (SRS Success & Mastery):** `#4A6F54`
- **Muted Earth (Secondary / Neutral Indicators):** `#7A756D`

### 1.3 Typography Hierarchy
- **Headings & Storytelling:** `Newsreader` or `Lora` (Modern serif for book-like reading focus)
- **UI Elements & Controls:** `Plus Jakarta Sans`
- **CEFR, SRS Meta & Code Blocks:** `Geist Mono`

---

## 2. Technology Stack

| Layer | Technology | Architectural Role |
| :--- | :--- | :--- |
| **Monorepo Manager** | pnpm Workspaces | Multi-package structure (`apps/api`, `apps/web`, `packages/types`) |
| **Frontend Framework** | React 19 + Vite + TypeScript | Strict typing, SPA/PWA capability |
| **UI & Styling** | Tailwind CSS + shadcn/ui + Lucide | Expedition design system: Pergament, Terracotta CTA, Sage accents |
| **Client State & Cache** | TanStack Query v5 + Zustand | Server cache sync, offline session management |
| **PWA & Offline** | `vite-plugin-pwa` + Service Worker | Offline shell, instant SRS card rendering |
| **Backend Framework** | Fastify + TypeScript | High-throughput, low overhead, JSON Schema/Zod validation |
| **Database & ORM** | PostgreSQL 16 + Prisma ORM | Relational learning state, strict ACID constraints |
| **Background Job & Cache** | Redis 7 + BullMQ | Async batch pack generation, rate limiting, session store |
| **AI Gateway** | Google AI Studio (Gemini Flash) | Primary LLM via JSON Schema enforcement; OpenRouter fallback |
| **Audio / Speech** | Web Speech API + MediaRecorder | Client-side native STT/TTS with optional server fallback |
| **DevOps & Reverse Proxy** | Docker Compose + Caddy | Multi-container setup, automated SSL, internal routing |

---

## 3. Expedition Content Zones

The curriculum bridges **A2/B1 to B2/C1** across four distinct functional zones:
1. **The Everyday Port (40%):** Small talk, travel, daily routines, social interactions.
2. **The Business Quarter (25%):** Meetings, formal emails, negotiations, budgeting, client management.
3. **The IT Terminal (20%):** System architecture, bug reporting, code reviews, debugging, CI/CD, APIs.
4. **The Academic Hall (15%):** Analytical reading, essays, business informatics, structured argumentation.

---

## 4. AI Ingestion & Data Generation Contract

### 4.1 Generation Philosophy: Offline & Deterministic First
- **Batch Generation:** AI is called exclusively when creating a new `LearningPack` or deep-evaluating a `WritingSubmission`.
- **Zero-AI Daily Practice:** Practice sessions pull directly from normalized PostgreSQL records via an SRS algorithm (0 token cost).
- **L1/L2 Rule for LLM Prompts:** Lesson explanations, vocabulary meanings, and writing feedback explanations **must be in Hungarian**, while vocabulary terms, example sentences, exercises, and reading texts **must be in authentic English**.

### 4.2 Structured Ingestion JSON Schema (HU $\rightarrow$ EN Optimized)

```json
{
  "title": "Docker & Containerization Essentials",
  "cefr": "B2",
  "topic": "IT",
  "estimatedMinutes": 30,
  "lesson": {
    "title": "Konténerek és virtuális gépek összehasonlítása",
    "contentMd": "# Bevezetés a konténerizációba\nA virtuális gépekkel ellentétben a konténerek nem igényelnek külön vendég operációs rendszert..."
  },
  "vocabulary": [
    {
      "term": "orchestration",
      "phonetics": "/ˌɔː.kɪˈstreɪ.ʃən/",
      "translationHu": "vezénylés, automatizált koordináció",
      "definitionEn": "Automated configuration, coordination, and management of computer systems.",
      "collocations": ["container orchestration", "orchestration tool"],
      "examples": ["Kubernetes is widely used for container orchestration."]
    }
  ],
  "chunks": [
    {
      "phrase": "spin up a container",
      "meaningHu": "gyorsan elindítani egy konténert",
      "contextSentence": "We can spin up a new Redis container in seconds using Docker Compose."
    }
  ],
  "contrastiveNotes": [
    {
      "hunglishTrap": "running from Docker",
      "correctUsage": "running in Docker / running on Docker",
      "explanationHu": "Magyarul azt mondjuk 'Dockerből fut', de angolban 'in' vagy 'on' prepozíciót használunk."
    }
  ],
  "exercises": [
    {
      "type": "CLOZE",
      "prompt": "Egészítsd ki a hiányzó szóval a mondatot:",
      "payload": {
        "sentenceWithGap": "Docker allows developers to _______ applications in isolated environments.",
        "options": ["package", "pack", "packaging", "packaged"]
      },
      "solution": "package"
    },
    {
      "type": "TRANSLATION_HU_TO_EN",
      "prompt": "Fordítsd le a kifejezést angolra:",
      "payload": {
        "sourceHu": "gyorsan elindítani egy új konténert",
        "hints": ["spin", "container"]
      },
      "solution": "spin up a new container"
    }
  ],
  "reading": {
    "title": "Why Modern DevOps Relies on Containers",
    "bodyText": "Containerization has revolutionized deployment workflows...",
    "questions": [
      {
        "question": "What is the main benefit mentioned?",
        "options": ["Speed", "Cost", "Isolation", "All of above"],
        "answer": "All of above"
      }
    ]
  },
  "writingPrompt": "Írj egy 5-8 mondatos összefoglalót angolul arról, hogy miért elengedhetetlen a konténer-vezénylés (orchestration) éles környezetben."
}
5. Database Schema (prisma/schema.prisma)Kódrészletdatasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum CefrLevel {
  A1
  A2
  B1
  B2
  C1
  C2
}

enum ExerciseType {
  CLOZE
  MULTIPLE_CHOICE
  MATCHING
  TRANSLATION_HU_TO_EN
  TRANSLATION_EN_TO_HU
}

model User {
  id                 String              @id @default(uuid())
  email              String              @unique
  passwordHash       String
  targetCefr         CefrLevel           @default(B2)
  currentCefr        CefrLevel           @default(A2)
  streakDays         Int                 @default(0)
  lastActiveAt       DateTime?
  progressEntries    UserProgress[]
  mistakeLogs        MistakeLog[]
  writingSubmissions WritingSubmission[]
  createdAt          DateTime            @default(now())
  updatedAt          DateTime            @updatedAt
}

model LearningPack {
  id               String            @id @default(uuid())
  title            String
  cefr             CefrLevel
  topic            String            // "IT", "Business", "Everyday", "Academic"
  focus            String
  estimatedMinutes Int
  rawJson          Json
  lessons          Lesson[]
  vocabulary       VocabularyItem[]
  chunks           Chunk[]
  contrastiveNotes ContrastiveNote[]
  exercises        Exercise[]
  readingMaterials ReadingMaterial[]
  createdAt        DateTime          @default(now())
}

model Lesson {
  id        String       @id @default(uuid())
  packId    String
  pack      LearningPack @relation(fields: [packId], references: [id], onDelete: Cascade)
  title     String
  contentMd String       // Hungarian explanations with embedded English examples
  createdAt DateTime     @default(now())
}

model VocabularyItem {
  id            String       @id @default(uuid())
  packId        String
  pack          LearningPack @relation(fields: [packId], references: [id], onDelete: Cascade)
  term          String       // Target English term
  phonetics     String?
  translationHu String       // Hungarian meaning
  definitionEn  String?      // English definition for B2+ levels
  collocations  String[]
  examples      String[]
  createdAt     DateTime     @default(now())
}

model Chunk {
  id              String       @id @default(uuid())
  packId          String
  pack            LearningPack @relation(fields: [packId], references: [id], onDelete: Cascade)
  phrase          String       // Target English chunk
  meaningHu       String       // Hungarian translation
  contextSentence String       // English context sentence
  createdAt       DateTime     @default(now())
}

model ContrastiveNote {
  id            String       @id @default(uuid())
  packId        String
  pack          LearningPack @relation(fields: [packId], references: [id], onDelete: Cascade)
  hunglishTrap  String       // Common Hungarian error pattern
  correctUsage  String       // Correct English usage
  explanationHu String       // Hungarian grammatical/cultural note
  createdAt     DateTime     @default(now())
}

model Exercise {
  id        String       @id @default(uuid())
  packId    String
  pack      LearningPack @relation(fields: [packId], references: [id], onDelete: Cascade)
  type      ExerciseType
  prompt    String       // Instructions in Hungarian or English
  payload   Json         // Options, gap-fill sentences, or hints
  solution  String       // Correct English answer
  mistakes  MistakeLog[]
  createdAt DateTime     @default(now())
}

model ReadingMaterial {
  id        String       @id @default(uuid())
  packId    String
  pack      LearningPack @relation(fields: [packId], references: [id], onDelete: Cascade)
  title     String
  bodyText  String       // Authentic English reading text
  questions Json         // Reading comprehension questions
  createdAt DateTime     @default(now())
}

model UserProgress {
  id            String    @id @default(uuid())
  userId        String
  user          User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  itemType      String    // "VOCAB", "CHUNK", "EXERCISE"
  itemId        String
  srsStage      Int       @default(0) // 0: New, 1-5: Intervals (1d, 3d, 7d, 14d, 30d)
  consecutiveOk Int       @default(0)
  totalAttempts Int       @default(0)
  nextReviewAt  DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@unique([userId, itemType, itemId])
}

model MistakeLog {
  id         String   @id @default(uuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  exerciseId String
  exercise   Exercise @relation(fields: [exerciseId], references: [id], onDelete: Cascade)
  userAnswer String
  createdAt  DateTime @default(now())
}

model WritingSubmission {
  id            String   @id @default(uuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  promptText    String
  submittedText String
  aiScore       Int?
  aiFeedback    Json     // Format: { errors: [{ original: string, replacement: string, explanationHu: string, ruleHu: string }] }
  createdAt     DateTime @default(now())
}
6. REST API ContractsMethod & RouteAuthDescriptionPOST /api/v1/auth/registerPublicRegister user, hash password (Argon2), set target CEFR.POST /api/v1/auth/loginPublicVerify credentials, return signed JWT.GET /api/v1/auth/meJWTGet user profile, streak, current & target CEFR.POST /api/v1/admin/generate-packJWTTrigger LLM generation with HU $\rightarrow$ EN pedagogical prompts, validate Zod schema, persist pack via $transaction.GET /api/v1/learning-packsJWTList available packs filtered by Zone (topic) and CEFR level.GET /api/v1/practice/sessionJWTAssemble SRS session (due items + mistake log queue + new items).POST /api/v1/practice/submitJWTEvaluate answer deterministically; step SRS interval (1, 3, 7, 14, 30 days).POST /api/v1/writing/evaluateJWTEvaluate English essay via Gemini Flash; return inline error highlights and Hungarian feedback (explanationHu).GET /api/v1/analytics/overviewJWTRetrieve mastery metrics, learned chunks, and mistake patterns.7. Implementation Roadmap & Definition of Done (DoD)Phase 1: Architecture, Monorepo & Database ScaffoldTasks:Setup pnpm workspace (apps/api, apps/web, packages/types).Create root docker-compose.yml with PostgreSQL 16 and Redis 7.Apply Prisma schema migrations and seed initial test users/packs with Hungarian $\rightarrow$ English mock data (seed.ts).DoD: docker compose up -d runs clean, npx prisma migrate dev succeeds, pnpm typecheck outputs 0 errors.Phase 2: Backend Core, Auth & AI GatewayTasks:Initialize Fastify with CORS, Helmet, JWT auth plugin, and Swagger docs.Implement /auth/register, /auth/login, /auth/me.Build AiGatewayService using @google/genai (Gemini Flash) with OpenRouter fallback.DoD: JWT authentication integration tests pass, AI gateway returns valid JSON matching the schema.Phase 3: Content Ingestion Pipeline (HU $\rightarrow$ EN Specialized)Tasks:Implement Zod schema validation matching LearningPackGenerationSchema (including translationHu, meaningHu, contrastiveNotes).Create pedagogical system prompts enforcing Hungarian explanations and contrastive Hunglish rules.Expose POST /api/v1/admin/generate-pack with atomic database insertion across all tables.DoD: Generating a pack creates related records across all child tables in a single transaction with verified Hungarian translations.Phase 4: Deterministic SRS Practice EngineTasks:Build GET /api/v1/practice/session query logic prioritizing nextReviewAt <= NOW().Implement POST /api/v1/practice/submit supporting TRANSLATION_HU_TO_EN and CLOZE evaluation with SRS interval stepping.Build POST /api/v1/writing/evaluate returning Hungarian grammar/lexical corrections (explanationHu).DoD: Submitting an answer increments streak and correctly reschedules nextReviewAt without invoking AI.Phase 5: Frontend Scaffold & Expedition Design SystemTasks:Setup Vite + React 19 + TypeScript + Tailwind CSS.Configure Expedition theme tokens (#F5EFE6, #B85D3B, #4A6F54, typography).Setup TanStack Query, Zustand store, Axios interceptors, and PWA manifest.DoD: UI shell loads with custom styling, offline PWA installs properly, font styles render correctly.Phase 6: Frontend Feature ModulesTasks:Dashboard: Waypoint timeline, active zone cards, streak counter.Session Builder: CEFR & zone selection modal.Practice Engine: Keyboard-driven (1-4, Enter), zero-chatbot UI, tactile feedback, HU $\rightarrow$ EN translation cards.Writing Lab: Dual-pane editor with crossed-out text corrections and Hungarian margin explanations.DoD: End-to-end user loop completed (select pack -> run practice session -> submit essay -> view analytics).8. Deployment Architecture (docker-compose.prod.yml)app-api: Node.js Fastify backend (Port 3000, internal network).app-web: Caddy serving optimized React PWA build.postgres: PostgreSQL 16 with persistent volume.redis: Redis 7 for rate limiting and BullMQ queues.caddy: Reverse proxy handling SSL termination and routing /api/* to backend.