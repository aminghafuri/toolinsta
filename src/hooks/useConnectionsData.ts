import { useState, useEffect } from 'react';
import { loadEssentialConnectionsData, clearEssentialConnectionsData, EssentialConnectionsData } from '@/lib/essentialStorage';

export const useConnectionsData = () => {
  const [data, setData] = useState<EssentialConnectionsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        setLoading(true);
        const connectionsData = loadEssentialConnectionsData();
        setData(connectionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load connections data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const clearData = () => {
    try {
      clearEssentialConnectionsData();
      setData(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear data');
    }
  };

  return { data, loading, error, clearData };
};
