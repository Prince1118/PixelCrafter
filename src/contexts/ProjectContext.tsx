import React, { createContext, useContext, useState } from 'react';

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  model: string;
  timestamp: Date;
  dimensions: { width: number; height: number };
}

interface Project {
  id: string;
  name: string;
  images: GeneratedImage[];
  createdAt: Date;
  updatedAt: Date;
}

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  addImageToProject: (projectId: string, image: GeneratedImage) => void;
  setCurrentProject: (project: Project | null) => void;
  setProjects: React.Dispatch<React.SetStateAction<Project[]>>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'My Images',
      images: [
        {
          id: '1',
          url: 'https://images.pexels.com/photos/1562058/pexels-photo-1562058.jpeg?auto=compress&cs=tinysrgb&w=512&h=512&dpr=2',
          prompt: 'A mystical forest with floating islands and magical creatures',
          model: 'Stable Diffusion XL',
          timestamp: new Date(),
          dimensions: { width: 512, height: 512 }
        },
        {
          id: '2',
          url: 'https://images.pexels.com/photos/33545/sunrise-phu-quoc-island-ocean.jpg?auto=compress&cs=tinysrgb&w=512&h=512&dpr=2',
          prompt: 'Epic sunset over floating mountains in the sky',
          model: 'DALL-E 3',
          timestamp: new Date(),
          dimensions: { width: 512, height: 512 }
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]);
  const [currentProject, setCurrentProject] = useState<Project | null>(projects[0]);

  const addImageToProject = (projectId: string, image: GeneratedImage) => {
    setProjects(prev => prev.map(project => 
      project.id === projectId 
        ? { ...project, images: [...project.images, image], updatedAt: new Date() }
        : project
    ));
  };

  return (
    <ProjectContext.Provider value={{ 
      projects, 
      currentProject, 
      addImageToProject, 
      setCurrentProject,
      setProjects
    }}>
      {children}
    </ProjectContext.Provider>
  );
};