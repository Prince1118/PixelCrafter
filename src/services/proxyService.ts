// Proxy service to handle API calls through Netlify functions or direct calls
class ProxyService {
  private isProduction: boolean;

  constructor() {
    this.isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  }

  async makeHuggingFaceRequest(modelId: string, payload: any, apiKey: string, signal?: AbortSignal): Promise<Response> {
    const baseUrl = this.isProduction 
      ? '/api/huggingface' // Use Netlify proxy in production
      : 'https://api-inference.huggingface.co'; // Direct call in development

    const url = `${baseUrl}/models/${modelId}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Always use Authorization header as Hugging Face expects it
    headers['Authorization'] = `Bearer ${apiKey}`;

    return fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
      mode: this.isProduction ? 'same-origin' : 'cors',
      signal,
    });
  }

  isProductionEnvironment(): boolean {
    return this.isProduction;
  }
}

export const proxyService = new ProxyService();