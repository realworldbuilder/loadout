'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseAutosaveOptions {
  key: string;
  data: any;
  debounceMs?: number;
  enabled?: boolean;
}

interface UseAutosaveReturn {
  clearSavedData: () => void;
  hasRestoredData: boolean;
  getRestoredData: () => any | null;
}

export function useAutosave({ 
  key, 
  data, 
  debounceMs = 500, 
  enabled = true 
}: UseAutosaveOptions): UseAutosaveReturn {
  const [hasRestoredData, setHasRestoredData] = useState(false);
  const debounceTimer = useRef<NodeJS.Timeout>();
  const initialMount = useRef(true);
  const lastSavedData = useRef<string>('');

  const storageKey = `loadout_autosave_${key}`;

  // Save data to localStorage with debouncing
  const saveToStorage = useCallback((dataToSave: any) => {
    if (!enabled) return;
    
    const serializedData = JSON.stringify(dataToSave);
    
    // Don't save if data hasn't changed
    if (serializedData === lastSavedData.current) return;
    
    try {
      localStorage.setItem(storageKey, serializedData);
      localStorage.setItem(`${storageKey}_timestamp`, Date.now().toString());
      lastSavedData.current = serializedData;
    } catch (error) {
      console.warn('Failed to save to localStorage:', error);
    }
  }, [enabled, storageKey]);

  // Debounced save function
  const debouncedSave = useCallback((dataToSave: any) => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      saveToStorage(dataToSave);
    }, debounceMs);
  }, [saveToStorage, debounceMs]);

  // Get restored data from localStorage
  const getRestoredData = useCallback(() => {
    if (!enabled) return null;
    
    try {
      const saved = localStorage.getItem(storageKey);
      const timestamp = localStorage.getItem(`${storageKey}_timestamp`);
      
      if (!saved || !timestamp) return null;
      
      // Check if data is older than 24 hours
      const age = Date.now() - parseInt(timestamp);
      if (age > 24 * 60 * 60 * 1000) {
        // Clean up old data
        localStorage.removeItem(storageKey);
        localStorage.removeItem(`${storageKey}_timestamp`);
        return null;
      }
      
      return JSON.parse(saved);
    } catch (error) {
      console.warn('Failed to restore from localStorage:', error);
      return null;
    }
  }, [enabled, storageKey]);

  // Clear saved data
  const clearSavedData = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(`${storageKey}_timestamp`);
      lastSavedData.current = '';
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
    }
  }, [storageKey]);

  // Initialize: try to restore data on mount
  useEffect(() => {
    if (initialMount.current && enabled) {
      const restoredData = getRestoredData();
      if (restoredData) {
        setHasRestoredData(true);
        // Return the restored data so the component can use it
        // Note: This is handled by the component calling getRestoredData in useEffect
      }
      initialMount.current = false;
    }
  }, [enabled, getRestoredData]);

  // Auto-save when data changes (after initial mount)
  useEffect(() => {
    if (!initialMount.current && enabled && data) {
      debouncedSave(data);
    }
  }, [data, debouncedSave, enabled]);

  // Save on visibility change (critical for mobile Safari app switching)
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden && data) {
        // Save immediately when page becomes hidden
        saveToStorage(data);
      }
    };

    const handleBeforeUnload = () => {
      if (data) {
        // Save immediately before page unload
        saveToStorage(data);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [enabled, data, saveToStorage]);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return {
    clearSavedData,
    hasRestoredData,
    getRestoredData,
  };
}