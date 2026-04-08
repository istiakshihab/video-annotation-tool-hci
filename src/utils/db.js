// IndexedDB wrapper for persisting annotation sessions

const DB_NAME = 'annotation-tool';
const DB_VERSION = 2;
const STORE = 'sessions';

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      // Drop v1 store (keyed by videoName) if it exists — data loss is acceptable
      if (db.objectStoreNames.contains(STORE)) {
        db.deleteObjectStore(STORE);
      }
      const store = db.createObjectStore(STORE, { keyPath: 'id' });
      store.createIndex('videoName', 'videoName', { unique: false });
      store.createIndex('updatedAt', 'updatedAt', { unique: false });
    };

    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = () => reject(req.error);
  });
}

// Create or update a session. If session.id is provided, update. If not, create new.
export async function saveSession(session) {
  const db = await openDB();
  const now = Date.now();
  const record = {
    annotations: [],
    segmentStart: null,
    lastTask: null,
    schemeId: 'default',
    ...session,
    updatedAt: now,
  };
  if (!record.id) {
    record.id = generateId();
    record.createdAt = now;
    if (!record.name) {
      record.name = record.videoName ? record.videoName.replace(/\.[^/.]+$/, '') : record.id;
    }
  }
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const req = tx.objectStore(STORE).put(record);
    req.onsuccess = () => resolve(record);
    tx.onerror = () => reject(tx.error);
  });
}

// Load session by id
export async function loadSession(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).get(id);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

// Load most recent session for a given videoName
export async function loadSessionByVideo(videoName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const index = tx.objectStore(STORE).index('videoName');
    const req = index.getAll(IDBKeyRange.only(videoName));
    req.onsuccess = () => {
      const results = req.result || [];
      if (results.length === 0) return resolve(null);
      results.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(results[0]);
    };
    req.onerror = () => reject(req.error);
  });
}

// List all sessions, sorted by updatedAt descending
export async function listSessions() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readonly');
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => {
      const results = req.result || [];
      results.sort((a, b) => b.updatedAt - a.updatedAt);
      resolve(results);
    };
    req.onerror = () => reject(req.error);
  });
}

// Delete session by id
export async function deleteSession(id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

// Rename a session
export async function renameSession(id, newName) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, 'readwrite');
    const store = tx.objectStore(STORE);
    const getReq = store.get(id);
    getReq.onsuccess = () => {
      const session = getReq.result;
      if (!session) return reject(new Error(`Session not found: ${id}`));
      const updated = { ...session, name: newName, updatedAt: Date.now() };
      const putReq = store.put(updated);
      putReq.onsuccess = () => resolve(updated);
      putReq.onerror = () => reject(putReq.error);
    };
    getReq.onerror = () => reject(getReq.error);
  });
}
