import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header: React.FC = () => {
    const { isAuthenticated, signOut } = useAuth();

    return (
        <div className="fixed top-0 left-0 right-0 bg-[#242424] shadow-md p-4 flex items-center">
            <Link to="/" className="mr-auto text-white hover:text-[#646cff]">BookClub</Link>
            {isAuthenticated && (
                <button
                    onClick={signOut}
                    className="bg-[#1a1a1a] text-white hover:border-[#646cff]"
                >
                    Sign Out
                </button>
            )}
        </div>
    );
};

export default Header; 