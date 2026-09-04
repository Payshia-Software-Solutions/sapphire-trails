
'use client';

import React, { createContext, useContext, useState, ReactNode, useRef, Dispatch, SetStateAction } from 'react';

interface ScrollContextType {
  scrollableElement: HTMLElement | null;
  setScrollableElement: Dispatch<SetStateAction<HTMLElement | null>>;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export function ScrollProvider({ children }: { children: ReactNode }) {
  const [scrollableElement, setScrollableElement] = useState<HTMLElement | null>(null);
  
  const value = { scrollableElement, setScrollableElement };

  return <ScrollContext.Provider value={value}>{children}</ScrollContext.Provider>;
}

export const useScroll = () => {
  const context = useContext(ScrollContext);
  if (context === undefined) {
    throw new Error('useScroll must be used within a ScrollProvider');
  }
  return context;
};
