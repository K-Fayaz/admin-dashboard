"use client";

import { useState } from "react";
import { FaExpandAlt } from "react-icons/fa";
import MediaThumbnail from "./components/MediaThumbnail";
import PromptModal from "./components/PromptModal";
import type { Prompt } from "./components/types";
import { usePrompts } from "../../hooks/usePrompts";

export default function AdminPage() {
  const { prompts, loading, error } = usePrompts();
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const truncatePrompt = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const handleEvaluate = async (promptId: string) => {
    try {
      const response = await fetch('/api/evaluate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: promptId }),
      });
      const data = await response.json();
      if (data.success) {
        console.log('Evaluation successful');
      } else {
        console.error('Evaluation failed:', data.error);
      }
    } catch (error) {
      console.error('Error calling evaluate API:', error);
    }
  };

  const handleCardEvaluate = (e: React.MouseEvent, promptId: string) => {
    e.stopPropagation(); // Prevent opening modal
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
        
        {prompts.length === 0 ? (
          <div className="text-center">
            <p className="text-lg text-zinc-600 dark:text-zinc-400">No prompts found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {prompts.map((prompt) => (
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
                    className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600"
                    onClick={(e) => handleCardEvaluate(e, prompt._id)}
                  >
                    Evaluate
                  </button>
                </div>
              </div>
            ))}
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
      />
    </div>
  );
}

