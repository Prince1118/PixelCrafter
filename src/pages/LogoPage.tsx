import React from 'react';
import { motion } from 'framer-motion';
import LogoDownload from '../components/LogoDownload';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const LogoPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center space-x-4"
      >
        <Link 
          to="/"
          className="p-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Logo Downloads</h1>
          <p className="text-gray-600 dark:text-gray-400">Download PixelCrafter logos in various formats</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <LogoDownload />
      </motion.div>
    </div>
  );
};

export default LogoPage;