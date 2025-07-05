import React, { createContext, useContext, useState } from 'react';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  timestamp: Date;
  dimensions: { width: number; height: number };
  isFavorite?: boolean;
}

interface ImageGalleryContextType {
  images: GeneratedImage[];
  favoriteCount: number;
  addImage: (image: GeneratedImage) => void;
  removeImage: (imageId: string) => void;
  toggleFavorite: (imageId: string) => void;
  clearImages: () => void;
}

const ImageGalleryContext = createContext<ImageGalleryContextType | undefined>(undefined);

export const useImageGallery = () => {
  const context = useContext(ImageGalleryContext);
  if (!context) {
    throw new Error('useImageGallery must be used within an ImageGalleryProvider');
  }
  return context;
};

export const ImageGalleryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [images, setImages] = useState<GeneratedImage[]>([
    {
      id: '1',
      url: 'https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg?auto=compress&cs=tinysrgb&w=512&h=512&dpr=2',
      prompt: 'A golden retriever playing in a sunny meadow',
      model: 'Stable Diffusion XL',
      timestamp: new Date(),
      dimensions: { width: 512, height: 512 },
      isFavorite: false
    },
    {
      id: '2',
      url: 'https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=512&h=512&dpr=2',
      prompt: 'A soccer player running across a green field',
      model: 'DALL-E 3',
      timestamp: new Date(),
      dimensions: { width: 512, height: 512 },
      isFavorite: false
    }
  ]);

  const favoriteCount = images.filter(img => img.isFavorite).length;

  const addImage = (image: GeneratedImage) => {
    setImages(prev => [{ ...image, isFavorite: false }, ...prev]);
  };

  const removeImage = (imageId: string) => {
    setImages(prev => prev.filter(img => img.id !== imageId));
  };

  const toggleFavorite = (imageId: string) => {
    setImages(prev => prev.map(img => 
      img.id === imageId 
        ? { ...img, isFavorite: !img.isFavorite }
        : img
    ));
  };

  const clearImages = () => {
    setImages([]);
  };

  return (
    <ImageGalleryContext.Provider value={{ 
      images, 
      favoriteCount,
      addImage, 
      removeImage, 
      toggleFavorite,
      clearImages
    }}>
      {children}
    </ImageGalleryContext.Provider>
  );
};