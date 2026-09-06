export enum CefrLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
}

export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export enum ExerciseType {
  CLOZE = 'CLOZE',
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  MATCHING = 'MATCHING',
  TRANSLATION_HU_TO_EN = 'TRANSLATION_HU_TO_EN',
  TRANSLATION_EN_TO_HU = 'TRANSLATION_EN_TO_HU',
}

export enum ZoneType {
  EVERYDAY = 'Everyday',
  BUSINESS = 'Business',
  IT = 'IT',
  ACADEMIC = 'Academic',
}

export enum ProgressItemType {
  VOCAB = 'VOCAB',
  CHUNK = 'CHUNK',
  EXERCISE = 'EXERCISE',
}

export const ZONE_DETAILS = {
  [ZoneType.EVERYDAY]: {
    name: 'The Everyday Port',
    nameHu: 'A Mindennapok Kikötője',
    share: '40%',
    description: 'Small talk, travel, daily routines, social interactions.',
    descriptionHu: 'Kötetlen beszélgetés, utazás, napi rutin, társasági érintkezések.',
    icon: 'Compass',
    color: '#0EA5E9',
  },
  [ZoneType.BUSINESS]: {
    name: 'The Business Quarter',
    nameHu: 'Az Üzleti Negyed',
    share: '25%',
    description: 'Meetings, formal emails, negotiations, budgeting, client management.',
    descriptionHu: 'Megbeszélések, hivatalos e-mailek, tárgyalások, költségvetés, ügyfélkezelés.',
    icon: 'Briefcase',
    color: '#7C3AED',
  },
  [ZoneType.IT]: {
    name: 'The IT Terminal',
    nameHu: 'Az IT Terminál',
    share: '20%',
    description: 'System architecture, bug reporting, code reviews, debugging, CI/CD, APIs.',
    descriptionHu: 'Rendszerarchitektúra, hibajegyek, kódellenőrzés, hibakeresés, CI/CD, API-k.',
    icon: 'Terminal',
    color: '#4F46E5',
  },
  [ZoneType.ACADEMIC]: {
    name: 'The Academic Hall',
    nameHu: 'Az Akadémiai Csarnok',
    share: '15%',
    description: 'Analytical reading, essays, business informatics, structured argumentation.',
    descriptionHu: 'Elemző olvasás, esszék, gazdaságinformatika, strukturált érvelés.',
    icon: 'BookOpen',
    color: '#10B981',
  },
} as const;

