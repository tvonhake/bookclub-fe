interface EnvValidationResult {
    isValid: boolean;
    errors: string[];
}

const validateKeyLength = (key: string, minLength: number): boolean => {
    return key.length >= minLength;
};

export const validateEnv = (): EnvValidationResult => {
    const errors: string[] = [];
    const env = import.meta.env;

    // Check required variables
    if (!env.VITE_API_URL) errors.push('VITE_API_URL is required');
    if (!env.VITE_REQUEST_SIGNING_KEY) errors.push('VITE_REQUEST_SIGNING_KEY is required');
    if (!env.VITE_TOKEN_ENCRYPTION_KEY) errors.push('VITE_TOKEN_ENCRYPTION_KEY is required');

    // Validate API URL format
    if (env.VITE_API_URL && !/^https?:\/\/.+/i.test(env.VITE_API_URL)) {
        errors.push('VITE_API_URL must be a valid HTTP(S) URL');
    }

    // Validate key lengths
    if (env.VITE_REQUEST_SIGNING_KEY && !validateKeyLength(env.VITE_REQUEST_SIGNING_KEY, 32)) {
        errors.push('VITE_REQUEST_SIGNING_KEY must be at least 32 characters');
    }

    if (env.VITE_TOKEN_ENCRYPTION_KEY && !validateKeyLength(env.VITE_TOKEN_ENCRYPTION_KEY, 32)) {
        errors.push('VITE_TOKEN_ENCRYPTION_KEY must be at least 32 characters');
    }

    return {
        isValid: errors.length === 0,
        errors
    };
}; 