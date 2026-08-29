# 🧭 Lexicon: English Expedition Log

> **Magyar anyanyelvűekre specializált kontrasztív angol tanulási platform, hunglish hibaminták felszámolása és determinisztikus SRS memóriamotor.**

---

## 🌟 Projekt Filozófia & Főbb Funkciók

A **Lexicon** elhagyja a sablonos AI wrapper kliséket (lebegő chatbot buborékok, neon villogások). Egy kézzelfogható, intellektuális **Expedíciós Munkanapló** formájában nyújt mély nyelvi fejlődést magyar anyanyelvű tanulók számára az **A2/B1 $\rightarrow$ B2/C1** szinteken.

### 1. Kontrasztív Pedagógia (L1 Horgony $\rightarrow$ L2 Cél)
- **Magyar nyelvű magyarázatok:** Nyelvtani logikák, kifejezésjelentések és esszé visszajelzések kristálytiszta magyar nyelven.
- **Autentikus angol cél:** Minden szakkifejezés, mondatpélda, feladat és olvasmány természetes angol forrásokból.
- **Hunglish Csapdák Felszámolása (*Hunglish Traps*):** Hamis barátok (*false friends*), hiányzó/eltérő elöljárószók (*prepositions* — pl. *„running from Docker”* $\rightarrow$ *„running in Docker”*), szórendi ütközések.
- **Kifejezéscsomagok (*Chunks*):** Rögzített kollokációk és idiómák elsajátítása elszigetelt szavak helyett.

### 2. Determinisztikus SRS Gyakorlómotor (0 Tokencöltség)
- 1, 3, 7, 14 és 30 napos ismétlési intervallumok a felejtési görbe ellen.
- Billentyűzet-vezérelt, zéró-chatbot felület (`1-4` opcióválasztás, `Enter` ellenőrzés/továbblépés, `Space` kiejtés).
- Hibajavító sorba helyezés és esedékességi prioritás.

### 3. Expedíciós Írásműhely (Dual-Pane Writing Lab)
- Kétpaneles fogalmazó munkafelület.
- Google Gemini Flash AI motor valós idejű magyar pedagógiai elemzéssel.
- Interaktív áthúzott hibakiemelések (`diff`), magyar nyelvtani margómagyarázatok (`ruleHu`, `explanationHu`).

### 4. 4 Funkcionális Tartalmi Zóna
1. **The Everyday Port (40%):** Kötetlen beszélgetés, utazás, pub-kultúra, társasági kapcsolatok.
2. **The Business Quarter (25%):** Tárgyalások, szerződéses finomságok, feltételes ajánlatok, költségvetés.
3. **The IT Terminal (20%):** Rendszerarchitektúra, konténerizáció, CI/CD, hibajegyek, kódellenőrzés.
4. **The Academic Hall (15%):** Árnyalt érvelés (*hedging*), kritikai szintézis, esszék.

---

## 🎨 Expedíciós Dizájn Rendszer

- **Pergament Alapvászon:** `#F5EFE6`
- **Szépia Kártyák & Keretek:** `#E3DAC9`
- **Faszén Tinta (Főszöveg):** `#1F2421`
- **Terrakotta / Viaszpecsét (Fő Akció):** `#B85D3B`
- **Zsályazöld (SRS Siker & Mesterfok):** `#4A6F54`
- **Tipográfia:** `Lora` / `Newsreader` (Címek), `Plus Jakarta Sans` (UI), `Geist Mono` (Kód & CEFR).

---

## 🛠️ Technológiai Verem

- **Monorepo:** pnpm workspaces (`apps/api`, `apps/web`, `packages/types`)
- **Backend:** Fastify + TypeScript + Prisma ORM + PostgreSQL 16 + Redis 7 / BullMQ + Fastify JWT + Swagger UI
- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS + TanStack Query v5 + Zustand + Lucide Icons + PWA (`vite-plugin-pwa`)
- **Hang & Kiejtés:** Web Speech API TTS + Web Audio API szintetizált visszajelzések
- **Infrastruktúra:** Docker Compose + Caddy Reverse Proxy & SSL

---

## 🚀 Indítás és Futtatás

### 1. Docker Compose segítségével (Ajánlott teljes veremhez)

```bash
# Fejlesztői környezet (PostgreSQL, Redis, Fastify API, Vite Web)
docker compose up -d

# Vagy éles környezet (Caddy + API + DB + Redis)
docker compose -f docker-compose.prod.yml up -d
```

### 2. Helyi Futtatás (pnpm)

```bash
# Függőségek telepítése
pnpm install

# Adatbázis migráció és seedelés
pnpm --filter @lexicon/api db:push
pnpm --filter @lexicon/api db:seed

# Párhuzamos fejlesztői szerver indítása (Frontend: 5173, Backend: 3000)
pnpm dev
```

- Web Alkalmazás: [http://localhost:5173](http://localhost:5173)
- API Szerver: [http://localhost:3000](http://localhost:3000)
- Swagger Dokumentáció: [http://localhost:3000/docs](http://localhost:3000/docs)
- **Demo Belépés:** `expedition@lexicon.hu` / `password123`

---

## 📂 Könyvtárstruktúra

```
project/
├── apps/
│   ├── api/                     # Fastify backend & Prisma ORM
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # PostgreSQL adatmodellek
│   │   │   └── seed.ts         # Teljes körű magyar -> angol seed adatok
│   │   └── src/
│   │       ├── routes/         # REST API végpontok (/auth, /practice, /writing, stb.)
│   │       ├── services/       # SRS motor, AI Gateway, Auth, Analitika
│   │       └── server.ts
│   └── web/                     # React 19 + Vite PWA frontend
│       └── src/
│           ├── components/     # Tactile SRS, Dual-Pane Editor, Vault, Zónák
│           ├── store/          # Zustand store-ok és offline szinkronizáció
│           ├── services/       # Web Speech API kiejtés és Axios kliens
│           └── pages/          # Munkanapló, Zónák, Gyakorlás, Írás, Analitika
├── packages/
│   └── types/                  # Megosztott TypeScript típusok és Zod sémák
├── docker-compose.yml           # Lokális fejlesztési konténerek
├── docker-compose.prod.yml      # Éles Caddy + API + DB környezet
└── Caddyfile                   # Fordított proxy és PWA statikus kiszolgálás
```
