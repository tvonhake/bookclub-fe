import React, { createContext, useContext, useState, useEffect } from 'react';
import { tokenStorage } from '../utils/tokenStorage';

interface AuthState {
    isAuthenticated: boolean;
    token: string | null;
}

interface AuthContextType extends AuthState {
    login: (token: string) => void;
    signOut: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [authState, setAuthState] = useState<AuthState>({
        isAuthenticated: false,
        token: null,
    });

    useEffect(() => {
        // Initialize auth state from storage
        const token = tokenStorage.getToken();
        setAuthState({
            isAuthenticated: !!token,
            token,
        });
    }, []);

    const login = (token: string) => {
        tokenStorage.setToken(token);
        setAuthState({
            isAuthenticated: true,
            token,
        });
    };

    const signOut = () => {
        tokenStorage.removeToken();
        setAuthState({
            isAuthenticated: false,
            token: null,
        });
    };

    return (
        <AuthContext.Provider value={{
            ...authState,
            login,
            signOut,
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within an AuthProvider');
    return context;
}; 