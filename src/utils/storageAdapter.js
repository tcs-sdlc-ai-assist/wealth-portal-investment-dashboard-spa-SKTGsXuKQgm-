/**
 * Browser storage abstraction layer with fallback
 * @module storageAdapter
 *
 * Provides get, set, remove, and clear methods with localStorage as primary
 * and sessionStorage as fallback. Includes error handling for quota exceeded,
 * unavailable storage, and corrupted JSON.
 */

/**
 * Tests whether a given Storage implementation is available and functional.
 * @param {Storage} storage - The storage object to test (localStorage or sessionStorage)
 * @returns {boolean} True if the storage is available and writable
 */
function testStorage(storage) {
  const testKey = '__storage_test__';
  try {
    storage.setItem(testKey, '1');
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Checks whether localStorage is available and functional.
 * @returns {boolean}
 */
export function isStorageAvailable() {
  return testStorage(window.localStorage);
}

/**
 * Checks whether sessionStorage is available and functional.
 * @returns {boolean}
 */
export function isSessionStorageAvailable() {
  return testStorage(window.sessionStorage);
}

/**
 * Resolves the best available Storage implementation.
 * Prefers localStorage; falls back to sessionStorage.
 * @returns {Storage | null} The resolved storage, or null if neither is available
 */
function resolveStorage() {
  if (isStorageAvailable()) {
    return window.localStorage;
  }
  if (isSessionStorageAvailable()) {
    console.warn(
      '[StorageAdapter] localStorage unavailable, falling back to sessionStorage.',
    );
    return window.sessionStorage;
  }
  console.error(
    '[StorageAdapter] No web storage available. Data will not be persisted.',
  );
  return null;
}

/** @type {Storage | null} Cached reference to the resolved storage backend */
let _storage = null;

/**
 * Returns the active storage backend, resolving it on first call.
 * @returns {Storage | null}
 */
function getStorage() {
  if (_storage === null) {
    _storage = resolveStorage();
  }
  return _storage;
}

/**
 * Retrieves and JSON-parses a value from storage.
 * Returns `defaultValue` when the key does not exist or the stored value
 * cannot be parsed.
 *
 * @param {string} key - The storage key to read
 * @param {*} [defaultValue=null] - Value returned when the key is missing or data is corrupt
 * @returns {*} The parsed value, or `defaultValue`
 */
export function get(key, defaultValue = null) {
  const storage = getStorage();
  if (!storage) {
    return defaultValue;
  }

  try {
    const raw = storage.getItem(key);
    if (raw === null) {
      return defaultValue;
    }
    return JSON.parse(raw);
  } catch (error) {
    console.error(
      `[StorageAdapter] Failed to parse value for key "${key}". Returning default.`,
      error,
    );
    return defaultValue;
  }
}

/**
 * JSON-serialises a value and writes it to storage.
 * Handles quota-exceeded errors gracefully.
 *
 * @param {string} key - The storage key to write
 * @param {*} value - The value to serialise and store
 * @returns {boolean} True if the write succeeded
 */
export function set(key, value) {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  try {
    const serialised = JSON.stringify(value);
    storage.setItem(key, serialised);
    return true;
  } catch (error) {
    if (
      error instanceof DOMException &&
      (error.code === 22 ||
        error.code === 1014 ||
        error.name === 'QuotaExceededError' ||
        error.name === 'NS_ERROR_DOM_QUOTA_REACHED')
    ) {
      console.error(
        `[StorageAdapter] Storage quota exceeded when writing key "${key}".`,
        error,
      );
    } else {
      console.error(
        `[StorageAdapter] Failed to write key "${key}".`,
        error,
      );
    }
    return false;
  }
}

/**
 * Removes a single key from storage.
 *
 * @param {string} key - The storage key to remove
 * @returns {boolean} True if the removal succeeded (or key didn't exist)
 */
export function remove(key) {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  try {
    storage.removeItem(key);
    return true;
  } catch (error) {
    console.error(
      `[StorageAdapter] Failed to remove key "${key}".`,
      error,
    );
    return false;
  }
}

/**
 * Clears all keys from the active storage backend.
 *
 * @returns {boolean} True if the clear succeeded
 */
export function clear() {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  try {
    storage.clear();
    return true;
  } catch (error) {
    console.error('[StorageAdapter] Failed to clear storage.', error);
    return false;
  }
}

/**
 * Checks whether a key exists in storage.
 *
 * @param {string} key - The storage key to check
 * @returns {boolean} True if the key exists
 */
export function has(key) {
  const storage = getStorage();
  if (!storage) {
    return false;
  }

  try {
    return storage.getItem(key) !== null;
  } catch {
    return false;
  }
}

/**
 * Resets the internal cached storage reference.
 * Useful for testing or when storage availability changes at runtime.
 */
export function resetStorageCache() {
  _storage = null;
}

const storageAdapter = {
  get,
  set,
  remove,
  clear,
  has,
  isStorageAvailable,
  isSessionStorageAvailable,
  resetStorageCache,
};

export default storageAdapter;