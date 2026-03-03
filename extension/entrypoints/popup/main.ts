import {
  getEnabledDicts, setEnabledDicts, getDialect, setDialect,
  type DictSource, getPosLanguage, setPosLanguage,
  DICT_LABELS, DIALECT_SOURCES,
} from '../../lib/dict-prefs';

function getVisibleSources(dialect: DictSource | null): DictSource[] {
  if (dialect) return [dialect];
  return (Object.keys(DICT_LABELS) as DictSource[]).filter(
    (s) => !DIALECT_SOURCES.includes(s),
  );
}

function buildCheckboxes(container: HTMLElement, visible: DictSource[], enabled: DictSource[]): void {
  container.innerHTML = '';
  for (const source of visible) {
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

  buildCheckboxes(dictContainer, getVisibleSources(dialect), enabled);
  buildDialectDropdown(dialectSelect, dialect);
  if (posLang === 'ar') posLangAr.checked = true;
  else posLangEn.checked = true;

  dictContainer.addEventListener('change', () => setEnabledDicts(collectEnabledDicts(dictContainer)));

  dialectSelect.addEventListener('change', () => {
    const value = dialectSelect.value as DictSource | '';
    const newDialect = value || null;
    setDialect(newDialect);
    const currentEnabled = collectEnabledDicts(dictContainer);
    const visible = getVisibleSources(newDialect);
    const newEnabled = newDialect ? [...currentEnabled, newDialect] : currentEnabled;
    buildCheckboxes(dictContainer, visible, newEnabled);
    setEnabledDicts(collectEnabledDicts(dictContainer));
  });

  posLangEn.addEventListener('change', () => { if (posLangEn.checked) setPosLanguage('en'); });
  posLangAr.addEventListener('change', () => { if (posLangAr.checked) setPosLanguage('ar'); });
}

setup();
