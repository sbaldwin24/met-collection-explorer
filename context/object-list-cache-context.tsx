'use client';

import type { ObjectDetails, ObjectListCacheEntryData, ObjectListCacheParams } from '@/lib/types';
import type React from 'react';
import { createContext, useCallback, useContext, useRef, useState } from 'react';

/** Check if we're running on the server */
const isServer = typeof window === 'undefined';

const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours
const OBJECT_LIST_CACHE_STORAGE_KEY = 'objectListCache';
const OBJECT_DETAIL_CACHE_STORAGE_KEY = 'objectDetailCache';
const MAX_CACHE_ENTRIES = 150;

/** Represents an item stored in the cache with its value and timestamp */
interface TimestampedItem<T> {
  value: T;
  timestamp: number;
}

/** Generic structure for a cache store mapping string keys to TimestampedItems */
type CacheStore<T> = Record<string, TimestampedItem<T>>;

/**
 * Loads a cache store from localStorage, evicting items that have exceeded their TTL
 *
 * @param storageKey The key used in localStorage
 * @param ttlMs Time-to-live in milliseconds
 * @returns The cache store with valid items, or an empty object if not found or on error
 */
function loadFromLocalStorageWithTTL<T>(storageKey: string, ttlMs: number): CacheStore<T> {
  if (isServer) {
    return {};
  }
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) {
      return {};
    }
    /** Type assertion used here; ensure data in localStorage matches CacheStore<T> structure */
    const parsed = JSON.parse(raw) as CacheStore<T>;
    const now = Date.now();
    const validCache: CacheStore<T> = {};

    for (const key in parsed) {
      if (Object.prototype.hasOwnProperty.call(parsed, key)) {
        const entry = parsed[key];

        /** Validate entry structure and timestamp before checking TTL */
        if (entry && typeof entry.timestamp === 'number' && now - entry.timestamp <= ttlMs) {
          validCache[key] = entry;
        }
      }
    }

    return validCache;
  } catch (error) {
    console.error(`Error loading cache from localStorage ('${storageKey}'):`, error);

    return {};
  }
}

/**
 * Trims a cache store to the most recent N entries by timestamp
 */
function trimCacheToMaxEntries<T>(cache: CacheStore<T>, maxEntries: number): CacheStore<T> {
  const entries = Object.entries(cache);
  if (entries.length <= maxEntries) return cache;
  // Sort by timestamp descending (most recent first)
  entries.sort((a, b) => b[1].timestamp - a[1].timestamp);
  // Take the most recent maxEntries
  const trimmed = entries.slice(0, maxEntries);
  // Rebuild the cache object
  return Object.fromEntries(trimmed);
}

/**
 * Saves a cache store to localStorage with quota handling and eviction
 *
 * @param storageKey The key to use in localStorage
 * @param cache The cache store to save
 * @param maxEntries Maximum number of entries to keep (default: MAX_CACHE_ENTRIES)
 */
function saveToLocalStorage<T>(storageKey: string, cache: CacheStore<T>, maxEntries: number = MAX_CACHE_ENTRIES): void {
  if (isServer) {
    return;
  }
  let trimmedCache = trimCacheToMaxEntries(cache, maxEntries);
  let attempts = 0;
  const maxAttempts = 3;
  while (attempts < maxAttempts) {
    try {
      localStorage.setItem(storageKey, JSON.stringify(trimmedCache));
      return;
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'name' in error &&
        (error as { name?: string }).name === 'QuotaExceededError'
      ) {
        // Evict more entries and retry
        const newMax = Math.max(10, Math.floor(trimmedCache && Object.keys(trimmedCache).length / 2));
        trimmedCache = trimCacheToMaxEntries(trimmedCache, newMax);
        attempts++;
      } else {
        console.error(`Error saving cache to localStorage ('${storageKey}'):`, error);
        return;
      }
    }
  }
  console.warn(
    `Unable to save cache to localStorage ('${storageKey}') after ${maxAttempts} attempts. Cache may be too large.`
  );
}

type ObjectListCacheState = CacheStore<ObjectListCacheEntryData>;

interface ObjectListCacheContextValue {
  getCacheEntry: (params: ObjectListCacheParams) => ObjectListCacheEntryData | undefined;
  setCacheEntry: (params: ObjectListCacheParams, data: ObjectListCacheEntryData) => void;
  lastPage: number;
  setLastPage: (page: number) => void;
  lastClickedIndex: number | null;
  setLastClickedIndex: (index: number | null) => void;
  getScrollPosition: () => number;
  setScrollPosition: (pos: number) => void;
}

/** Create a default context value that doesn't use any hooks - for server rendering */
const defaultContextValue: ObjectListCacheContextValue = {
  getCacheEntry: () => undefined,
  setCacheEntry: () => {},
  lastPage: 1,
  setLastPage: () => {},
  lastClickedIndex: null,
  setLastClickedIndex: () => {},
  getScrollPosition: () => 0,
  setScrollPosition: () => {}
};

const ObjectListCacheContext = createContext<ObjectListCacheContextValue>(defaultContextValue);

