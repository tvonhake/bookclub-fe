import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = import.meta.env.VITE_TOKEN_ENCRYPTION_KEY;
const IS_DEVELOPMENT = import.meta.env.DEV;

const TOKEN_COOKIE = 'auth_token';

class TokenStorage {
    private static instance: TokenStorage;

    private constructor() { }

    static getInstance(): TokenStorage {
        if (!TokenStorage.instance) {
            TokenStorage.instance = new TokenStorage();
        }
        return TokenStorage.instance;
    }

    private setCookie(value: string, maxAge: number): void {
        const secure = !IS_DEVELOPMENT;
        const sameSite = secure ? 'Strict' : 'Lax';
        document.cookie = `${TOKEN_COOKIE}=${value};max-age=${maxAge};path=/;SameSite=${sameSite}${secure ? ';Secure' : ''}`;
    }

    private getCookie(): string | null {
        const nameEQ = TOKEN_COOKIE + "=";
        const ca = document.cookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
        }
        return null;
    }

    setToken(token: string, expirationInHours: number = 24): void {
        try {
            const maxAge = expirationInHours * 60 * 60;
            const value = IS_DEVELOPMENT ? token : CryptoJS.AES.encrypt(token, ENCRYPTION_KEY).toString();
            this.setCookie(value, maxAge);
        } catch (error) {
            console.error('Failed to set token:', error);
            throw new Error('Failed to save authentication token');
        }
    }

    getToken(): string | null {
        try {
            const value = this.getCookie();
            if (!value) return null;

            return IS_DEVELOPMENT ? value : CryptoJS.AES.decrypt(value, ENCRYPTION_KEY).toString(CryptoJS.enc.Utf8);
        } catch (error) {
            console.error('Failed to get token:', error);
            this.removeToken();
            return null;
        }
    }

    removeToken(): void {
        this.setCookie('', 0);
    }

    isTokenValid(): boolean {
        return this.getToken() !== null;
    }
}

export const tokenStorage = TokenStorage.getInstance(); 