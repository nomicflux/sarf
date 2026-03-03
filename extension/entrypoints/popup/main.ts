import {
  getEnabledDicts, setEnabledDicts, getDialect, setDialect,
  type DictSource, getPosLanguage, setPosLanguage,
  DICT_LABELS, DIALECT_SOURCES,
} from '../../lib/dict-prefs';

function buildCheckboxes(container: HTMLElement, enabled: DictSource[]): void {
  const sources = Object.keys(DICT_LABELS).filter(
    (s) => !DIALECT_SOURCES.includes(s as DictSource),
  ) as DictSource[];

  for (const source of sources) {
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.id = source;
    input.checked = enabled.includes(source);
    label.appendChild(input);
    label.append(` ${DICT_LABELS[source]}`);
    container.appendChild(label);
  }
}

function buildDialectDropdown(select: HTMLSelectElement, current: DictSource | null): void {
  const none = document.createElement('option');
  none.value = '';
  none.textContent = 'None';
  select.appendChild(none);

  for (const source of DIALECT_SOURCES) {
    const option = document.createElement('option');
    option.value = source;
    option.textContent = DICT_LABELS[source];
    select.appendChild(option);
  }

  select.value = current ?? '';
}

function collectEnabledDicts(container: HTMLElement): DictSource[] {
  const boxes = container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
  const sources: DictSource[] = [];
  for (const box of boxes) {
    if (box.checked) sources.push(box.id as DictSource);
  }
  return sources;
}

async function setup() {
  const dictContainer = document.getElementById('dict-checkboxes')!;
  const dialectSelect = document.getElementById('dialect') as HTMLSelectElement;
  const posLangEn = document.getElementById('posLangEn') as HTMLInputElement;
  const posLangAr = document.getElementById('posLangAr') as HTMLInputElement;

  const [enabled, dialect, posLang] = await Promise.all([getEnabledDicts(), getDialect(), getPosLanguage()]);

  buildCheckboxes(dictContainer, enabled);
  buildDialectDropdown(dialectSelect, dialect);
  if (posLang === 'ar') posLangAr.checked = true;
  else posLangEn.checked = true;

  dictContainer.addEventListener('change', () => setEnabledDicts(collectEnabledDicts(dictContainer)));

  dialectSelect.addEventListener('change', () => {
    const value = dialectSelect.value as DictSource | '';
    setDialect(value || null);
  });

  posLangEn.addEventListener('change', () => { if (posLangEn.checked) setPosLanguage('en'); });
  posLangAr.addEventListener('change', () => { if (posLangAr.checked) setPosLanguage('ar'); });
}

setup();