/**
 * Converts ObjectListCacheParams to a stable string key for use in the cache store
 * Sorts keys to ensure deterministic output regardless of param order
 */
function objectListCacheParamsToString(params: ObjectListCacheParams): string {
  const sortedParams: Partial<ObjectListCacheParams> = {};
  /** Only include defined properties in the key */
  const keys = Object.keys(params) as Array<keyof ObjectListCacheParams>;

  /** Sort keys for deterministic output */
  keys.sort((a, b) => a.localeCompare(b));

  /** Use for...of instead of forEach */
  for (const key of keys) {
    /** Only include defined properties in the key */
    if (params[key] !== undefined) {
      /** Use type assertion with a more specific approach */
      sortedParams[key] = params[key] as any;
    }
  }

  return JSON.stringify(sortedParams);
}

export const ObjectListCacheProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (isServer) {
    return <ObjectListCacheContext.Provider value={defaultContextValue}>{children}</ObjectListCacheContext.Provider>;
  }

  const [cache, setCacheState] = useState<ObjectListCacheState>(() =>
    loadFromLocalStorageWithTTL<ObjectListCacheEntryData>(OBJECT_LIST_CACHE_STORAGE_KEY, CACHE_TTL_MS)
  );
  const [lastPage, setLastPage] = useState(1);
  const [lastClickedIndex, setLastClickedIndex] = useState<number | null>(null);
  const scrollPositionRef = useRef<number>(0);

  const getCacheEntry = useCallback(
    (params: ObjectListCacheParams): ObjectListCacheEntryData | undefined => {
      const keyString = objectListCacheParamsToString(params);
      const entry = cache[keyString];

      if (!entry) {
        return undefined;
      }
      /** Check TTL for in-memory items, as they might have become stale since last load */
      if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
        return undefined;
      }

      return entry.value;
    },
    [cache]
  );

  const setCacheEntry = useCallback(
    (params: ObjectListCacheParams, data: ObjectListCacheEntryData) => {
      const keyString = objectListCacheParamsToString(params);
      const newEntry: TimestampedItem<ObjectListCacheEntryData> = {
        value: data,
        timestamp: Date.now()
      };
      const updatedCache = {
        ...cache,
        [keyString]: newEntry
      };
      setCacheState(updatedCache);
      saveToLocalStorage<ObjectListCacheEntryData>(OBJECT_LIST_CACHE_STORAGE_KEY, updatedCache);
    },
    [cache]
  );

  const setScrollPosition = useCallback((pos: number) => {
    scrollPositionRef.current = pos;
  }, []);

  const getScrollPosition = useCallback(() => {
    return scrollPositionRef.current;
  }, []);

  const contextValue: ObjectListCacheContextValue = {
    getCacheEntry,
    setCacheEntry,
    lastPage,
    setLastPage,
    lastClickedIndex,
    setLastClickedIndex,
    getScrollPosition,
    setScrollPosition
  };

  return <ObjectListCacheContext.Provider value={contextValue}>{children}</ObjectListCacheContext.Provider>;
};

export function useObjectListCache(): ObjectListCacheContextValue {
  /* If we're on the server, return the default context value */
  if (isServer) {
    return defaultContextValue;
  }

  const context = useContext(ObjectListCacheContext);
  /** This can no longer happen because we provide a default value to createContext */
  return context;
}

/** Represents a cached object detail, which can be the full ObjectDetails or a notFound marker */
export type CachedObjectDetailItem = ObjectDetails | { readonly notFound: true };

type ObjectDetailCacheStore = CacheStore<CachedObjectDetailItem>;

/**
 * Caches the details of a single object
 *
 * @param objectID The ID of the object
 * @param detail The object's details or a notFound marker
 */
export function cacheObjectDetailById(objectID: number, detail: CachedObjectDetailItem): void {
  const currentCache = loadFromLocalStorageWithTTL<CachedObjectDetailItem>(
    OBJECT_DETAIL_CACHE_STORAGE_KEY,
    CACHE_TTL_MS
  );

  const newEntry: TimestampedItem<CachedObjectDetailItem> = {
    value: detail,
    timestamp: Date.now()
  };

  const updatedCache: ObjectDetailCacheStore = {
    ...currentCache,
    [String(objectID)]: newEntry
  };

  saveToLocalStorage<CachedObjectDetailItem>(OBJECT_DETAIL_CACHE_STORAGE_KEY, updatedCache, MAX_CACHE_ENTRIES);
}

/**
 * Retrieves cached details for a single object if available and not stale
 *
 * @param objectID The ID of the object
 * @returns The cached object details or notFound marker, or undefined if not cached/stale
 */
export function getCachedObjectDetailById(objectID: number): CachedObjectDetailItem | undefined {
  /** Always loads from localStorage and applies TTL; ensures fresh data or already TTL-filtered data */
  const cache = loadFromLocalStorageWithTTL<CachedObjectDetailItem>(OBJECT_DETAIL_CACHE_STORAGE_KEY, CACHE_TTL_MS);
  const entry = cache[String(objectID)];

  return entry?.value;
}
