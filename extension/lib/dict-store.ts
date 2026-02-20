import type { DictEntry } from './dictionary';

export type CompactEntry = [string, string, string, string];

export function parseCompactEntry(tuple: CompactEntry): DictEntry {
  const [word, definition, rootWord, source] = tuple;
  return { word, definition, rootWord, source };
}

export async function openDictDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('sarf-dict', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const store = db.createObjectStore('entries', { autoIncrement: true });
      store.createIndex('word', 'word', { unique: false });
    };
  });
}

export async function isDictPopulated(db: IDBDatabase): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('entries', 'readonly');
    const store = tx.objectStore('entries');
    const request = store.count();
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result > 0);
  });
}

export async function populateDict(
  db: IDBDatabase,
  compactEntries: CompactEntry[],
): Promise<void> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('entries', 'readwrite');
    const store = tx.objectStore('entries');
    store.clear();
    for (const tuple of compactEntries) {
      store.add(parseCompactEntry(tuple));
    }
    tx.onerror = () => reject(tx.error);
    tx.oncomplete = () => resolve();
  });
}

export async function queryByWord(
  db: IDBDatabase,
  word: string,
): Promise<DictEntry[]> {
  return new Promise((resolve, reject) => {
    const tx = db.transaction('entries', 'readonly');
    const store = tx.objectStore('entries');
    const index = store.index('word');
    const request = index.getAll(word);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as DictEntry[]);
  });
}
