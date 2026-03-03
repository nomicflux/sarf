import { getEnabledDicts, setEnabledDicts, getDialect, setDialect, type DictSource, getPosLanguage, setPosLanguage } from '../../lib/dict-prefs';

async function setup() {
  const hwBox = document.getElementById('hw') as HTMLInputElement;
  const wkBox = document.getElementById('wk') as HTMLInputElement;
  const dialectSelect = document.getElementById('dialect') as HTMLSelectElement;
  const posLangEn = document.getElementById('posLangEn') as HTMLInputElement;
  const posLangAr = document.getElementById('posLangAr') as HTMLInputElement;

  const [enabled, dialect, posLang] = await Promise.all([getEnabledDicts(), getDialect(), getPosLanguage()]);
  hwBox.checked = enabled.includes('hw');
  wkBox.checked = enabled.includes('wk');
  dialectSelect.value = dialect ?? '';
  if (posLang === 'ar') posLangAr.checked = true;
  else posLangEn.checked = true;

  const onDictChange = () => {
    const sources: DictSource[] = [];
    if (hwBox.checked) sources.push('hw');
    if (wkBox.checked) sources.push('wk');
    setEnabledDicts(sources);
  };
  hwBox.addEventListener('change', onDictChange);
  wkBox.addEventListener('change', onDictChange);

  dialectSelect.addEventListener('change', () => {
    const value = dialectSelect.value as DictSource | '';
    setDialect(value || null);
  });

  posLangEn.addEventListener('change', () => { if (posLangEn.checked) setPosLanguage('en'); });
  posLangAr.addEventListener('change', () => { if (posLangAr.checked) setPosLanguage('ar'); });
}

setup();
