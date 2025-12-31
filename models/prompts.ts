import mongoose from 'mongoose';

const PromptSchema = new mongoose.Schema({
    imagePath: { type: String, required: true },
    prompt: { type: String, required: true },
    LLM_Model: String,
    channel: String,
    userId: { type: String, required: true },
    brandId: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    evaluation: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Evaluation', 
      default: null 
    },
  });
  
  export const Prompt = mongoose.models.Prompt || mongoose.model('Prompt', PromptSchema);
  