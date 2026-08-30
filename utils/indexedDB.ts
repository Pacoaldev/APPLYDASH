const DB_NAME = "applydash-matching-db";
const STORE_NAME = "matching-history";
const DB_VERSION = 1;

export function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("IndexedDB is only available in browser environments."));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = (event: any) => resolve(event.target.result);
    request.onerror = (event: any) => reject(event.target.error);
  });
}

export async function saveMatchingHistory(items: any[]): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    store.clear();

    items.forEach((item) => {
      const row = { ...item };
      if (!row.id) {
        row.id = crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11);
      }
      store.put(row);
    });

    transaction.oncomplete = () => resolve();
    transaction.onerror = (event: any) => reject(event.target.error);
  });
}

export async function getAllMatchingHistory(): Promise<any[]> {
  try {
    const db = await initDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = (event: any) => reject(event.target.error);
    });
  } catch (error) {
    console.warn("IndexedDB not initialized yet or not supported:", error);
    return [];
  }
}
