/**
 * Unit tests for StorageAdapter
 * Verifies get/set/remove/clear operations, localStorage fallback to sessionStorage,
 * error handling for quota exceeded, corrupted JSON parsing, and isStorageAvailable check.
 * Implements SCRUM-20313: Session Management
 * @module storageAdapter.test
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  get,
  set,
  remove,
  clear,
  has,
  isStorageAvailable,
  isSessionStorageAvailable,
  resetStorageCache,
} from './storageAdapter.js';

describe('storageAdapter', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    resetStorageCache();
    vi.clearAllMocks();
  });

  afterEach(() => {
    resetStorageCache();
  });

  describe('isStorageAvailable', () => {
    it('returns true when localStorage is functional', () => {
      expect(isStorageAvailable()).toBe(true);
    });

    it('returns false when localStorage throws on setItem', () => {
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn(() => {
        throw new DOMException('Storage disabled', 'SecurityError');
      });

      expect(isStorageAvailable()).toBe(false);

      localStorage.setItem = originalSetItem;
    });
  });

  describe('isSessionStorageAvailable', () => {
    it('returns true when sessionStorage is functional', () => {
      expect(isSessionStorageAvailable()).toBe(true);
    });

    it('returns false when sessionStorage throws on setItem', () => {
      const originalSetItem = sessionStorage.setItem;
      sessionStorage.setItem = vi.fn(() => {
        throw new DOMException('Storage disabled', 'SecurityError');
      });

      expect(isSessionStorageAvailable()).toBe(false);

      sessionStorage.setItem = originalSetItem;
    });
  });

  describe('set', () => {
    it('stores a JSON-serialised value in localStorage', () => {
      const result = set('testKey', { name: 'Jane' });

      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith(
        'testKey',
        JSON.stringify({ name: 'Jane' }),
      );
    });

    it('stores a string value', () => {
      const result = set('strKey', 'hello');

      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('strKey', '"hello"');
    });

    it('stores a number value', () => {
      const result = set('numKey', 42);

      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('numKey', '42');
    });

    it('stores an array value', () => {
      const result = set('arrKey', [1, 2, 3]);

      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('arrKey', '[1,2,3]');
    });

    it('stores a boolean value', () => {
      const result = set('boolKey', true);

      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('boolKey', 'true');
    });

    it('stores null value', () => {
      const result = set('nullKey', null);

      expect(result).toBe(true);
      expect(localStorage.setItem).toHaveBeenCalledWith('nullKey', 'null');
    });

    it('handles QuotaExceededError gracefully and returns false', () => {
      resetStorageCache();

      const originalSetItem = localStorage.setItem;
      let callCount = 0;
      localStorage.setItem = vi.fn((key, value) => {
        callCount++;
        // Allow the storage test probe to succeed, but fail on actual writes
        if (key === '__storage_test__') {
          return originalSetItem.call(localStorage, key, value);
        }
        const error = new DOMException('Quota exceeded', 'QuotaExceededError');
        error.code = 22;
        throw error;
      });

      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn((key) => {
        return originalRemoveItem.call(localStorage, key);
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = set('bigKey', 'x'.repeat(10000));

      expect(result).toBe(false);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
    });
  });

  describe('get', () => {
    it('retrieves and parses a stored JSON object', () => {
      set('user', { id: '1', email: 'test@example.com' });

      const result = get('user');

      expect(result).toEqual({ id: '1', email: 'test@example.com' });
    });

    it('retrieves a stored string value', () => {
      set('greeting', 'hello');

      const result = get('greeting');

      expect(result).toBe('hello');
    });

    it('retrieves a stored number value', () => {
      set('count', 99);

      const result = get('count');

      expect(result).toBe(99);
    });

    it('retrieves a stored array value', () => {
      set('items', [1, 2, 3]);

      const result = get('items');

      expect(result).toEqual([1, 2, 3]);
    });

    it('retrieves a stored boolean value', () => {
      set('flag', false);

      const result = get('flag');

      expect(result).toBe(false);
    });

    it('returns defaultValue when key does not exist', () => {
      const result = get('nonexistent', 'fallback');

      expect(result).toBe('fallback');
    });

    it('returns null as default when key does not exist and no default provided', () => {
      const result = get('nonexistent');

      expect(result).toBeNull();
    });

    it('returns defaultValue when stored JSON is corrupted', () => {
      // Directly write invalid JSON to localStorage
      localStorage.setItem('corrupt', '{invalid json!!!');

      resetStorageCache();

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = get('corrupt', 'default');

      expect(result).toBe('default');
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('returns defaultValue when stored value is undefined string', () => {
      localStorage.setItem('undef', 'undefined');

      resetStorageCache();

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const result = get('undef', 'fallback');

      // 'undefined' is not valid JSON, so it should return fallback
      expect(result).toBe('fallback');

      consoleSpy.mockRestore();
    });
  });

  describe('remove', () => {
    it('removes a key from storage', () => {
      set('toRemove', 'value');

      expect(get('toRemove')).toBe('value');

      const result = remove('toRemove');

      expect(result).toBe(true);
      expect(get('toRemove')).toBeNull();
    });

    it('returns true when removing a non-existent key', () => {
      const result = remove('nonexistent');

      expect(result).toBe(true);
    });
  });

  describe('clear', () => {
    it('removes all keys from storage', () => {
      set('key1', 'value1');
      set('key2', 'value2');
      set('key3', 'value3');

      expect(get('key1')).toBe('value1');
      expect(get('key2')).toBe('value2');

      const result = clear();

      expect(result).toBe(true);
      expect(get('key1')).toBeNull();
      expect(get('key2')).toBeNull();
      expect(get('key3')).toBeNull();
    });
  });

  describe('has', () => {
    it('returns true when key exists in storage', () => {
      set('existing', 'value');

      expect(has('existing')).toBe(true);
    });

    it('returns false when key does not exist in storage', () => {
      expect(has('nonexistent')).toBe(false);
    });

    it('returns true for a key with null value', () => {
      set('nullVal', null);

      expect(has('nullVal')).toBe(true);
    });
  });

  describe('resetStorageCache', () => {
    it('allows re-resolution of storage backend after reset', () => {
      // First call resolves storage
      set('before', 'reset');
      expect(get('before')).toBe('reset');

      // Reset and verify it still works
      resetStorageCache();

      set('after', 'reset');
      expect(get('after')).toBe('reset');
    });
  });

  describe('localStorage fallback to sessionStorage', () => {
    it('falls back to sessionStorage when localStorage is unavailable', () => {
      resetStorageCache();

      // Make localStorage unavailable
      const originalLocalSetItem = localStorage.setItem;
      const originalLocalGetItem = localStorage.getItem;
      const originalLocalRemoveItem = localStorage.removeItem;

      localStorage.setItem = vi.fn(() => {
        throw new DOMException('Storage disabled', 'SecurityError');
      });

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      // Reset cache so it re-resolves
      resetStorageCache();

      const result = set('fallbackKey', 'fallbackValue');

      expect(result).toBe(true);
      expect(sessionStorage.setItem).toHaveBeenCalledWith(
        'fallbackKey',
        '"fallbackValue"',
      );

      const retrieved = get('fallbackKey');
      expect(retrieved).toBe('fallbackValue');

      consoleSpy.mockRestore();
      localStorage.setItem = originalLocalSetItem;
      localStorage.getItem = originalLocalGetItem;
      localStorage.removeItem = originalLocalRemoveItem;
    });
  });

  describe('both storages unavailable', () => {
    it('returns false for set when no storage is available', () => {
      resetStorageCache();

      const originalLocalSetItem = localStorage.setItem;
      const originalSessionSetItem = sessionStorage.setItem;

      localStorage.setItem = vi.fn(() => {
        throw new DOMException('Storage disabled', 'SecurityError');
      });
      sessionStorage.setItem = vi.fn(() => {
        throw new DOMException('Storage disabled', 'SecurityError');
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      resetStorageCache();

      const result = set('noStorage', 'value');

      expect(result).toBe(false);

      consoleErrorSpy.mockRestore();
      localStorage.setItem = originalLocalSetItem;
      sessionStorage.setItem = originalSessionSetItem;
    });

    it('returns defaultValue for get when no storage is available', () => {
      resetStorageCache();

      const originalLocalSetItem = localStorage.setItem;
      const originalSessionSetItem = sessionStorage.setItem;

      localStorage.setItem = vi.fn(() => {
        throw new DOMException('Storage disabled', 'SecurityError');
      });
      sessionStorage.setItem = vi.fn(() => {
        throw new DOMException('Storage disabled', 'SecurityError');
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      resetStorageCache();

      const result = get('noStorage', 'default');

      expect(result).toBe('default');

      consoleErrorSpy.mockRestore();
      localStorage.setItem = originalLocalSetItem;
      sessionStorage.setItem = originalSessionSetItem;
    });

    it('returns false for remove when no storage is available', () => {
      resetStorageCache();

      const originalLocalSetItem = localStorage.setItem;
      const originalSessionSetItem = sessionStorage.setItem;

      localStorage.setItem = vi.fn(() => {
        throw new DOMException('Storage disabled', 'SecurityError');
      });
      sessionStorage.setItem = vi.fn(() => {
        throw new DOMException('Storage disabled', 'SecurityError');
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      resetStorageCache();

      const result = remove('noStorage');

      expect(result).toBe(false);

      consoleErrorSpy.mockRestore();
      localStorage.setItem = originalLocalSetItem;
      sessionStorage.setItem = originalSessionSetItem;
    });

    it('returns false for clear when no storage is available', () => {
      resetStorageCache();

      const originalLocalSetItem = localStorage.setItem;
      const originalSessionSetItem = sessionStorage.setItem;

      localStorage.setItem = vi.fn(() => {
        throw new DOMException('Storage disabled', 'SecurityError');
      });
      sessionStorage.setItem = vi.fn(() => {
        throw new DOMException('Storage disabled', 'SecurityError');
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      resetStorageCache();

      const result = clear();

      expect(result).toBe(false);

      consoleErrorSpy.mockRestore();
      localStorage.setItem = originalLocalSetItem;
      sessionStorage.setItem = originalSessionSetItem;
    });

    it('returns false for has when no storage is available', () => {
      resetStorageCache();

      const originalLocalSetItem = localStorage.setItem;
      const originalSessionSetItem = sessionStorage.setItem;

      localStorage.setItem = vi.fn(() => {
        throw new DOMException('Storage disabled', 'SecurityError');
      });
      sessionStorage.setItem = vi.fn(() => {
        throw new DOMException('Storage disabled', 'SecurityError');
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      resetStorageCache();

      const result = has('noStorage');

      expect(result).toBe(false);

      consoleErrorSpy.mockRestore();
      localStorage.setItem = originalLocalSetItem;
      sessionStorage.setItem = originalSessionSetItem;
    });
  });

  describe('complex data round-trip', () => {
    it('correctly round-trips a complex nested object', () => {
      const complexData = {
        id: 'usr-001',
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        accounts: [
          { id: 'acc-001', type: 'checking', balance: 12450.75 },
          { id: 'acc-002', type: 'savings', balance: 45200.0 },
        ],
        settings: {
          theme: 'dark',
          notifications: {
            email: true,
            sms: false,
          },
        },
        tags: ['premium', 'verified'],
      };

      set('complexUser', complexData);
      const result = get('complexUser');

      expect(result).toEqual(complexData);
      expect(result.accounts).toHaveLength(2);
      expect(result.accounts[0].balance).toBe(12450.75);
      expect(result.settings.notifications.email).toBe(true);
      expect(result.tags).toEqual(['premium', 'verified']);
    });

    it('correctly round-trips an array of users', () => {
      const users = [
        { id: '1', email: 'user1@example.com' },
        { id: '2', email: 'user2@example.com' },
        { id: '3', email: 'user3@example.com' },
      ];

      set('users', users);
      const result = get('users');

      expect(result).toEqual(users);
      expect(result).toHaveLength(3);
    });
  });

  describe('edge cases', () => {
    it('handles empty string value', () => {
      set('empty', '');
      expect(get('empty')).toBe('');
    });

    it('handles zero value', () => {
      set('zero', 0);
      expect(get('zero')).toBe(0);
    });

    it('handles empty object', () => {
      set('emptyObj', {});
      expect(get('emptyObj')).toEqual({});
    });

    it('handles empty array', () => {
      set('emptyArr', []);
      expect(get('emptyArr')).toEqual([]);
    });

    it('overwrites existing key with new value', () => {
      set('overwrite', 'first');
      expect(get('overwrite')).toBe('first');

      set('overwrite', 'second');
      expect(get('overwrite')).toBe('second');
    });

    it('handles multiple set/get/remove operations in sequence', () => {
      set('a', 1);
      set('b', 2);
      set('c', 3);

      expect(get('a')).toBe(1);
      expect(get('b')).toBe(2);
      expect(get('c')).toBe(3);

      remove('b');

      expect(get('a')).toBe(1);
      expect(get('b')).toBeNull();
      expect(get('c')).toBe(3);

      clear();

      expect(get('a')).toBeNull();
      expect(get('c')).toBeNull();
    });
  });
});