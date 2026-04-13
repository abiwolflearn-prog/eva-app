import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { syncOfflineData } from '../services/syncService';

interface NetworkContextData {
  isOffline: boolean;
  isConnected: boolean | null;
}

const NetworkContext = createContext<NetworkContextData>({ isOffline: false, isConnected: true });

export const NetworkProvider = ({ children }: { children: ReactNode }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const wasOffline = useRef(false);

  useEffect(() => {
    NetInfo.fetch().then(state => {
      setIsConnected(state.isConnected);
      if (state.isConnected === false) wasOffline.current = true;
    });

    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      
      if (state.isConnected === false) {
        wasOffline.current = true;
      } else if (state.isConnected === true && wasOffline.current) {
        // Reconnected! Synchronize queue.
        wasOffline.current = false;
        syncOfflineData().catch(console.error);
      }
    });

    return () => unsubscribe();
  }, []);

  const isOffline = isConnected === false;

  return (
    <NetworkContext.Provider value={{ isOffline, isConnected }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => useContext(NetworkContext);
