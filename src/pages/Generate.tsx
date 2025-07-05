import { motion } from 'framer-motion';
import { 
  Wand2, 
  Settings, 
  Download, 
  RefreshCw, 
  Copy,
  Share2,
  Sparkles,
  Image as ImageIcon,
  Zap,
  Trash2,
  Eye,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useImageGallery } from '../contexts/ImageGalleryContext';
import { aiService, AI_MODELS, GenerationParams } from '../services/aiService';
import toast from 'react-hot-toast';

const Generate: React.FC = () => {
  const { addImage } = useImageGallery();
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const [selectedModel, setSelectedModel] = useState('stable-diffusion-xl-base');
  const [dimensions, setDimensions] = useState({ width: 1024, height: 1024 });
  const [batchSize, setBatchSize] = useState(1);
  const [negativePrompt, setNegativePrompt] = useState('blurry, low quality, distorted');
  const [guidanceScale, setGuidanceScale] = useState(7.5);
  const [steps, setSteps] = useState(20);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    // No longer needed as API key checks are removed
  }, []);

  const generateImages = async () => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    setIsGenerating(true);
    
    try {
      const params: GenerationParams = {
        prompt,
        model: selectedModel,
        width: dimensions.width,
        height: dimensions.height,
        batchSize,
        negativePrompt,
        guidanceScale,
        steps
      };

      const results = await aiService.generateImages(params);
      
      const imageUrls = results.map(result => result.url);
      setGeneratedImages(imageUrls);
      
      // Add to gallery
      results.forEach(result => {
        addImage(result);
      });
      
      toast.success(`Generated ${results.length} image${results.length > 1 ? 's' : ''} successfully!`);
    } catch (error: any) {
      console.error('Generation error:', error);
      
      // Show more specific error messages
      if (error.message.includes('CORS')) {
        toast.error('CORS error: This is a known issue in deployed environments. Please try running locally or contact support.');
      } else if (error.message.includes('Network error')) {
        toast.error('Network error: Please check your connection and try again.');
      } else {
        toast.error(error.message || 'Failed to generate images. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = (imageUrl: string, index: number) => {
    try {
      // For blob URLs, we need to handle them differently
      if (imageUrl.startsWith('blob:')) {
        // Create a canvas to convert blob to downloadable format
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `pixelcrafter-${prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}-${index + 1}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              toast.success('Image downloaded successfully!');
            }
          }, 'image/png');
        };
        img.onerror = () => {
          toast.error('Failed to download image');
        };
        img.src = imageUrl;
      } else {
        // For regular URLs
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `pixelcrafter-${prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}-${index + 1}.jpg`;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success('Image downloaded successfully!');
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
      toast.success('Image opened in new tab!');
    }
  };

  const copyImageUrl = (imageUrl: string) => {
    navigator.clipboard.writeText(imageUrl).then(() => {
      toast.success('Image URL copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy image URL');
    });
  };

  const shareImage = (imageUrl: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'Generated Image from PixelCrafter',
        text: `Check out this AI-generated image: "${prompt}"`,
        url: imageUrl
      }).then(() => {
        toast.success('Image shared successfully!');
      }).catch(() => {
        toast.error('Failed to share image');
      });
    } else {
      copyImageUrl(imageUrl);
    }
  };

  const deleteGeneratedImage = (index: number) => {
    if (window.confirm('Are you sure you want to delete this generated image?')) {
      const newImages = generatedImages.filter((_, i) => i !== index);
      setGeneratedImages(newImages);
      toast.success('Image deleted successfully!');
    }
  };

  const clearAllImages = () => {
    if (generatedImages.length === 0) {
      toast.error('No images to clear');
      return;
    }

    if (window.confirm('Are you sure you want to clear all generated images?')) {
      setGeneratedImages([]);
      toast.success('All images cleared successfully!');
    }
  };

  const viewImageFullscreen = (imageUrl: string, prompt: string) => {
    // Create a modal overlay instead of opening a new window
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.95);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      cursor: pointer;
    `;

    const img = document.createElement('img');
    img.src = imageUrl;
    img.style.cssText = `
      max-width: 90%;
      max-height: 90%;
      object-fit: contain;
      border-radius: 8px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    `;

    const info = document.createElement('div');
    info.style.cssText = `
      position: absolute;
      bottom: 20px;
      left: 20px;
      right: 20px;
      color: white;
      background: rgba(0, 0, 0, 0.8);
      padding: 16px;
      border-radius: 8px;
      backdrop-filter: blur(10px);
      max-width: 500px;
      margin: 0 auto;
    `;
    info.innerHTML = `
      <div style="font-weight: 600; margin-bottom: 8px;">Prompt:</div>
      <div style="font-size: 14px; line-height: 1.4;">${prompt}</div>
    `;

    const closeButton = document.createElement('button');
    closeButton.innerHTML = '×';
    closeButton.style.cssText = `
      position: absolute;
      top: 20px;
      right: 20px;
      background: rgba(255, 255, 255, 0.2);
      border: none;
      color: white;
      font-size: 24px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(10px);
      transition: background 0.2s;
    `;

    closeButton.onmouseover = () => {
      closeButton.style.background = 'rgba(255, 255, 255, 0.3)';
    };
    closeButton.onmouseout = () => {
      closeButton.style.background = 'rgba(255, 255, 255, 0.2)';
    };

    const closeModal = () => {
      document.body.removeChild(modal);
      document.body.style.overflow = '';
    };

    closeButton.onclick = closeModal;
    modal.onclick = (e) => {
      if (e.target === modal) closeModal();
    };

    // Handle escape key
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeModal();
        document.removeEventListener('keydown', handleEscape);
      }
    };
    document.addEventListener('keydown', handleEscape);

    modal.appendChild(img);
    modal.appendChild(info);
    modal.appendChild(closeButton);
    document.body.appendChild(modal);
    document.body.style.overflow = 'hidden';

    // Prevent image from being draggable
    img.ondragstart = () => false;
  };

  const selectedModelInfo = AI_MODELS.find(m => m.id === selectedModel);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
      {/* Left Panel - Controls */}
      <div className="lg:col-span-1 space-y-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-dark-700"
        >
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg">
              <Wand2 className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">AI Image Generation</h2>
          </div>

          {/* Production Environment Warning */}
          {aiService.isProductionEnvironment() && (
            <div className="mb-6 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg">
              <div className="flex items-start space-x-2">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Production Environment Detected
                  </p>
                  <p className="text-xs text-orange-700 dark:text-orange-300 mt-1">
                    CORS restrictions may prevent API calls. If generation fails, try running the app locally.
                  </p>
                </div>
            </div>
          )}

          {/* Prompt Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Describe what you want to create
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your prompt here..."
              rows={4}
              className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Be specific and detailed for best results. The AI can generate any image you describe.
            </p>
          </div>

          {/* Model Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              AI Model
            </label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
            >
              {AI_MODELS.map((model) => (
                <option key={model.id} value={model.id}>
                  {model.name} - {model.description}
                </option>
              ))}
            </select>
            {selectedModelInfo && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Max: {selectedModelInfo.maxWidth}x{selectedModelInfo.maxHeight} • Provider: {selectedModelInfo.provider}
              </p>
            )}
          </div>

          {/* Basic Settings */}
          <div className="space-y-4 mb-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Width</label>
                <input
                  type="number"
                  value={dimensions.width}
                  onChange={(e) => setDimensions(prev => ({ ...prev, width: parseInt(e.target.value) }))}
                  min="256"
                  max={selectedModelInfo?.maxWidth || 1024}
                  step="64"
                  className="w-full p-2 text-sm border border-gray-300 dark:border-dark-600 rounded-md focus:ring-1 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Height</label>
                <input
                  type="number"
                  value={dimensions.height}
                  onChange={(e) => setDimensions(prev => ({ ...prev, height: parseInt(e.target.value) }))}
                  min="256"
                  max={selectedModelInfo?.maxHeight || 1024}
                  step="64"
                  className="w-full p-2 text-sm border border-gray-300 dark:border-dark-600 rounded-md focus:ring-1 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                Batch Size: {batchSize}
              </label>
              <input
                type="range"
                min="1"
                max="4"
                value={batchSize}
                onChange={(e) => setBatchSize(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <div className="mb-6">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-between w-full p-3 bg-gray-50 dark:bg-dark-700 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition-colors"
            >
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Advanced Settings</span>
              <Settings className={`w-4 h-4 text-gray-500 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
            </button>
            
            {showAdvanced && (
              <div className="mt-4 space-y-4 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Negative Prompt
                  </label>
                  <textarea
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    placeholder="What you don't want in the image..."
                    rows={2}
                    className="w-full p-2 text-sm border border-gray-300 dark:border-dark-600 rounded-md focus:ring-1 focus:ring-primary-500 bg-white dark:bg-dark-700 text-gray-900 dark:text-white resize-none"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Guidance Scale: {guidanceScale}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={guidanceScale}
                    onChange={(e) => setGuidanceScale(parseFloat(e.target.value))}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                    Steps: {steps}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={steps}
                    onChange={(e) => setSteps(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Generate Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={generateImages}
            disabled={isGenerating || !prompt.trim()}
            className="w-full bg-gradient-to-r from-primary-500 to-accent-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate Images</span>
              </>
            )}
          </motion.button>

          <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
            <Zap className="w-4 h-4" />
            <span>Powered by Hugging Face • Free Tier</span>
          </div>

          {/* API Key Notice */}
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 <strong>Note:</strong> Using Hugging Face Inference API for real AI generation. 
              First generation may take longer as the model loads.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right Panel - Results */}
      <div className="lg:col-span-2">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-dark-700 h-full"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Generated Images</h3>
            {generatedImages.length > 0 && (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={clearAllImages}
                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                  title="Clear all images"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors">
                  <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                </button>
              </div>
            )}
          </div>

          {isGenerating ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-gray-600 dark:text-gray-400">AI is creating your image...</p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">Prompt: "{prompt}"</p>
                <p className="text-xs text-gray-400 dark:text-gray-600 mt-1">
                  Model: {selectedModelInfo?.name} • {dimensions.width}x{dimensions.height}
                </p>
                {aiService.isProductionEnvironment() && (
                  <p className="text-xs text-orange-500 mt-2">
                    Note: First generation in production may take longer
                  </p>
                )}
              </div>
            </div>
          ) : generatedImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {generatedImages.map((image, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative"
                >
                  <img
                    src={image}
                    alt={`Generated: ${prompt}`}
                    className="w-full h-64 object-cover rounded-lg cursor-pointer"
                    onClick={() => viewImageFullscreen(image, prompt)}
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-3">
                    <button 
                      onClick={() => viewImageFullscreen(image, prompt)}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                      title="View fullscreen"
                    >
                      <Eye className="w-5 h-5 text-white" />
                    </button>
                    <button 
                      onClick={() => downloadImage(image, index)}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                      title="Download image"
                    >
                      <Download className="w-5 h-5 text-white" />
                    </button>
                    <button 
                      onClick={() => shareImage(image)}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                      title="Share image"
                    >
                      <Share2 className="w-5 h-5 text-white" />
                    </button>
                    <button 
                      onClick={() => copyImageUrl(image)}
                      className="p-3 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                      title="Copy image URL"
                    >
                      <Copy className="w-5 h-5 text-white" />
                    </button>
                    <button 
                      onClick={() => deleteGeneratedImage(index)}
                      className="p-3 bg-red-500/20 backdrop-blur-sm rounded-lg hover:bg-red-500/30 transition-colors"
                      title="Delete image"
                    >
                      <Trash2 className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  
                  {/* Image info overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-white text-sm font-medium line-clamp-2">"{prompt}"</p>
                    <p className="text-gray-300 text-xs">
                      {selectedModelInfo?.name} • {dimensions.width}x{dimensions.height}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <ImageIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 mb-2">No images generated yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  Enter any prompt to create amazing AI images
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Real AI generation powered by Hugging Face
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Generate;