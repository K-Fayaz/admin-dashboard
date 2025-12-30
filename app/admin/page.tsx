"use client";

import { useEffect, useState } from "react";
import { FaExpandAlt, FaTimes } from "react-icons/fa";

interface Prompt {
  _id: string;
  imagePath: string;
  prompt: string;
  LLM_Model?: string;
  channel?: string;
  userId: string;
  brandId: string;
  timestamp: Date;
  evaluation?: {
    sizeCompliance?: number;
    subjectAdherence?: number;
    creativity?: number;
    moodConsistency?: number;
    endScore?: number;
    evaluatedAt?: Date;
  };
}

interface User {
  userId: string;
  userName: string;
  userRole: string;
}

interface Brand {
  brandId: string;
  brandName: string;
  brandDescription?: string;
}

function MediaThumbnail({ 
  imagePath, 
  className = "", 
  objectFit = "cover" 
}: { 
  imagePath: string; 
  className?: string;
  objectFit?: "cover" | "contain";
}) {
  const [hasError, setHasError] = useState(false);
  const isVideoFile = (filePath: string): boolean => {
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv'];
    const ext = filePath.split('.').pop()?.toLowerCase();
    return ext ? videoExtensions.includes(ext) : false;
  };

  const isVideo = isVideoFile(imagePath);
  const mediaUrl = `/api/images/${imagePath}`;
  const placeholderSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23d4d4d8' width='400' height='300'/%3E%3Ctext fill='%23918196' font-family='sans-serif' font-size='20' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo " + (isVideo ? "Video" : "Image") + "%3C/text%3E%3C/svg%3E";

  const objectFitClass = objectFit === "contain" ? "object-contain" : "object-cover";

  if (hasError) {
    return (
      <div className={`flex h-full w-full items-center justify-center ${className}`}>
        <img
          src={placeholderSvg}
          alt="Placeholder"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }

  return (
    <>
      {isVideo ? (
        <video
          src={mediaUrl}
          className={`h-full w-full ${objectFitClass} ${className}`}
          controls
          muted
          playsInline
          preload="metadata"
          onError={() => setHasError(true)}
        />
      ) : (
        <img
          src={mediaUrl}
          alt="Prompt thumbnail"
          className={`h-full w-full ${objectFitClass} ${className}`}
          loading="lazy"
          onError={() => setHasError(true)}
        />
      )}
    </>
  );
}

function PromptModal({ 
  prompt, 
  isOpen, 
  onClose,
  onEvaluate
}: { 
  prompt: Prompt | null; 
  isOpen: boolean; 
  onClose: () => void;
  onEvaluate?: (promptId: string) => void;
}) {
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

export default function AdminPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    async function fetchPrompts() {
      try {
        const response = await fetch("/api/prompts");
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

  const truncatePrompt = (text: string, maxLength: number = 50) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
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
                    onClick={() => {
                      // TODO: Implement evaluate functionality
                      console.log("Evaluate clicked for prompt:", prompt._id);
                    }}
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
        onEvaluate={(promptId) => {
          // TODO: Implement evaluate functionality
          console.log("Evaluate clicked for prompt:", promptId);
        }}
      />
    </div>
  );
}

