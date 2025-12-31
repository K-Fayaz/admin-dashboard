"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaExpandAlt } from "react-icons/fa";
import MediaThumbnail from "./components/MediaThumbnail";
import PromptModal from "./components/PromptModal";
import type { Prompt } from "./components/types";
import { usePrompts } from "../../hooks/usePrompts";

export default function AdminPage() {
  const router = useRouter();
  const [filter, setFilter] = useState<string | null>(null);
  const { prompts, loading, error, refetch } = usePrompts(filter ?? undefined);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [evaluatingPromptId, setEvaluatingPromptId] = useState<string | null>(null);

  const truncatePrompt = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleEvaluate = async (promptId: string) => {
    setEvaluatingPromptId(promptId);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/');
        return;
      }

      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: promptId }),
      });

      if (response.status === 401 || response.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        router.push('/');
        return;
      }

      const data = await response.json();
      if (data.success) {
        console.log('Evaluation successful');

        const evalObj = data.evaluation;

        // If modal is already open for this prompt, attach evaluation directly
        if (selectedPrompt && selectedPrompt._id === promptId) {
          setSelectedPrompt({ ...selectedPrompt, evaluation: evalObj });
        } else {
          // Try to find the prompt in the current list and open modal with evaluation
          const found = prompts.find((p) => p._id === promptId);
          if (found) {
            setSelectedPrompt({ ...found, evaluation: evalObj });
            setIsModalOpen(true);

            // Trigger a background refetch to update list state (don't need to await)
            refetch().catch((err) => console.warn('Refetching prompts failed:', err));
          } else {
            // As a fallback, refetch and try to find it in the refreshed list
            try {
              const refreshed = await refetch();
              if (refreshed) {
                const foundAfter = refreshed.find((p) => p._id === promptId);
                if (foundAfter) {
                  setSelectedPrompt({ ...foundAfter, evaluation: evalObj });
                  setIsModalOpen(true);
                }
              }
            } catch (err) {
              console.warn('Refetching prompts failed:', err);
            }
          }
        }
      } else {
        console.error('Evaluation failed:', data.error);
      }
    } catch (error) {
      console.error('Error calling evaluate API:', error);
    } finally {
      setEvaluatingPromptId(null);
    }
  }; 

  const handleCardEvaluate = (e: React.MouseEvent, promptId: string) => {
    e.stopPropagation(); // Prevent opening modal
    // Find the prompt object and disallow re-evaluating an already-evaluated prompt
    const promptObj = prompts.find((p) => p._id === promptId);
    if (!promptObj) return;
    if (promptObj.evaluation) return; // already evaluated
    if (evaluatingPromptId !== null) return;
    handleEvaluate(promptId);
  }; 

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-center">
          <p className="text-lg text-zinc-600 dark:text-zinc-400">Loading prompts...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <div className="text-center">
          <p className="text-lg text-red-600 dark:text-red-400">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50 font-sans dark:bg-black">
      <main className="container mx-auto px-6 py-8">
        <h1 className="mb-8 text-center text-3xl font-semibold text-black dark:text-zinc-50">
          Admin Dashboard
        </h1>

        <div className="mb-6 flex items-center justify-center">
          <label className="mr-3 text-sm text-zinc-700 dark:text-zinc-300">Filter:</label>
          <select
            value={filter ?? ''}
            onChange={(e) => setFilter(e.target.value || null)}
            className="rounded-md border px-3 py-2 text-sm bg-white text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
          >
            <option value="">All</option>
            <option value="newest_first">Newest First</option>
            <option value="oldest_first">Oldest First</option>
            <option value="highest_score">Highest Score</option>
            <option value="lowest_score">Lowest Score</option>
            <option value="not_evaluated">Not Evaluated</option>
            <option value="evaluated">Evaluated</option>
          </select>
        </div>
        
        {prompts.length === 0 ? (
          <div className="text-center">
            <p className="text-lg text-zinc-600 dark:text-zinc-400">No prompts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {prompts.map((prompt) => {
              const isEvaluated = !!prompt.evaluation;
              const isDisabled = isEvaluated || (evaluatingPromptId !== null && evaluatingPromptId !== prompt._id);
              return (
                <div
                  key={prompt._id}
                  className="group cursor-pointer overflow-hidden rounded-lg bg-white shadow-lg transition-shadow hover:shadow-xl dark:bg-zinc-900"
                  onClick={() => {
                    setSelectedPrompt(prompt);
                    setIsModalOpen(true);
                  }}
                >
                  {/* Thumbnail Image/Video */}
                  <div className="relative h-48 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                    <MediaThumbnail imagePath={prompt.imagePath} />
                    {/* Expand Icon */}
                    <div className="absolute right-2 top-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <FaExpandAlt className="text-2xl text-black drop-shadow-lg" />
                    </div>
                  </div>
                  
                  {/* Card Content */}
                  <div className="p-4">
                    {/* Prompt Text */}
                    <p className="mb-4 line-clamp-2 text-sm text-zinc-700 dark:text-zinc-300">
                      {truncatePrompt(prompt.prompt, 100)}
                    </p>
                    
                    {/* Evaluate Button */}
                    <button
                      className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''} ${isEvaluated ? 'bg-gray-500' : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600'}`}
                      onClick={(e) => handleCardEvaluate(e, prompt._id)}
                      disabled={isDisabled}
                      aria-busy={evaluatingPromptId === prompt._id}
                    >
                      {evaluatingPromptId === prompt._id ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                          </svg>
                          Evaluating...
                        </span>
                      ) : (isEvaluated ? 'Evaluated' : 'Evaluate')}
                    </button> 
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal */}
      <PromptModal
        prompt={selectedPrompt}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedPrompt(null);
        }}
        onEvaluate={handleEvaluate}
        evaluatingPromptId={evaluatingPromptId}
      />
    </div>
  );
}

