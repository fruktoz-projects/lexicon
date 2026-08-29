export enum CefrLevel {
  A1 = 'A1',
  A2 = 'A2',
  B1 = 'B1',
  B2 = 'B2',
  C1 = 'C1',
  C2 = 'C2',
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
    color: '#B85D3B',
  },
  [ZoneType.BUSINESS]: {
    name: 'The Business Quarter',
    nameHu: 'Az Üzleti Negyed',
    share: '25%',
    description: 'Meetings, formal emails, negotiations, budgeting, client management.',
    descriptionHu: 'Megbeszélések, hivatalos e-mailek, tárgyalások, költségvetés, ügyfélkezelés.',
    icon: 'Briefcase',
    color: '#4A6F54',
  },
  [ZoneType.IT]: {
    name: 'The IT Terminal',
    nameHu: 'Az IT Terminál',
    share: '20%',
    description: 'System architecture, bug reporting, code reviews, debugging, CI/CD, APIs.',
    descriptionHu: 'Rendszerarchitektúra, hibajegyek, kódellenőrzés, hibakeresés, CI/CD, API-k.',
    icon: 'Terminal',
    color: '#3B6E8C',
  },
  [ZoneType.ACADEMIC]: {
    name: 'The Academic Hall',
    nameHu: 'Az Akadémiai Csarnok',
    share: '15%',
    description: 'Analytical reading, essays, business informatics, structured argumentation.',
    descriptionHu: 'Elemző olvasás, esszék, gazdaságinformatika, strukturált érvelés.',
    icon: 'BookOpen',
    color: '#7D5A86',
  },
} as const;

export const SRS_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30] as const;
