"use client";

import { useEffect, useState } from "react";

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

function MediaThumbnail({ imagePath }: { imagePath: string }) {
  const [hasError, setHasError] = useState(false);
  const isVideoFile = (filePath: string): boolean => {
    const videoExtensions = ['mp4', 'webm', 'mov', 'avi', 'mkv', 'flv', 'wmv'];
    const ext = filePath.split('.').pop()?.toLowerCase();
    return ext ? videoExtensions.includes(ext) : false;
  };

  const isVideo = isVideoFile(imagePath);
  const mediaUrl = `/api/images/${imagePath}`;
  const placeholderSvg = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect fill='%23d4d4d8' width='400' height='300'/%3E%3Ctext fill='%23918196' font-family='sans-serif' font-size='20' dy='10.5' font-weight='bold' x='50%25' y='50%25' text-anchor='middle'%3ENo " + (isVideo ? "Video" : "Image") + "%3C/text%3E%3C/svg%3E";

  if (hasError) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <img
          src={placeholderSvg}
          alt="Placeholder"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <>
      {isVideo ? (
        <video
          src={mediaUrl}
          className="h-full w-full object-cover"
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
          className="h-full w-full object-cover"
          loading="lazy"
          onError={() => setHasError(true)}
        />
      )}
    </>
  );
}

export default function AdminPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                className="overflow-hidden rounded-lg bg-white shadow-lg transition-shadow hover:shadow-xl dark:bg-zinc-900"
              >
                {/* Thumbnail Image/Video */}
                <div className="relative h-48 w-full overflow-hidden bg-zinc-200 dark:bg-zinc-800">
                  <MediaThumbnail imagePath={prompt.imagePath} />
                </div>
                
                {/* Card Content */}
                <div className="p-4">
                  {/* Prompt Text */}
                  <p className="mb-4 line-clamp-2 text-sm text-zinc-700 dark:text-zinc-300">
                    {truncatePrompt(prompt.prompt, 50)}
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
    </div>
  );
}

