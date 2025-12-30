"use client";

import { useEffect, useState } from "react";
import { FaTimes } from "react-icons/fa";
import MediaThumbnail from "./MediaThumbnail";
import type { Prompt, User, Brand } from "./types";

interface PromptModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onEvaluate?: (promptId: string) => void;
}

export default function PromptModal({ 
  prompt, 
  isOpen, 
  onClose,
  onEvaluate
}: PromptModalProps) {
  const [user, setUser] = useState<User | null>(null);
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && prompt) {
      setLoading(true);
      Promise.all([
        fetch(`/api/users/${prompt.userId}`).then(res => res.json()),
        fetch(`/api/brands/${prompt.brandId}`).then(res => res.json())
      ])
        .then(([userData, brandData]) => {
          if (userData.success) setUser(userData.data);
          if (brandData.success) setBrand(brandData.data);
        })
        .catch(err => console.error('Error fetching user/brand:', err))
        .finally(() => setLoading(false));
    } else {
      setUser(null);
      setBrand(null);
    }
  }, [isOpen, prompt]);

  if (!isOpen || !prompt) return null;

  const formatDate = (date: Date | string) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
      onClick={onClose}
    >
      <div 
        className="relative max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-white shadow-xl dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-full bg-black bg-opacity-50 p-2 text-white transition-colors cursor-pointer hover:bg-opacity-70 bg-gray-200"
        >
          <FaTimes className="text-black"/>
        </button>

        {/* Media */}
        <div className="relative flex min-h-96 w-full items-center justify-center bg-zinc-200 dark:bg-zinc-800">
          <MediaThumbnail imagePath={prompt.imagePath} objectFit="contain" className="max-h-96" />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Prompt */}
          <div className="mb-6">
            <h3 className="mb-2 text-sm font-semibold text-zinc-500 dark:text-zinc-400">Prompt</h3>
            <p className="text-lg text-zinc-900 dark:text-zinc-50">{prompt.prompt}</p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {prompt.LLM_Model && (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">LLM Model</h3>
                <p className="text-zinc-900 dark:text-zinc-50">{prompt.LLM_Model}</p>
              </div>
            )}
            
            {prompt.channel && (
              <div>
                <h3 className="mb-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">Channel</h3>
                <p className="text-zinc-900 dark:text-zinc-50">{prompt.channel}</p>
              </div>
            )}

            <div>
              <h3 className="mb-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">Date</h3>
              <p className="text-zinc-900 dark:text-zinc-50">
                {formatDate(prompt.timestamp)}
              </p>
            </div>

            {loading ? (
              <div className="col-span-2">
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading user and brand details...</p>
              </div>
            ) : (
              <>
                {user && (
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">User</h3>
                    <p className="text-zinc-900 dark:text-zinc-50">{user.userName}</p>
                  </div>
                )}

                {brand && (
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">Brand</h3>
                    <p className="text-zinc-900 dark:text-zinc-50">{brand.brandName}</p>
                    {brand.brandDescription && (
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{brand.brandDescription}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Evaluate Button */}
          <div className="mt-6">
            <button
              onClick={() => {
                if (onEvaluate && prompt) {
                  onEvaluate(prompt._id);
                }
              }}
              className="w-full rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600"
            >
              Evaluate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

