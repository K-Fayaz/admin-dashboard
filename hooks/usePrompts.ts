import { useEffect, useState } from "react";
import type { Prompt } from "../app/admin/components/types";

export function usePrompts() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPrompts() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          // not logged in, go to login
          window.location.href = '/';
          return;
        }

        const response = await fetch('/api/prompts', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          window.location.href = '/';
          return;
        }

        const data = await response.json();
        
        if (data.success) {
          setPrompts(data.data);
        } else {
          setError(data.error || "Failed to fetch prompts");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchPrompts();
  }, []);

  return { prompts, loading, error };
}

