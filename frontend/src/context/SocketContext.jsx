import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuth from '../hooks/useAuth';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [socketError, setSocketError] = useState(null);
  
  // Track listeners to re-register on reconnection
  const listenersRef = useRef({});

  useEffect(() => {
    let newSocket;

    if (user) {
      const token = localStorage.getItem('parknexus-token');
      const isDevelopment = import.meta.env.MODE === 'development';
      const socketUrl = isDevelopment
        ? 'http://localhost:5001'
        : (import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL?.replace('/api', '') || 'https://parknexus-aq19.onrender.com');

      newSocket = io(socketUrl, {
        auth: { token },
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
      });

      newSocket.on('connect', () => {
        setIsConnected(true);
        setSocketError(null);
        
        // Re-attach existing listeners
        Object.entries(listenersRef.current).forEach(([event, callbacks]) => {
          callbacks.forEach(cb => {
            newSocket.on(event, cb);
          });
        });
      });

      newSocket.on('disconnect', () => {
        setIsConnected(false);
      });

      newSocket.on('connect_error', (err) => {
        setIsConnected(false);
        setSocketError(err.message);
      });

      setSocket(newSocket);
    }

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user]);

  // Expose register/unregister functions that persist across reconnects
  const registerListener = (event, callback) => {
    if (!listenersRef.current[event]) {
      listenersRef.current[event] = [];
    }
    listenersRef.current[event].push(callback);
    
    if (socket && isConnected) {
      socket.on(event, callback);
    }
  };
  
  const unregisterListener = (event, callback) => {
    if (listenersRef.current[event]) {
      listenersRef.current[event] = listenersRef.current[event].filter(cb => cb !== callback);
    }
    if (socket) {
      socket.off(event, callback);
    }
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, socketError, registerListener, unregisterListener }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  return useContext(SocketContext);
};
