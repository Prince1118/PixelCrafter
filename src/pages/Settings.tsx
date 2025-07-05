import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { aiService } from '../services/aiService';
import { 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Download, 
  Trash2,
  Key,
  CreditCard,
  Settings as SettingsIcon,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  Monitor,
  Copy,
  Eye,
  EyeOff,
  Plus,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

const Settings: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    generation: true
  });
  const [sounds, setSounds] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
    { id: 'api', name: 'API Settings', icon: Key },
    { id: 'billing', name: 'Usage', icon: CreditCard },
  ];

  const handleSaveProfile = () => {
    toast.success('Profile updated successfully!');
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    
    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    setTimeout(() => {
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 1000);
  };

  const handleExportData = () => {
    const exportData = {
      user: user,
      settings: { theme, notifications, sounds },
      exportDate: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `pixelcrafter-data-export-${Date.now()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const handleDeleteAccount = () => {
    const confirmation = window.prompt('Type "DELETE" to confirm account deletion:');
    if (confirmation === 'DELETE') {
      toast.error('Account deletion is not available in demo mode.');
    } else if (confirmation !== null) {
      toast.error('Confirmation text does not match');
    }
  };

  return (
    <div className="flex space-x-8">
      {/* Sidebar */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-64 bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 dark:border-dark-700 h-fit"
      >
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Settings</h2>
        <nav className="space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors text-left ${
                activeTab === tab.id
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400'
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.name}</span>
            </button>
          ))}
        </nav>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 bg-white/80 dark:bg-dark-800/80 backdrop-blur-sm rounded-xl p-8 border border-gray-200 dark:border-dark-700"
      >
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Profile Settings</h3>
              <p className="text-gray-600 dark:text-gray-400">Manage your account information and preferences.</p>
            </div>

            <div className="flex items-center space-x-6">
              <img
                src={user?.avatar || 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&dpr=2'}
                alt="Profile"
                className="w-20 h-20 rounded-full object-cover"
              />
              <div>
                <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium">
                  Change Avatar
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  JPG, PNG up to 5MB
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={user?.name}
                  className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Bio
              </label>
              <textarea
                rows={3}
                placeholder="Tell us about yourself..."
                className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white resize-none"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSaveProfile}
                className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Appearance</h3>
              <p className="text-gray-600 dark:text-gray-400">Customize how PixelCrafter looks and feels.</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    onClick={() => theme === 'dark' && toggleTheme()}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      theme === 'light' 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
                    }`}
                  >
                    <Sun className="w-6 h-6 mx-auto mb-2 text-yellow-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Light</span>
                  </button>
                  
                  <button
                    onClick={() => theme === 'light' && toggleTheme()}
                    className={`p-4 rounded-lg border-2 transition-colors ${
                      theme === 'dark' 
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20' 
                        : 'border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500'
                    }`}
                  >
                    <Moon className="w-6 h-6 mx-auto mb-2 text-blue-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">Dark</span>
                  </button>
                  
                  <button className="p-4 rounded-lg border-2 border-gray-200 dark:border-dark-600 hover:border-gray-300 dark:hover:border-dark-500 transition-colors">
                    <Monitor className="w-6 h-6 mx-auto mb-2 text-gray-500" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">System</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">Sound Effects</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Play sounds for interactions and notifications</p>
                </div>
                <button
                  onClick={() => setSounds(!sounds)}
                  className={`flex items-center p-2 rounded-lg transition-colors ${
                    sounds 
                      ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400' 
                      : 'bg-gray-100 dark:bg-dark-700 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {sounds ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Notifications</h3>
              <p className="text-gray-600 dark:text-gray-400">Choose what notifications you want to receive.</p>
            </div>

            <div className="space-y-4">
              {Object.entries(notifications).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-700/50 rounded-lg">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                      {key} Notifications
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {key === 'email' && 'Receive notifications via email'}
                      {key === 'push' && 'Browser push notifications'}
                      {key === 'generation' && 'When image generation is complete'}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setNotifications(prev => ({ ...prev, [key]: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Privacy & Security</h3>
              <p className="text-gray-600 dark:text-gray-400">Manage your privacy settings and account security.</p>
            </div>

            <div className="p-6 border border-gray-200 dark:border-dark-600 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <Key className="w-5 h-5 text-gray-500" />
                <h4 className="text-lg font-medium text-gray-900 dark:text-white">Change Password</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full p-3 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleChangePassword}
                  className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium"
                >
                  Update Password
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 border border-gray-200 dark:border-dark-600 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Download className="w-5 h-5 text-gray-500" />
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">Export Data</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Download all your data and images</p>
                    </div>
                  </div>
                  <button
                    onClick={handleExportData}
                    className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors text-sm font-medium"
                  >
                    Export
                  </button>
                </div>
              </div>

              <div className="p-4 border border-red-200 dark:border-red-800 rounded-lg bg-red-50 dark:bg-red-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Trash2 className="w-5 h-5 text-red-500" />
                    <div>
                      <h4 className="text-sm font-medium text-red-900 dark:text-red-400">Delete Account</h4>
                      <p className="text-sm text-red-700 dark:text-red-300">Permanently delete your account and all data</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">API Settings</h3>
              <p className="text-gray-600 dark:text-gray-400">Configure your Hugging Face API key for AI image generation.</p>
            </div>

            <div className="p-6 border border-gray-200 dark:border-dark-600 rounded-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <Key className="w-5 h-5 text-gray-500" />
                  <h4 className="text-lg font-medium text-gray-900 dark:text-white">Hugging Face API Key</h4>
                </div>
                <a
                  href="https://huggingface.co/settings/tokens"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-1 text-primary-600 hover:text-primary-700 text-sm"
                >
                  <span>Get API Key</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Add your Hugging Face API token to enable real AI image generation with Stable Diffusion models.
              </p>
              
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type="password"
                    placeholder="hf_..."
                    className="w-full p-3 pr-20 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-white font-mono text-sm"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                    <button
                      onClick={() => {}}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                    >
                      <Eye className="w-4 h-4 text-gray-500" />
                    </button>
                    <button
                      onClick={() => {}}
                      className="p-1 rounded hover:bg-gray-200 dark:hover:bg-dark-600 transition-colors"
                    >
                      <Copy className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => {}}
                    disabled={true}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Save API Key
                  </button>
                  
                  {false && (
                    <button
                      onClick={() => {}}
                      className="px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors text-sm font-medium"
                    >
                      Remove Key
                    </button>
                  )}
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> Your API key is stored locally in your browser and never sent to our servers. 
                  It's used directly to communicate with Hugging Face\'s Inference API for image generation.
                </p>
              </div>
            </div>

            <div className="p-4 border border-gray-200 dark:border-dark-600 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Supported Models</h4>
              <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center justify-between">
                  <span>• Stable Diffusion XL</span>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">Available</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>• Stable Diffusion 2.1</span>
                  <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-1 rounded">Available</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'billing' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Usage & Billing</h3>
              <p className="text-gray-600 dark:text-gray-400">Monitor your API usage and costs.</p>
            </div>

            <div className="bg-gradient-to-r from-primary-50 to-accent-50 dark:from-primary-900/20 dark:to-accent-900/20 p-6 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Current Usage</h4>
                  <p className="text-gray-600 dark:text-gray-400">This month's API costs</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">Free</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Hugging Face Tier</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-dark-600 rounded-lg">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Images Generated This Month</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">45 images</span>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-dark-600 rounded-lg">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Average Generation Time</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">15 seconds</span>
              </div>
              
              <div className="flex items-center justify-between p-4 border border-gray-200 dark:border-dark-600 rounded-lg">
                <span className="text-sm font-medium text-gray-900 dark:text-white">Most Used Model</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">Stable Diffusion XL</span>
              </div>
            </div>

            <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
              <p className="text-sm text-green-800 dark:text-green-200">
                <strong>Free Tier:</strong> You're using Hugging Face's free Inference API. 
                No additional costs - just potential wait times when models are loading.
              </p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Settings;