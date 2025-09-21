import { useState, useEffect, useCallback } from 'react';
import { useActiveAccount } from 'thirdweb/react';
import { getUserBatches, getBatchSteps, getUserCredits, BatchInfo, StepInfo } from '../utils/thirdwebInsights';

export function useThirdwebData() {
  const account = useActiveAccount();
  const [batches, setBatches] = useState<BatchInfo[]>([]);
  const [credits, setCredits] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshData = useCallback(async () => {
    if (!account?.address) {
      setBatches([]);
      setCredits(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [batchesData, creditsData] = await Promise.all([
        getUserBatches(account.address),
        getUserCredits(account.address)
      ]);

      setBatches(batchesData);
      setCredits(creditsData);
    } catch (err) {
      console.error('Errore nel caricare i dati:', err);
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }, [account?.address]);

  // Carica i dati quando l'account cambia
  useEffect(() => {
    refreshData();
  }, [refreshData]);

  return {
    batches,
    credits,
    loading,
    error,
    refreshData
  };
}

export function useBatchSteps(batchId: bigint | null) {
  const [steps, setSteps] = useState<StepInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadSteps = useCallback(async () => {
    if (!batchId) {
      setSteps([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const stepsData = await getBatchSteps(batchId);
      setSteps(stepsData);
    } catch (err) {
      console.error('Errore nel caricare gli step:', err);
      setError(err instanceof Error ? err.message : 'Errore sconosciuto');
    } finally {
      setLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    loadSteps();
  }, [loadSteps]);

  return {
    steps,
    loading,
    error,
    refreshSteps: loadSteps
  };
}