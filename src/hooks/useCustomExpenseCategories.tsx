import { useState, useEffect, useCallback } from 'react';
import { ExpenseType } from '@/lib/expenseCategories';

export interface CustomCategory {
  id: string;
  name: string;
  type: ExpenseType;
  group: string;
}

const STORAGE_KEY = 'custom_expense_categories';

export function useCustomExpenseCategories() {
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customCategories));
  }, [customCategories]);

  const addCategory = useCallback((name: string, type: ExpenseType, group?: string) => {
    const trimmed = name.trim();
    if (!trimmed) return null;
    const id = `custom_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const cat: CustomCategory = {
      id,
      name: trimmed,
      type,
      group: group || 'Custom',
    };
    setCustomCategories(prev => [...prev, cat]);
    return cat;
  }, []);

  const removeCategory = useCallback((id: string) => {
    setCustomCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  const getCategoriesForType = useCallback(
    (type: ExpenseType) => customCategories.filter(c => c.type === type),
    [customCategories]
  );

  return { customCategories, addCategory, removeCategory, getCategoriesForType };
}
