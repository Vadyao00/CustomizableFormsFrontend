import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as signalR from '../api/signalR';

interface LikesContextType {
  likesCount: Record<string, number>;
  updateLikesCount: (templateId: string, count: number) => void;
}

const defaultContext: LikesContextType = {
  likesCount: {},
  updateLikesCount: () => {}
};

const LikesContext = createContext<LikesContextType>(defaultContext);

export const useLikes = () => useContext(LikesContext);

interface LikesProviderProps {
  children: ReactNode;
}

export const LikesProvider: React.FC<LikesProviderProps> = ({ children }) => {
  const [likesCount, setLikesCount] = useState<Record<string, number>>({});
  const [initializedTemplates, setInitializedTemplates] = useState<Set<string>>(new Set());
  
  useEffect(() => {
    const setupSignalR = async () => {
      try {
        await signalR.startConnection();
        
        signalR.onUpdateLikes((count: number, templateId: string) => {
          if (templateId) {
            setLikesCount(prev => ({
              ...prev,
              [templateId]: count
            }));
          }
        });
      } catch (error) {
        console.error('Error setting up SignalR in LikesContext:', error);
      }
    };
    
    setupSignalR();
    
    return () => {
      signalR.removeAllListeners();
    };
  }, []);
  
  const updateLikesCount = (templateId: string, count: number) => {
    setLikesCount(prev => ({
      ...prev,
      [templateId]: count
    }));
    
    if (!initializedTemplates.has(templateId)) {
      const newInitializedTemplates = new Set(initializedTemplates);
      newInitializedTemplates.add(templateId);
      setInitializedTemplates(newInitializedTemplates);
      
      signalR.joinTemplateGroup(templateId).catch(err => {
        console.error(`Error joining template group ${templateId}:`, err);
      });
    }
  };
  
  const contextValue: LikesContextType = {
    likesCount,
    updateLikesCount
  };
  
  return (
    <LikesContext.Provider value={contextValue}>
      {children}
    </LikesContext.Provider>
  );
};

export default LikesContext;