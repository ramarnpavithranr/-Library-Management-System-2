'use client';

import React, { createContext, useContext, useState } from 'react';

interface DeviceModeContextType {
  isMobileFrame: boolean;
  setIsMobileFrame: (val: boolean) => void;
  toggleMobileFrame: () => void;
}

const DeviceModeContext = createContext<DeviceModeContextType>({
  isMobileFrame: false,
  setIsMobileFrame: () => {},
  toggleMobileFrame: () => {},
});

export const DeviceModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isMobileFrame, setIsMobileFrame] = useState<boolean>(false);
  const toggleMobileFrame = () => setIsMobileFrame(prev => !prev);

  return (
    <DeviceModeContext.Provider value={{ isMobileFrame, setIsMobileFrame, toggleMobileFrame }}>
      <div className="min-h-screen bg-[#F8F5F5] flex flex-col w-full">
        {children}
      </div>
    </DeviceModeContext.Provider>
  );
};

export const useDeviceMode = () => useContext(DeviceModeContext);
