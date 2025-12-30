"use client";

import { useState } from "react";

interface MediaThumbnailProps {
  imagePath: string;
  className?: string;
  objectFit?: "cover" | "contain";
}

export default function MediaThumbnail({ 
  imagePath, 
  className = "", 
  objectFit = "cover" 
}: MediaThumbnailProps) {
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

