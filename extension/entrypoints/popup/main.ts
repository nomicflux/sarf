import { getEnabledDicts, setEnabledDicts, type DictSource } from '../../lib/dict-prefs';

async function setup() {
  const hwBox = document.getElementById('hw') as HTMLInputElement;
  const wkBox = document.getElementById('wk') as HTMLInputElement;
  const enabled = await getEnabledDicts();
  hwBox.checked = enabled.includes('hw');
  wkBox.checked = enabled.includes('wk');

  const onChange = () => {
    const sources: DictSource[] = [];
    if (hwBox.checked) sources.push('hw');
    if (wkBox.checked) sources.push('wk');
    setEnabledDicts(sources);
  };
  hwBox.addEventListener('change', onChange);
  wkBox.addEventListener('change', onChange);
}

setup();
