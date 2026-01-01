export interface Prompt {
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

export interface User {
  userId: string;
  userName: string;
  userRole: string;
}

export interface Brand {
  brandId: string;
  brandName: string;
  brandDescription?: string;
}

export interface MediaThumbnailProps {
  imagePath: string;
  className?: string;
  objectFit?: "cover" | "contain";
}

export interface PromptModalProps {
  prompt: Prompt | null;
  isOpen: boolean;
  onClose: () => void;
  onEvaluate?: (promptId: string) => void;
  evaluatingPromptId?: string | null;
}