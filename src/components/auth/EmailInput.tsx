import React, { useState } from 'react';

interface EmailInputProps {
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    error?: string;
}

const EmailInput: React.FC<EmailInputProps> = ({ value, onChange, onBlur, error }) => {
    return (
        <div>
            <label htmlFor="email" className="sr-only">Email address</label>
            <input
                id="email"
                name="email"
                type="email"
                required
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${error ? 'border-red-300' : 'border-gray-300'} placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm`}
                placeholder="Email address"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
            />
            {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
        </div>
    );
};

export default EmailInput; 