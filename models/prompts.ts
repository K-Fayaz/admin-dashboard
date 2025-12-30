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
      sizeCompliance: Number,
      subjectAdherence: Number,
      creativity: Number,
      moodConsistency: Number,
      endScore: Number,
      evaluatedAt: Date,
    },
  });
  
  export const Prompt = mongoose.models.Prompt || mongoose.model('Prompt', PromptSchema);
  