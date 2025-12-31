import { useEffect, useState } from 'react';

export function useEvaluation(evaluationId?: string | null, isOpen?: boolean) {
  const [evaluation, setEvaluation] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && evaluationId) {
      setLoading(true);
      fetch(`/api/evaluate?id=${encodeURIComponent(evaluationId)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setEvaluation(data.data);
            console.log('Fetched evaluation:', data.data);
          } else {
            setError(data.error || 'Failed to fetch evaluation');
            console.error('Error fetching evaluation:', data.error);
          }
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : 'Error fetching evaluation');
          console.error('Error fetching evaluation:', err);
        })
        .finally(() => setLoading(false));
    } else {
      setEvaluation(null);
      setError(null);
      setLoading(false);
    }
  }, [evaluationId, isOpen]);

  return { evaluation, loading, error };
}
