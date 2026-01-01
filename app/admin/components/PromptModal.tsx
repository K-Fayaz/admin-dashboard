"use client";

import { useEffect, useState } from 'react';
import { FaTimes } from "react-icons/fa";
import MediaThumbnail from "./MediaThumbnail";
import type { Prompt } from "./types";
import { useUserAndBrand } from "../hooks/useUserAndBrand";
import { useEvaluation } from "../hooks/useEvaluation";
import type { PromptModalProps } from "./types";
import { formatDate } from "../utils/utils";

export default function PromptModal({ prompt, isOpen, onClose, onEvaluate, evaluatingPromptId }: PromptModalProps) {
  
  const { user, brand, loading } = useUserAndBrand(
    prompt?.userId,
    prompt?.brandId,
    isOpen
  );

  // prompt.evaluation can be either an ObjectId (string) or a populated object.
  // If it's a populated object we don't need to re-fetch it — use it directly.
  const evalRef = (prompt as any)?.evaluation;
  const evaluationId = evalRef && typeof evalRef === 'string' ? evalRef : null;
  const preloadedEvaluation = evalRef && typeof evalRef === 'object' ? evalRef : null;

  const { evaluation: fetchedEvaluation, loading: evaluationLoading, error: evaluationError } = useEvaluation(evaluationId, isOpen);

  const evaluation = fetchedEvaluation ?? preloadedEvaluation ?? null;

  const [showDetails, setShowDetails] = useState(false);

  if (!isOpen || !prompt) return null;

  const isEvaluated = !!prompt.evaluation;
  const isDisabled = isEvaluated || (evaluatingPromptId !== null && evaluatingPromptId !== prompt._id);

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

          {/* Evaluation Display */}
          <div className="mt-6 border-t pt-4">
            {evaluationLoading ? (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading evaluation...</p>
            ) : evaluationError ? (
              <p className="text-sm text-red-600 dark:text-red-400">Error: {evaluationError}</p>
            ) : evaluation ? (
              <div>
                <div className="mb-3 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="mb-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">Score</h3>
                    <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{evaluation.score}</p>
                  </div>

                  <div className="flex-1">
                    <h3 className="mb-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">Summary</h3>
                    <p className="text-sm text-zinc-700 dark:text-zinc-300">{evaluation.summary}</p>
                  </div>
                </div>

                <div>
                  <button
                    onClick={() => setShowDetails((s) => !s)}
                    className="text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:underline cursor-pointer"
                  >
                    {showDetails ? 'Hide details' : 'Show size & brand details'}
                  </button>

                  {showDetails && (
                    <div className="mt-4 space-y-4 rounded-sm bg-zinc-50 p-4 text-sm dark:bg-zinc-800">
                      {/* Size Compliance */}
                      <div>
                        <h4 className="mb-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">Size Compliance</h4>
                        <p className="text-sm text-zinc-900 dark:text-zinc-50">Score: <strong>{evaluation.sizeCompliance?.score ?? '—'}</strong></p>
                        {evaluation.sizeCompliance?.reasoning && (
                          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{evaluation.sizeCompliance.reasoning}</p>
                        )}
                        <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">Optimal: {evaluation.sizeCompliance?.isOptimal ? 'Yes' : 'No'}</p>
                      </div>

                      {/* Brand Compliance */}
                      <div>
                        <h4 className="mb-1 text-sm font-semibold text-zinc-500 dark:text-zinc-400">Brand Compliance</h4>
                        <p className="text-sm text-zinc-900 dark:text-zinc-50">Score: <strong>{evaluation.brandCompliance?.score ?? '—'}</strong></p>

                        <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Style alignment: {evaluation.brandCompliance?.styleAlignment ?? '—'}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Color compliance: {evaluation.brandCompliance?.colorCompliance ?? '—'}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Voice consistency: {evaluation.brandCompliance?.voiceConsistency ?? '—'}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">Vision alignment: {evaluation.brandCompliance?.visionAlignment ?? '—'}</p>
                        </div>

                        {evaluation.brandCompliance?.reasoning && (
                          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">{evaluation.brandCompliance.reasoning}</p>
                        )}

                        {evaluation.brandCompliance?.strengths && (
                          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300"><strong>Strengths:</strong> {evaluation.brandCompliance.strengths}</p>
                        )}

                        {evaluation.brandCompliance?.improvements && (
                          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300"><strong>Improvements:</strong> {evaluation.brandCompliance.improvements}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No evaluation available for this prompt.</p>
            )}
          </div>

          {/* Evaluate Button */}
          <div className="mt-6">
            <button
              onClick={() => {
                if (!prompt) return;
                if (!onEvaluate) return;
                if (isEvaluated) return; // don't allow re-evaluating
                const isAnyEvaluating = evaluatingPromptId !== null && evaluatingPromptId !== undefined;
                const isThisEvaluating = evaluatingPromptId === prompt._id;
                if (isAnyEvaluating && !isThisEvaluating) return;
                onEvaluate(prompt._id);
              }}
              className={`w-full rounded-md px-4 py-2 text-sm font-medium text-white transition-colors ${isDisabled ? 'opacity-50 cursor-not-allowed bg-gray-500' : 'bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-700 dark:hover:bg-zinc-600'}`}
              disabled={isDisabled}
              aria-busy={evaluatingPromptId === prompt?._id}
            >
              {evaluatingPromptId === prompt?._id ? (
                <span className="inline-flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Evaluating...
                </span>
              ) : (
                isEvaluated ? 'Evaluated' : 'Evaluate'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

