import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface AuthRouteProps {
    children: React.ReactNode;
    type: 'protected' | 'auth';
}

const AuthRoute: React.FC<AuthRouteProps> = ({ children, type }) => {
    const { isAuthenticated } = useAuth();

    // If it's a protected route and user is not authenticated, redirect to login
    if (type === 'protected' && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // If it's an auth route and user is authenticated, redirect to dashboard
    if (type === 'auth' && isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    // Allow access to auth routes when not authenticated
    // Allow access to protected routes when authenticated
    return <>{children}</>;
};

export default AuthRoute; 