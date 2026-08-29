import { PrismaClient, CefrLevel, ExerciseType } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

async function main() {
  console.log('🌱 Starting Lexicon Expedition Database Seeding...');

  // 1. Clean existing records
  await prisma.writingSubmission.deleteMany();
  await prisma.mistakeLog.deleteMany();
  await prisma.userProgress.deleteMany();
  await prisma.readingMaterial.deleteMany();
  await prisma.exercise.deleteMany();
  await prisma.contrastiveNote.deleteMany();
  await prisma.chunk.deleteMany();
  await prisma.vocabularyItem.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.learningPack.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Expedition Test User
  const demoUser = await prisma.user.create({
    data: {
      email: 'expedition@lexicon.hu',
      passwordHash: hashPassword('password123'),
      targetCefr: CefrLevel.B2,
      currentCefr: CefrLevel.B1,
      streakDays: 7,
      lastActiveAt: new Date(),
    },
  });

  console.log(`👤 Created Demo User: ${demoUser.email} (password123)`);

  // 3. Learning Pack 1: IT Terminal - Docker & Containerization Essentials (B2)
  const itPack = await prisma.learningPack.create({
    data: {
      title: 'Docker & Containerization Essentials',
      cefr: CefrLevel.B2,
      topic: 'IT',
      focus: 'System Architecture & DevOps',
      estimatedMinutes: 30,
      rawJson: {},
      lessons: {
        create: {
          title: 'Konténerek és virtuális gépek összehasonlítása',
          contentMd: `# Bevezetés a konténerizációba\n\nA virtuális gépekkel ellentétben a konténerek nem igényelnek külön vendég operációs rendszert (*guest OS*), hanem közvetlenül a gazdagép Linux-kerneljét osztják meg izolált névterek (*namespaces*) és vezérlőcsoportok (*cgroups*) segítségével.\n\n### Miért nélkülözhetetlen az IT világban?\n- **Konzisztens környezet:** Megszünteti a hírhedt *„de nálam működött!”* (*it worked on my machine*) kifogást.\n- **Gyors indítás:** Másodpercek alatt felállíthatunk (*spin up*) új konténereket.\n- **Erőforrás-hatékonyság:** Sokkal kisebb memórialábnyom és gyorsabb skálázhatóság.`,
        },
      },
      vocabulary: {
        create: [
          {
            term: 'orchestration',
            phonetics: '/ˌɔː.kɪˈstreɪ.ʃən/',
            translationHu: 'vezénylés, automatizált koordináció',
            definitionEn: 'Automated configuration, coordination, and management of computer systems.',
            collocations: ['container orchestration', 'orchestration tool', 'orchestration workflow'],
            examples: ['Kubernetes is widely used for container orchestration in enterprise environments.'],
          },
          {
            term: 'immutable',
            phonetics: '/ɪˈmjuː.tə.bəl/',
            translationHu: 'megváltoztathatatlan, módosíthatatlan',
            definitionEn: 'Unable to be changed over time.',
            collocations: ['immutable infrastructure', 'immutable image', 'immutable deployment'],
            examples: ['Docker containers should be treated as immutable artifacts.'],
          },
          {
            term: 'overhead',
            phonetics: '/ˈəʊ.və.hed/',
            translationHu: 'többletterhelés, járulékos erőforrás-igény',
            definitionEn: 'The extra operating cost or computing power required to run a task.',
            collocations: ['low overhead', 'performance overhead', 'reduce overhead'],
            examples: ['Containers have significantly less overhead than full virtual machines.'],
          },
          {
            term: 'isolate',
            phonetics: '/ˈaɪ.sə.leɪt/',
            translationHu: 'elszigetel, elkülönít',
            definitionEn: 'To separate something from other things with which it is connected.',
            collocations: ['isolate dependencies', 'isolate processes', 'network isolation'],
            examples: ['Docker allows developers to isolate applications in sandboxed containers.'],
          },
        ],
      },
      chunks: {
        create: [
          {
            phrase: 'spin up a container',
            meaningHu: 'gyorsan elindítani / létrehozni egy konténert',
            contextSentence: 'We can spin up a new Redis container in seconds using Docker Compose.',
          },
          {
            phrase: 'out of the box',
            meaningHu: 'azonnal használatra készen, további konfiguráció nélkül',
            contextSentence: 'The official Postgres image works seamlessly out of the box.',
          },
          {
            phrase: 'single source of truth',
            meaningHu: 'hiteles központi adatforrás / egyetlen hivatkozási pont',
            contextSentence: 'The Dockerfile acts as the single source of truth for the runtime environment.',
          },
        ],
      },
      contrastiveNotes: {
        create: [
          {
            hunglishTrap: 'running from Docker',
            correctUsage: 'running in Docker / running on Docker',
            explanationHu: 'Magyarul azt mondjuk: „Dockerből fut”, de angolban az „in” vagy „on” elöljárószót használjuk!',
          },
          {
            hunglishTrap: 'compose the application',
            correctUsage: 'build / bundle the application',
            explanationHu: 'Bár a „Docker Compose” egy eszköz neve, az alkalmazás összeállítására a „build” vagy „package” igét használjuk, nem a „compose”-t.',
          },
        ],
      },
      exercises: {
        create: [
          {
            type: ExerciseType.CLOZE,
            prompt: 'Egészítsd ki a hiányzó szóval a mondatot:',
            payload: {
              sentenceWithGap: 'Docker allows developers to _______ applications in isolated environments.',
              options: ['isolate', 'isolated', 'isolating', 'isolation'],
            },
            solution: 'isolate',
          },
          {
            type: ExerciseType.TRANSLATION_HU_TO_EN,
            prompt: 'Fordítsd le a kifejezést angolra (ügyelj a vonzatra!):',
            payload: {
              sourceHu: 'gyorsan elindítani egy új konténert',
              hints: ['spin', 'container'],
            },
            solution: 'spin up a new container',
          },
          {
            type: ExerciseType.MULTIPLE_CHOICE,
            prompt: 'Melyik elöljárószó helyes a konténeres futtatásra?',
            payload: {
              question: 'The API service is currently running _______ a Docker container.',
              options: ['in', 'from', 'out', 'off'],
            },
            solution: 'in',
          },
          {
            type: ExerciseType.MATCHING,
            prompt: 'Párosítsd az angol szakkifejezéseket a magyar jelentésükkel!',
            payload: {
              pairs: [
                { id: '1', left: 'container orchestration', right: 'konténer-vezénylés' },
                { id: '2', left: 'immutable infrastructure', right: 'módosíthatatlan infrastruktúra' },
                { id: '3', left: 'out of the box', right: 'azonnal használatra készen' },
              ],
            },
            solution: '1:konténer-vezénylés,2:módosíthatatlan infrastruktúra,3:azonnal használatra készen',
          },
        ],
      },
      readingMaterials: {
        create: {
          title: 'Why Modern DevOps Relies on Containers',
          bodyText: 'Containerization has revolutionized software deployment workflows across the global technology landscape. By packaging software code together with all its runtime dependencies, libraries, and system configurations, Docker provides unprecedented consistency across development, staging, and production environments. Furthermore, container orchestration platforms like Kubernetes allow engineering teams to scale workloads dynamically with minimal operational overhead.',
          questions: [
            {
              question: 'What is the primary benefit of containerization highlighted in the passage?',
              options: ['Unprecedented consistency across all environments', 'Elimination of all coding errors', 'Free cloud hardware', 'No need for databases'],
              answer: 'Unprecedented consistency across all environments',
            },
            {
              question: 'What role do orchestration platforms like Kubernetes play?',
              options: ['They dynamically scale workloads with minimal overhead', 'They replace the Linux kernel', 'They rewrite Python into C++', 'They automate marketing'],
              answer: 'They dynamically scale workloads with minimal overhead',
            },
          ],
        },
      },
    },
  });

  // 4. Learning Pack 2: Business Quarter - High-Stakes Negotiations & Contract Nuances (B2/C1)
  const businessPack = await prisma.learningPack.create({
    data: {
      title: 'High-Stakes Negotiations & Strategic Dealmaking',
      cefr: CefrLevel.B2,
      topic: 'Business',
      focus: 'Negotiation, Legal Terms & Executive Communication',
      estimatedMinutes: 25,
      rawJson: {},
      lessons: {
        create: {
          title: 'A sikeres tárgyalási retorika és a feltételes ajánlattétel',
          contentMd: `# Tárgyalástechnika és Diplomáciai Angol\n\nÜzleti tárgyalások során a magyar szakemberek gyakran túl direktnek tűnhetnek a közvetlen fordítások miatt. Az angolszász üzleti kultúrában a finomított nyelvezet (*hedging*), a feltételes módok (*conditionals*) és a professzionális kollokációk elengedhetetlenek.\n\n### Fő Tárgyalási Stratégiák:\n- **Feltételes ajánlatok:** *„If you could expedite delivery, we would be willing to commit to a larger volume.”*\n- **Konszenzus keresése:** *„Find common ground”* ahelyett, hogy merev pozíciókba merevednénk.\n- **Kölcsönös előnyök:** *„Win-win scenario”* és *„leverage”*.`,
        },
      },
      vocabulary: {
        create: [
          {
            term: 'leverage',
            phonetics: '/ˈliː.vər.ɪdʒ/',
            translationHu: 'tárgyalási pozíció / alkualap / előny kihasználása',
            definitionEn: 'Power to influence people and get the results you want.',
            collocations: ['gain leverage', 'negotiating leverage', 'leverage expertise'],
            examples: ['Our proprietary patent gives us significant leverage in licensing talks.'],
          },
          {
            term: 'concession',
            phonetics: '/kənˈseʃ.ən/',
            translationHu: 'engedmény, kompromisszum',
            definitionEn: 'Something that is allowed or given up, often in order to end a disagreement.',
            collocations: ['make concessions', 'mutual concessions', 'seek a concession'],
            examples: ['Both parties had to make mutual concessions to finalize the contract.'],
          },
          {
            term: 'deadlock',
            phonetics: '/ˈded.lɒk/',
            translationHu: 'holtponthoz jutás, patthelyzet',
            definitionEn: 'A situation in which no progress can be made.',
            collocations: ['break the deadlock', 'reach a deadlock', 'avoid deadlock'],
            examples: ['A neutral mediator was called in to break the deadlock.'],
          },
        ],
      },
      chunks: {
        create: [
          {
            phrase: 'find common ground',
            meaningHu: 'közös nevezőt találni',
            contextSentence: 'Despite initial friction, we managed to find common ground on pricing.',
          },
          {
            phrase: 'on the table',
            meaningHu: 'napirenden lenni / tárgyalási opcióként szerepelni',
            contextSentence: 'A 15% volume discount is currently on the table.',
          },
          {
            phrase: 'bottom line',
            meaningHu: 'a lényeg / a végső eredmény / a pénzügyi nettó',
            contextSentence: 'The bottom line is that the contract must be profitable for both sides.',
          },
        ],
      },
      contrastiveNotes: {
        create: [
          {
            hunglishTrap: 'I suggest you to accept',
            correctUsage: 'I suggest that you accept / I suggest accepting',
            explanationHu: 'A „suggest” igét sosem követi közvetlen infinitív „to” szerkezettel! Helyes: „I suggest that you accept”.',
          },
          {
            hunglishTrap: 'we made an agreement with them',
            correctUsage: 'we reached an agreement with them / we entered into an agreement',
            explanationHu: 'Az üzleti angolban a megállapodás létrejöttére a „reach an agreement” kollokáció a legtermészetesebb.',
          },
        ],
      },
      exercises: {
        create: [
          {
            type: ExerciseType.CLOZE,
            prompt: 'Válaszd ki a tárgyalási kollokációt kiegészítő szót:',
            payload: {
              sentenceWithGap: 'After three hours of debate, the executives finally reached a _______ and signed.',
              options: ['compromise', 'deadlock', 'concession', 'leverage'],
            },
            solution: 'compromise',
          },
          {
            type: ExerciseType.TRANSLATION_HU_TO_EN,
            prompt: 'Fordítsd le angolra a kifejezést:',
            payload: {
              sourceHu: 'közös nevezőt találni',
              hints: ['common', 'ground'],
            },
            solution: 'find common ground',
          },
          {
            type: ExerciseType.MULTIPLE_CHOICE,
            prompt: 'Melyik a nyelvtanilag helyes javaslattétel?',
            payload: {
              question: 'Which sentence correctly uses the verb "suggest"?',
              options: [
                'I suggest that we review the contract terms.',
                'I suggest you to review the contract terms.',
                'I suggest for you to review terms.',
                'I suggest us to review terms.',
              ],
            },
            solution: 'I suggest that we review the contract terms.',
          },
        ],
      },
      readingMaterials: {
        create: {
          title: 'The Art of Principled Negotiation',
          bodyText: 'Principled negotiation focuses on separating the people from the problem, focusing on underlying interests rather than entrenched positions, and generating mutually beneficial options before reaching a verdict. Effective negotiators recognize that concessions must be calibrated strategically and that emotional composure preserves vital leverage.',
          questions: [
            {
              question: 'What is a core tenet of principled negotiation?',
              options: ['Focusing on underlying interests rather than entrenched positions', 'Intimidating the other party', 'Never agreeing to anything', 'Avoiding all contracts'],
              answer: 'Focusing on underlying interests rather than entrenched positions',
            },
          ],
        },
      },
    },
  });

  // 5. Learning Pack 3: Everyday Port - Small Talk Mastery & British Etiquette (A2/B1)
  const everydayPack = await prisma.learningPack.create({
    data: {
      title: 'Pub Culture, Social Nuances & Fluid Small Talk',
      cefr: CefrLevel.B1,
      topic: 'Everyday',
      focus: 'Social Interactions, Idioms & Conversational Agility',
      estimatedMinutes: 20,
      rawJson: {},
      lessons: {
        create: {
          title: 'Hogyan csevegjünk természetesen kínos csendek nélkül?',
          contentMd: `# A Hétköznapi Csevegés Művészete\n\nA magyar beszélők gyakran túl direkt választ adnak a formális udvariassági kérdésekre. Például a *„How do you do?”* nem a fizikai állapotod felőli érdeklődés, hanem egy formális köszöntés!\n\n### Aranyszabályok:\n- **Kérdezz vissza:** Ne csak válaszolj, mindig dobj vissza egy nyitott kérdést (*„How about yourself?”*).\n- **Időjárás és utazás:** A tökéletes jégtörők (*icebreakers*).\n- **Természetes visszajelzések:** *„Is that so?”*, *„Fair enough!”*, *„Tell me about it!”*`,
        },
      },
      vocabulary: {
        create: [
          {
            term: 'catch up',
            phonetics: '/kætʃ ʌp/',
            translationHu: 'utoléri magát, megbeszélik a friss híreket',
            definitionEn: 'To talk with someone you have not seen for a while to find out what they have been doing.',
            collocations: ['catch up over coffee', 'catch up on news', 'play catch up'],
            examples: ['Let us grab a pint and catch up on everything that happened this week.'],
          },
          {
            term: 'icebreaker',
            phonetics: '/ˈaɪsˌbreɪ.kər/',
            translationHu: 'jégtörő téma / beszélgetésindító',
            definitionEn: 'Something done or said to help people relax and start a conversation.',
            collocations: ['great icebreaker', 'use an icebreaker', 'icebreaker activity'],
            examples: ['Asking about someone\'s weekend plans is a reliable icebreaker.'],
          },
        ],
      },
      chunks: {
        create: [
          {
            phrase: 'speak of the devil',
            meaningHu: 'farkast emlegetnek (épp most érkezett)',
            contextSentence: 'Speak of the devil! We were just talking about your new promotion.',
          },
          {
            phrase: 'ring a bell',
            meaningHu: 'ismerősen cseng',
            contextSentence: 'That name rings a bell, but I cannot recall where we met.',
          },
        ],
      },
      contrastiveNotes: {
        create: [
          {
            hunglishTrap: 'How do you say in English...?',
            correctUsage: 'How do you say ... in English? / What is the English word for...?',
            explanationHu: 'A magyar szórendet nem szabad lemásolni! Az „in English” mindig a mondat végére kerül.',
          },
        ],
      },
      exercises: {
        create: [
          {
            type: ExerciseType.CLOZE,
            prompt: 'Válaszd ki az idiómát:',
            payload: {
              sentenceWithGap: 'Her face certainly _______ a bell, but I forgot her name.',
              options: ['rings', 'strikes', 'sounds', 'tolls'],
            },
            solution: 'rings',
          },
          {
            type: ExerciseType.TRANSLATION_HU_TO_EN,
            prompt: 'Fordítsd le:',
            payload: {
              sourceHu: 'ismerősen cseng',
              hints: ['ring', 'bell'],
            },
            solution: 'ring a bell',
          },
        ],
      },
    },
  });

  // 6. Learning Pack 4: Academic Hall - Analytical Argumentation & Hedging (C1)
  const academicPack = await prisma.learningPack.create({
    data: {
      title: 'Analytical Argumentation, Hedging & Academic Synthesis',
      cefr: CefrLevel.C1,
      topic: 'Academic',
      focus: 'Formal Essays, Critical Thinking & Rhetorical Precision',
      estimatedMinutes: 35,
      rawJson: {},
      lessons: {
        create: {
          title: 'Akadémiai távolságtartás (Hedging) és szintézis',
          contentMd: `# Tudományos Szövegalkotás és Érvelés\n\nC1 szinten elvárás, hogy a tanuló ne tegyen kategorikus, túlzó kijelentéseket (*overstatements*), hanem alkalmazzon árnyalt modális eszközöket (*hedging devices*).\n\n### Példák:\n- **Kategorikus:** *„This proves that AI is dangerous.”* ❌\n- **Akadémiailag árnyalt:** *„These empirical findings suggest that rapid AI adoption may entail unprecedented systemic risks.”* ✅`,
        },
      },
      vocabulary: {
        create: [
          {
            term: 'substantiate',
            phonetics: '/səbˈstæn.ʃi.eɪt/',
            translationHu: 'alátámaszt, igazol (tényekkel/bizonyítékkal)',
            definitionEn: 'To provide evidence to support or prove the truth of something.',
            collocations: ['substantiate a claim', 'substantiate allegations', 'empirical evidence to substantiate'],
            examples: ['The researcher presented statistical data to substantiate her hypothesis.'],
          },
        ],
      },
      chunks: {
        create: [
          {
            phrase: 'corroborate the findings',
            meaningHu: 'megerősíteni a kutatási eredményeket',
            contextSentence: 'Further peer-reviewed studies are needed to corroborate these initial findings.',
          },
        ],
      },
      contrastiveNotes: {
        create: [
          {
            hunglishTrap: 'on the other side',
            correctUsage: 'on the other hand / conversely',
            explanationHu: 'A magyar „másrészt” kifejezés angolul „on the other hand”, nem „on the other side”.',
          },
        ],
      },
      exercises: {
        create: [
          {
            type: ExerciseType.CLOZE,
            prompt: 'Válaszd ki az akadémiai kifejezést:',
            payload: {
              sentenceWithGap: 'Additional empirical research is required to _______ the theoretical framework.',
              options: ['substantiate', 'substance', 'substantial', 'substantiating'],
            },
            solution: 'substantiate',
          },
        ],
      },
    },
  });

  // 7. Seed Initial User Progress for active SRS demonstration
  const itExercises = await prisma.exercise.findMany({ where: { packId: itPack.id } });
  const itChunks = await prisma.chunk.findMany({ where: { packId: itPack.id } });
  const itVocab = await prisma.vocabularyItem.findMany({ where: { packId: itPack.id } });

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const pastDate = new Date();
  pastDate.setDate(pastDate.getDate() - 1);

  // Due exercise
  if (itExercises.length > 0) {
    await prisma.userProgress.create({
      data: {
        userId: demoUser.id,
        itemType: 'EXERCISE',
        itemId: itExercises[0].id,
        srsStage: 2,
        consecutiveOk: 2,
        totalAttempts: 3,
        nextReviewAt: pastDate, // Due right now!
      },
    });
  }

  // Mastered chunk
  if (itChunks.length > 0) {
    await prisma.userProgress.create({
      data: {
        userId: demoUser.id,
        itemType: 'CHUNK',
        itemId: itChunks[0].id,
        srsStage: 5, // Mastered!
        consecutiveOk: 5,
        totalAttempts: 5,
        nextReviewAt: tomorrow,
      },
    });
  }

  // Mastered vocab
  if (itVocab.length > 0) {
    await prisma.userProgress.create({
      data: {
        userId: demoUser.id,
        itemType: 'VOCAB',
        itemId: itVocab[0].id,
        srsStage: 4,
        consecutiveOk: 4,
        totalAttempts: 4,
        nextReviewAt: tomorrow,
      },
    });
  }

  // Mistake Log entry for practice retry
  if (itExercises.length > 1) {
    await prisma.mistakeLog.create({
      data: {
        userId: demoUser.id,
        exerciseId: itExercises[1].id,
        userAnswer: 'spin off a container',
      },
    });
  }

  // Initial Writing Submission sample
  await prisma.writingSubmission.create({
    data: {
      userId: demoUser.id,
      promptText: 'Explain why containerization is essential in modern cloud architecture.',
      submittedText: 'In modern DevOps, running application in Docker is very popular. According to me, it helps developers to isolate dependencies and make a faster deployment without overhead.',
      aiScore: 84,
      aiFeedback: {
        score: 84,
        overallAssessmentHu: 'Kifejezetten jó gondolatmenet és választékos témaköri szókincs. Néhány magyaros tükörfordítás (különösen az "according to me") finomításával még természetesebb lesz a szöveged.',
        errors: [
          {
            original: 'According to me',
            replacement: 'In my opinion / From my perspective',
            explanationHu: 'Az "according to me" magyar tükörfordítás. Angolban külső forrásokra hivatkozunk "according to"-val.',
            ruleHu: 'Véleménykifejezés elöljárószavai',
          },
          {
            original: 'running application',
            replacement: 'running applications / running an application',
            explanationHu: 'A számlálható főnevek (application) egyes számban névelőt igényelnek, vagy többes számba kell tenni őket.',
            ruleHu: 'Névelőhasználat számlálható főneveknél',
          },
        ],
        positives: ['Helyes "isolate dependencies" kollokáció', 'Jó "without overhead" terminológia'],
        suggestedCefr: 'B2',
      },
    },
  });

  console.log('✅ Database seeding finished successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
