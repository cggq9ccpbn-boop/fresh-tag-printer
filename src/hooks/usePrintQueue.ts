import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { PrintQueueItem } from '@/types';

const PRINT_QUEUE_KEY = 'food-labels-print-queue';

export function usePrintQueue() {
  const [queue, setQueue] = useLocalStorage<PrintQueueItem[]>(PRINT_QUEUE_KEY, []);

  const addToQueue = useCallback((item: Omit<PrintQueueItem, 'id' | 'createdAt'>) => {
    const newItem: PrintQueueItem = {
      ...item,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };
    setQueue((prev) => [...prev, newItem]);
    return newItem;
  }, [setQueue]);

  const removeFromQueue = useCallback((id: string) => {
    setQueue((prev) => prev.filter((item) => item.id !== id));
  }, [setQueue]);

  const updateQueueItem = useCallback((id: string, updates: Partial<Omit<PrintQueueItem, 'id' | 'createdAt'>>) => {
    setQueue((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }, [setQueue]);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, [setQueue]);

  const getQueueCount = () => {
    return queue.reduce((sum, item) => sum + item.quantity, 0);
  };

  return {
    queue,
    addToQueue,
    removeFromQueue,
    updateQueueItem,
    clearQueue,
    getQueueCount,
  };
}
