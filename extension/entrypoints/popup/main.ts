import {
  getEnabledDicts, setEnabledDicts, getDialect, setDialect,
  type DictSource, type Dialect, getPosLanguage, setPosLanguage,
  getExtensionEnabled, setExtensionEnabled,
  DICT_LABELS, DIALECT_SOURCES, DIALECT_LABELS, DIALECT_DICTS,
} from '../../lib/dict-prefs';

function getVisibleSources(dialect: Dialect | null): DictSource[] {
  if (dialect) return DIALECT_DICTS[dialect];
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

function buildDialectDropdown(select: HTMLSelectElement, current: Dialect | null): void {
  const none = document.createElement('option');
  none.value = '';
  none.textContent = 'MSA';
  select.appendChild(none);
  for (const d of Object.keys(DIALECT_LABELS) as Dialect[]) {
    const option = document.createElement('option');
    option.value = d;
    option.textContent = DIALECT_LABELS[d];
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

function applyExtensionUi(
  toggle: HTMLInputElement, settingsBody: HTMLElement, extensionOn: boolean,
): void {
  toggle.checked = extensionOn;
  settingsBody.classList.toggle('settings-body--disabled', !extensionOn);
  for (const el of settingsBody.querySelectorAll('input, select')) {
    (el as HTMLInputElement | HTMLSelectElement).disabled = !extensionOn;
  }
}

function wireExtensionToggle(
  toggle: HTMLInputElement, settingsBody: HTMLElement,
): void {
  toggle.addEventListener('change', async () => {
    await setExtensionEnabled(toggle.checked);
    applyExtensionUi(toggle, settingsBody, toggle.checked);
  });
}

function wireDictControls(
  dictContainer: HTMLElement, dialectSelect: HTMLSelectElement,
): void {
  dictContainer.addEventListener('change', () => setEnabledDicts(collectEnabledDicts(dictContainer)));
  dialectSelect.addEventListener('change', () => {
    const value = dialectSelect.value as Dialect | '';
    const newDialect = value || null;
    setDialect(newDialect);
    const currentEnabled = collectEnabledDicts(dictContainer);
    const visible = getVisibleSources(newDialect);
    const newEnabled = newDialect ? [...currentEnabled, ...DIALECT_DICTS[newDialect]] : currentEnabled;
    buildCheckboxes(dictContainer, visible, newEnabled);
    setEnabledDicts(collectEnabledDicts(dictContainer));
  });
}

function wirePosLang(en: HTMLInputElement, ar: HTMLInputElement): void {
  en.addEventListener('change', () => { if (en.checked) setPosLanguage('en'); });
  ar.addEventListener('change', () => { if (ar.checked) setPosLanguage('ar'); });
}

async function setup() {
  const extensionToggle = document.getElementById('extension-enabled') as HTMLInputElement;
  const settingsBody = document.getElementById('settings-body')!;
  const dictContainer = document.getElementById('dict-checkboxes')!;
  const dialectSelect = document.getElementById('dialect') as HTMLSelectElement;
  const posLangEn = document.getElementById('posLangEn') as HTMLInputElement;
  const posLangAr = document.getElementById('posLangAr') as HTMLInputElement;

  const [extensionOn, dictSources, dialect, posLang] = await Promise.all([
    getExtensionEnabled(), getEnabledDicts(), getDialect(), getPosLanguage(),
  ]);

  buildCheckboxes(dictContainer, getVisibleSources(dialect), dictSources);
  buildDialectDropdown(dialectSelect, dialect);
  if (posLang === 'ar') posLangAr.checked = true;
  else posLangEn.checked = true;
  applyExtensionUi(extensionToggle, settingsBody, extensionOn);
  wireExtensionToggle(extensionToggle, settingsBody);
  wireDictControls(dictContainer, dialectSelect);
  wirePosLang(posLangEn, posLangAr);
}

setup();
