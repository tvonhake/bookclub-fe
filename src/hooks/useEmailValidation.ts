import { useState } from 'react';

export const useEmailValidation = () => {
    const [emailError, setEmailError] = useState<string | null>(null);

    const validateEmail = (email: string): string | null => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return null;
        if (!re.test(email)) {
            return 'Please enter a valid email address';
        }
        return null;
    };

    const handleEmailBlur = (email: string) => {
        setEmailError(validateEmail(email));
    };

    return {
        emailError,
        validateEmail,
        handleEmailBlur,
    };
}; 