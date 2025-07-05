import { motion } from 'framer-motion';
import { useImageGallery } from '../contexts/ImageGalleryContext';
import { useAuth } from '../contexts/AuthContext';
import { 
  Image, 
  Clock,
  Zap,
  ArrowRight,
  Star,
  Download,
  Eye,
  Edit3
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { images, favoriteCount } = useImageGallery();
  const { user } = useAuth();

  const totalImages = images.length;
  const recentImages = images.slice(0, 4);

  const stats = [
    {
      title: 'Total Images',
      value: totalImages,
      icon: Image,
      color: 'from-blue-500 to-cyan-500',
      change: '+12%'
    },
    {
      title: 'This Month',
      value: 24,
      icon: Clock,
      color: 'from-purple-500 to-pink-500',
      change: '+8%'
    },
    {
      title: 'AI Credits',
      value: 1250,
      icon: Zap,
      color: 'from-orange-500 to-red-500',
      change: '-5%'
    },
    {
      title: 'Favorites',
      value: favoriteCount,
      icon: Star,
      color: 'from-green-500 to-emerald-500',
      change: favoriteCount > 0 ? `+${favoriteCount}` : '+0%'
    }
  ];

  const downloadImage = (imageUrl: string, prompt: string) => {
    try {
      // For blob URLs, we need to handle them differently
      if (imageUrl.startsWith('blob:')) {
        // Create a canvas to convert blob to downloadable format
        const img = document.createElement('img');
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
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(imageUrl, '_blank', 'noopener,noreferrer');
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

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-primary-600 to-accent-600 rounded-2xl p-8 text-white overflow-hidden relative"
      >
        <div className="relative z-10">
          <h1 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h1>
          <p className="text-primary-100 mb-6">Ready to create something amazing today?</p>
          <Link
            to="/generate"
            className="inline-flex items-center space-x-2 bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-primary-50 transition-colors"
          >
            <span>Start Creating</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/5 rounded-full translate-y-16 translate-x-16"></div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-dark-700"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg bg-gradient-to-r ${stat.color}`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
              <span className={`text-sm font-medium ${
                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
              }`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {stat.value.toLocaleString()}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{stat.title}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Images and Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Images */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-dark-700"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Images</h2>
            <Link 
              to="/gallery"
              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            {recentImages.map((image) => (
              <div key={image.id} className="group relative">
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                  <button 
                    onClick={() => viewImageFullscreen(image.url, image.prompt)}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <Eye className="w-4 h-4 text-white" />
                  </button>
                  <button 
                    onClick={() => downloadImage(image.url, image.prompt)}
                    className="p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <Download className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-dark-700"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          
          <div className="space-y-4">
            <Link
              to="/generate"
              className="flex items-center space-x-4 p-4 rounded-lg bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 hover:from-primary-100 hover:to-accent-100 dark:hover:from-primary-900/40 dark:hover:to-accent-900/40 transition-colors group"
            >
              <div className="p-2 bg-primary-500 rounded-lg">
                <Image className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">Generate Image</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Create new AI-generated images</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-500 transition-colors" />
            </Link>

            <Link
              to="/edit"
              className="flex items-center space-x-4 p-4 rounded-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 hover:from-green-100 hover:to-blue-100 dark:hover:from-green-900/40 dark:hover:to-blue-900/40 transition-colors group"
            >
              <div className="p-2 bg-green-500 rounded-lg">
                <Edit3 className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">Edit Image</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">Edit and enhance your images</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-500 transition-colors" />
            </Link>

            <Link
              to="/gallery"
              className="flex items-center space-x-4 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 hover:from-purple-100 hover:to-pink-100 dark:hover:from-purple-900/40 dark:hover:to-pink-900/40 transition-colors group"
            >
              <div className="p-2 bg-purple-500 rounded-lg">
                <Star className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900 dark:text-white">Browse Gallery</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">View all your creations</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-purple-500 transition-colors" />
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;