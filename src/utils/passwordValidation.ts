interface PasswordValidationResult {
    isValid: boolean;
    errors: string[];
}

const MIN_LENGTH = 8;
const MAX_LENGTH = 128;

const validateLength = (password: string): boolean => {
    return password.length >= MIN_LENGTH && password.length <= MAX_LENGTH;
};

const validateComplexity = (password: string): boolean => {
    return /[A-Z]/.test(password) && // uppercase
        /[a-z]/.test(password) && // lowercase
        /[0-9]/.test(password) && // number
        /[^A-Za-z0-9]/.test(password); // special character
};

export const validatePassword = (password: string): PasswordValidationResult => {
    const errors: string[] = [];

    if (!validateLength(password)) {
        errors.push(`Password must be between ${MIN_LENGTH} and ${MAX_LENGTH} characters`);
    }

    if (!validateComplexity(password)) {
        errors.push('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}; 