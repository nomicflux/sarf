export type PosLanguage = 'ar' | 'en';

const POS_TAGS: Record<string, string> = {
  'اسم': 'noun',
  'فعل': 'verb',
  'حرف': 'particle',
  'ظرف': 'adverb',
  'صفة': 'adjective',
  'ضمير': 'pronoun',
};

const POS_FEATURES: Record<string, string> = {
  'مفرد': 'singular',
  'مثنى': 'dual',
  'جمع': 'plural',
  'مذكر': 'masculine',
  'مؤنث': 'feminine',
  'معرف': 'definite',
  'نكرة': 'indefinite',
  'نسبة': 'nisba',
  'مرفوع': 'nominative',
  'منصوب': 'accusative',
  'مجرور': 'genitive',
  'مجزوم': 'jussive',
  'ماضي': 'past',
  'مضارع': 'present',
  'أمر': 'imperative',
  'مبني للمجهول': 'passive',
  'مصدر': 'verbal noun',
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
