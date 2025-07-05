import { motion } from 'framer-motion';
import { useImageGallery } from '../contexts/ImageGalleryContext';
import { 
  Search, 
  Grid3X3, 
  List, 
  Download, 
  Heart, 
  Share2, 
  Trash2,
  Eye,
  Star,
  Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';

const Gallery: React.FC = () => {
  const { images, removeImage, toggleFavorite } = useImageGallery();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedImages, setSelectedImages] = useState<string[]>([]);

  const filteredImages = images.filter(image => {
    const matchesSearch = image.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.model.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || 
                         (selectedFilter === 'favorites' && image.isFavorite) ||
                         image.model.toLowerCase().includes(selectedFilter.toLowerCase());
    return matchesSearch && matchesFilter;
  });

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const downloadImage = (imageUrl: string, prompt: string) => {
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
              link.download = `pixelcrafter-${prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(url);
              toast.success('Image downloaded successfully!');
            }
          }, 'image/png');
        };
        img.src = imageUrl;
      } else {
        // For regular URLs
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `pixelcrafter-${prompt.slice(0, 20).replace(/[^a-zA-Z0-9]/g, '-')}-${Date.now()}.jpg`;
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

  const shareImage = (imageUrl: string, prompt: string) => {
    if (navigator.share) {
      navigator.share({
        title: 'PixelCrafter Generated Image',
        text: `Check out this AI-generated image: "${prompt}"`,
        url: imageUrl
      }).then(() => {
        toast.success('Image shared successfully!');
      }).catch(() => {
        toast.error('Failed to share image');
      });
    } else {
      navigator.clipboard.writeText(imageUrl).then(() => {
        toast.success('Image URL copied to clipboard!');
      }).catch(() => {
        toast.error('Failed to copy image URL');
      });
    }
  };

  const deleteImage = (imageId: string) => {
    if (window.confirm('Are you sure you want to delete this image?')) {
      removeImage(imageId);
      setSelectedImages(prev => prev.filter(id => id !== imageId));
      toast.success('Image deleted successfully!');
    }
  };

  const deleteSelectedImages = () => {
    if (selectedImages.length === 0) {
      toast.error('No images selected');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedImages.length} selected image(s)?`)) {
      selectedImages.forEach(imageId => removeImage(imageId));
      setSelectedImages([]);
      toast.success(`${selectedImages.length} image(s) deleted successfully!`);
    }
  };

  const favoriteImage = (imageId: string) => {
    toggleFavorite(imageId);
    const image = images.find(img => img.id === imageId);
    if (image) {
      toast.success(image.isFavorite ? 'Removed from favorites!' : 'Added to favorites!');
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

  const filters = [
    { value: 'all', label: 'All Images' },
    { value: 'favorites', label: 'Favorites' },
    { value: 'stable-diffusion-xl', label: 'Stable Diffusion XL' },
    { value: 'dalle-3', label: 'DALL-E 3' },
    { value: 'midjourney', label: 'Midjourney' },
    { value: 'realistic', label: 'Realistic' },
    { value: 'anime', label: 'Anime Style' },
    { value: 'sketch', label: 'Sketch Style' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-dark-700"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Image Gallery</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {filteredImages.length} images in your collection
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-gray-100 dark:bg-dark-700 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white dark:bg-dark-600 text-primary-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-md transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white dark:bg-dark-600 text-primary-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search images, prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={selectedFilter}
              onChange={(e) => setSelectedFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-dark-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            >
              {filters.map((filter) => (
                <option key={filter.value} value={filter.value}>
                  {filter.label}
                </option>
              ))}
            </select>
            
            {selectedImages.length > 0 && (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedImages.length} selected
                </span>
                <button 
                  onClick={deleteSelectedImages}
                  className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Image Grid/List */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white dark:bg-dark-800 rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="aspect-square overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.prompt}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
                    onClick={() => viewImageFullscreen(image.url, image.prompt)}
                  />
                </div>
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white text-sm font-medium line-clamp-2 mb-2">
                      {image.prompt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-300 bg-black/30 px-2 py-1 rounded">
                          {image.model}
                        </span>
                        {image.isFavorite && (
                          <Heart className="w-3 h-3 text-red-500 fill-current" />
                        )}
                      </div>
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            viewImageFullscreen(image.url, image.prompt);
                          }}
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                        >
                          <Eye className="w-4 h-4 text-white" />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            favoriteImage(image.id);
                          }}
                          className={`p-2 backdrop-blur-sm rounded-lg transition-colors ${
                            image.isFavorite 
                              ? 'bg-red-500/30 hover:bg-red-500/40' 
                              : 'bg-white/20 hover:bg-white/30'
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${image.isFavorite ? 'text-red-400 fill-current' : 'text-white'}`} />
                        </button>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadImage(image.url, image.prompt);
                          }}
                          className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                        >
                          <Download className="w-4 h-4 text-white" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Selection Checkbox */}
                <div className="absolute top-3 left-3">
                  <input
                    type="checkbox"
                    checked={selectedImages.includes(image.id)}
                    onChange={() => toggleImageSelection(image.id)}
                    className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-xl border border-gray-200 dark:border-dark-700 overflow-hidden">
            <div className="divide-y divide-gray-200 dark:divide-dark-700">
              {filteredImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.02 }}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedImages.includes(image.id)}
                      onChange={() => toggleImageSelection(image.id)}
                      className="w-4 h-4 text-primary-600 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
                    />
                    
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-16 h-16 object-cover rounded-lg cursor-pointer"
                      onClick={() => viewImageFullscreen(image.url, image.prompt)}
                    />
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {image.prompt}
                      </h3>
                      <div className="flex items-center space-x-4 mt-1">
                        <div className="flex items-center space-x-1 text-xs text-gray-500 dark:text-gray-400">
                          <Clock className="w-3 h-3" />
                          <span>{image.timestamp.toLocaleDateString()}</span>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-dark-600 px-2 py-1 rounded">
                          {image.model}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => viewImageFullscreen(image.url, image.prompt)}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                      >
                        <Eye className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                      <button 
                        onClick={() => favoriteImage(image.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          image.isFavorite 
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-600' 
                            : 'bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        <Heart className={`w-4 h-4 ${image.isFavorite ? 'fill-current' : ''}`} />
                      </button>
                      <button 
                        onClick={() => shareImage(image.url, image.prompt)}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                      >
                        <Share2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                      <button 
                        onClick={() => downloadImage(image.url, image.prompt)}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                      >
                        <Download className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                      </button>
                      <button 
                        onClick={() => deleteImage(image.id)}
                        className="p-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.div>

      {filteredImages.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <Star className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No images found
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Try adjusting your search terms or filters
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default Gallery;