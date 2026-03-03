export type PosLanguage = 'ar' | 'en';

// Main POS tags (segment 0 of pos field)
const POS_TAGS: Record<string, string> = {
  'اسم': 'noun',
  'فعل': 'verb',
  'حرف': 'particle',
};

// All values from pos field segments 1+ (subtypes and features)
// Verified against actual AlKhalil MorphoSys 2 API responses
const POS_FEATURES: Record<string, string> = {
  // Noun subtypes (segment 1)
  'اسم جامد': 'concrete noun',
  'اسم فاعل': 'active participle',
  'اسم مفعول': 'passive participle',
  'اسم تفضيل': 'elative',
  'اسم علم': 'proper noun',
  'اسم زمان أو مكان': 'noun of time/place',
  'اسم آلة': 'instrumental noun',
  'مصدر أصلي': 'verbal noun',
  'مصدر ميمي': 'mimi verbal noun',
  'مبالغة اسم الفاعل': 'intensive participle',
  'صفة مشبهة': 'qualitative adj.',
  'نسبة': 'nisba',
  'ضمير': 'pronoun',
  'إشارة': 'demonstrative',
  'موصول': 'relative pronoun',
  'استفهام': 'interrogative',
  'شرط': 'conditional',
  'استثناء': 'exception',
  'ظرف': 'adverb',
  // Verb subtypes (segment 1)
  'ماض': 'past',
  'مضارع': 'present',
  'أمر': 'imperative',
  'ناسخ': 'copulative',
  // Verb emphasis (segment 2)
  'مؤكد': 'emphatic',
  // Particle subtypes (segment 1)
  'جر': 'preposition',
  'عطف': 'conjunction',
  'نفي': 'negation',
  'نهي': 'prohibition',
  'زائد': 'expletive',
  'نداء': 'vocative',
  'احتمال': 'probability',
  'تحقيق': 'assertion',
  'توقع': 'expectation',
  'جزم:نفي': 'jussive negation',
  'نصب:نفي': 'subjunctive negation',
  'توكيد:نفي:شرط': 'emphatic conditional negation',
  'مصدري:نفي': 'masdariyya negation',
  'استفهام:موصول': 'interrogative/relative',
  // Number (segment 2 for nouns)
  'مفرد': 'singular',
  'مثنى': 'dual',
  'جمع': 'plural',
  // Gender (segment 3 for nouns)
  'مذكر': 'masculine',
  'مؤنث': 'feminine',
  // Definiteness (segment 4 for nouns)
  'معرف': 'definite',
  'نكرة': 'indefinite',
  'مضاف': 'construct',
  'مضاف إلى نكرة': 'construct (indef.)',
  'مضاف إلى معرفة': 'construct (def.)',
  'غير مضاف': 'non-construct',
  // Voice (verb segment 3)
  'معلوم': 'active',
  'مجهول': 'passive',
  // Root type (verb segment 4)
  'ثلاثي': 'triliteral',
  // Derivation (verb segment 5)
  'مجرد': 'base form',
  'مزيد': 'augmented',
  // Person (verb segment 6, pronoun segment 1)
  'غائب': 'third person',
  'الغائب': 'third person',
  'مخاطب': 'second person',
  'المخاطب': 'second person',
  'متكلم': 'first person',
  'المتكلم': 'first person',
  // Transitivity (verb segment 8)
  'لازم': 'intransitive',
  'متعد': 'transitive',
  'لازم ومتعد': 'intransitive/transitive',
};

export function translatePosTag(tag: string): string {
  return POS_TAGS[tag] ?? tag;
}

export function translatePosFeature(feature: string): string {
  return POS_FEATURES[feature] ?? feature;
}

export function translatePos(
  tag: string,
  features: string[],
  lang: PosLanguage,
): { tag: string; features: string[] } {
  if (lang === 'ar') return { tag, features };
  return {
    tag: translatePosTag(tag),
    features: features.map(translatePosFeature),
  };
}
