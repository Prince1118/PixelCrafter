import React from 'react';
import { motion } from 'framer-motion';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Wand2, 
  Edit3, 
  Image, 
  Settings, 
  Sparkles
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const navItems = [
    { to: '/', icon: Home, label: 'Dashboard' },
    { to: '/generate', icon: Wand2, label: 'Generate' },
    { to: '/edit', icon: Edit3, label: 'Edit' },
    { to: '/gallery', icon: Image, label: 'Gallery' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <motion.aside 
      initial={{ x: -250, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      className="w-64 bg-white/90 dark:bg-dark-800/90 backdrop-blur-lg border-r border-gray-200 dark:border-dark-700 p-6 overflow-y-auto"
    >
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">PixelCrafter</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">AI Image Studio</p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;