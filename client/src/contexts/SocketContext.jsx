import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

const ENDPOINT = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const newSocket = io(ENDPOINT);

            newSocket.on('connect', () => {
                console.log('Socket connected, registering user:', user._id);
                newSocket.emit('register_user', user._id);
            });

            // If already connected (shouldn't happen with new instance, but good practice)
            if (newSocket.connected) {
                console.log('Socket already connected, registering user:', user._id);
                newSocket.emit('register_user', user._id);
            }

            setSocket(newSocket);

            return () => newSocket.close();
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user?._id]); // Re-connect if user changes

    return (
        <SocketContext.Provider value={socket}>
            {children}
        </SocketContext.Provider>
    );
};
