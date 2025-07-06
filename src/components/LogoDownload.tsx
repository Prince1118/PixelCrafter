import React from 'react';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';

const LogoDownload: React.FC = () => {
  const downloadLogo = (filename: string, variant: string) => {
    const link = document.createElement('a');
    link.href = `/${filename}`;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success(`${variant} logo downloaded!`);
  };

  const logoVariants = [
    { filename: 'pixelcrafter-logo.svg', name: 'Standard (Outline)', description: 'Black outline on transparent background' },
    { filename: 'pixelcrafter-logo-white.svg', name: 'White (Outline)', description: 'White outline for dark backgrounds' },
    { filename: 'pixelcrafter-logo-gradient.svg', name: 'Gradient (Outline)', description: 'Blue to purple gradient outline' },
    { filename: 'pixelcrafter-logo-filled.svg', name: 'Gradient (Filled)', description: 'Filled with blue to purple gradient' }
  ];

  return (
    <div className="bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-dark-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">PixelCrafter Logo Downloads</h3>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
        Download the PixelCrafter logo in various formats and styles. All logos are SVG format for crisp scaling.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {logoVariants.map((variant) => (
          <div key={variant.filename} className="p-4 border border-gray-200 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700/50 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 dark:text-white">{variant.name}</h4>
              <button
                onClick={() => downloadLogo(variant.filename, variant.name)}
                className="p-2 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg hover:bg-primary-200 dark:hover:bg-primary-900/50 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{variant.description}</p>
            
            {/* Preview */}
            <div className="mt-3 p-3 bg-gray-100 dark:bg-dark-600 rounded-lg flex items-center justify-center">
              <img 
                src={`/${variant.filename}`} 
                alt={`${variant.name} logo`}
                className="w-8 h-8"
                style={{ filter: variant.filename.includes('white') ? 'invert(1)' : 'none' }}
              />
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          <strong>Usage:</strong> These logos are based on the Lucide React Sparkles icon. 
          You can use them for branding, presentations, or any PixelCrafter-related materials.
        </p>
      </div>
    </div>
  );
};

export default LogoDownload;