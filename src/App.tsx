import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { ImageGalleryProvider } from './contexts/ImageGalleryContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import Edit from './pages/Edit';
import Gallery from './pages/Gallery';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ImageGalleryProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-dark-900 dark:via-dark-800 dark:to-purple-900 transition-colors duration-300">
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/generate" element={<Generate />} />
                  <Route path="/edit" element={<Edit />} />
                  <Route path="/gallery" element={<Gallery />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </Layout>
              <Toaster 
                position="top-right"
                toastOptions={{
                  duration: 3000,
                  className: 'dark:bg-dark-800 dark:text-white',
                }}
              />
            </div>
          </Router>
        </ImageGalleryProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;