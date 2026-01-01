import { useEffect, useState } from "react";
import type { Prompt } from "../components/types";

export function usePrompts(filter?: string) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function fetchPrompts(): Promise<Prompt[] | null> {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // not logged in, go to login
        window.location.href = '/';
        return null;
      }

      const url = filter ? `/api/prompts?filter=${encodeURIComponent(filter)}` : '/api/prompts';
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        window.location.href = '/';
        return null;
      }

      const data = await response.json();
      
      if (data.success) {
        setPrompts(data.data);
        return data.data;
      } else {
        setError(data.error || "Failed to fetch prompts");
        return null;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      return null;
    } finally {
      setLoading(false);
    }
  }

  // initial fetch and refetch on filter change
  useEffect(() => {
    fetchPrompts();
  }, [filter]);

  return { prompts, loading, error, refetch: fetchPrompts };
}

