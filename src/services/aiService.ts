// AI Service for handling image generation with Hugging Face API via Netlify Function
export interface AIModel {
  id: string;
  name: string;
  description: string;
  provider: 'huggingface' | 'replicate' | 'openai' | 'stability';
  modelId: string;
  maxWidth: number;
  maxHeight: number;
  supportsBatch: boolean;
}

export const AI_MODELS: AIModel[] = [
  {
    id: 'stable-diffusion-xl-base',
    name: 'Stable Diffusion XL Base',
    description: 'High-quality image generation with SDXL',
    provider: 'huggingface',
    modelId: 'stabilityai/stable-diffusion-xl-base-1.0',
    maxWidth: 1024,
    maxHeight: 1024,
    supportsBatch: true
  },
  {
    id: 'stable-diffusion-v2-1',
    name: 'Stable Diffusion v2.1',
    description: 'Improved version with better quality',
    provider: 'huggingface',
    modelId: 'stabilityai/stable-diffusion-2-1',
    maxWidth: 768,
    maxHeight: 768,
    supportsBatch: true
  },
  {
    id: 'dreamlike-photoreal',
    name: 'Dreamlike Photoreal',
    description: 'Photorealistic image generation',
    provider: 'huggingface',
    modelId: 'dreamlike-art/dreamlike-photoreal-2.0',
    maxWidth: 512,
    maxHeight: 512,
    supportsBatch: true
  }
];

export interface GenerationParams {
  prompt: string;
  model: string;
  width: number;
  height: number;
  batchSize: number;
  negativePrompt?: string;
  guidanceScale?: number;
  steps?: number;
}

export interface GenerationResult {
  id: string;
  url: string;
  prompt: string;
  model: string;
  timestamp: Date;
  dimensions: { width: number; height: number };
}

class AIService {
  // No API key logic needed, handled by backend

  // Use Netlify Function for image generation
  private async callNetlifyFunction(modelId: string, payload: any): Promise<{ image: string; contentType: string }> {
    const response = await fetch('/.netlify/functions/generate-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ modelId, payload }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to generate image');
    }
    return response.json();
  }

  async generateImages(params: GenerationParams): Promise<GenerationResult[]> {
    const model = AI_MODELS.find(m => m.id === params.model);
    if (!model) {
      throw new Error('Model not found');
    }
    const results: GenerationResult[] = [];
    for (let i = 0; i < params.batchSize; i++) {
      try {
        const payload = {
          inputs: params.prompt,
          parameters: {
            negative_prompt: params.negativePrompt || 'blurry, low quality, distorted',
            guidance_scale: params.guidanceScale || 7.5,
            num_inference_steps: params.steps || 20,
            width: Math.min(params.width, model.maxWidth),
            height: Math.min(params.height, model.maxHeight),
            scheduler: 'DPMSolverMultistepScheduler',
            safety_checker: true,
            return_dict: true
          },
          options: {
            wait_for_model: true,
            use_cache: false
          }
        };
        const { image, contentType } = await this.callNetlifyFunction(model.modelId, payload);
        // Convert base64 to Blob URL
        const byteCharacters = atob(image);
        const byteNumbers = new Array(byteCharacters.length);
        for (let j = 0; j < byteCharacters.length; j++) {
          byteNumbers[j] = byteCharacters.charCodeAt(j);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: contentType });
        const imageUrl = URL.createObjectURL(blob);
        results.push({
          id: `generated-${Date.now()}-${i}`,
          url: imageUrl,
          prompt: params.prompt,
          model: model.name,
          timestamp: new Date(),
          dimensions: {
            width: Math.min(params.width, model.maxWidth),
            height: Math.min(params.height, model.maxHeight)
          }
        });
        if (i < params.batchSize - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (error: any) {
        if (i === 0) throw error;
        break;
      }
    }
    if (results.length === 0) {
      throw new Error('Failed to generate any images. Please try again.');
    }
    return results;
  }

  // Dummy API status check (always returns true, since backend handles key)
  async checkApiStatus(): Promise<boolean> {
    return true;
  }

  // No API key logic needed
  getApiKey(): string | null {
    return null;
  }
  setApiKey(key: string) {}
  isProductionEnvironment(): boolean {
    return true;
  }
}

export const aiService = new AIService();