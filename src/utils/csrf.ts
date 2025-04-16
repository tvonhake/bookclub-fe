import CryptoJS from 'crypto-js';

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'X-CSRF-Token';
const IS_DEVELOPMENT = import.meta.env.DEV;

const setCookie = (name: string, value: string, maxAge: number): void => {
    const secure = !IS_DEVELOPMENT;
    const sameSite = secure ? 'Strict' : 'Lax';
    document.cookie = `${name}=${value};max-age=${maxAge};path=/;SameSite=${sameSite}${secure ? ';Secure' : ''}`;
};

const getCookie = (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
};

export const csrf = {
    getToken: (): string | null => getCookie(CSRF_COOKIE),
    getHeader: (): { [key: string]: string } => {
        const token = getCookie(CSRF_COOKIE);
        return token ? { [CSRF_HEADER]: token } : {};
    },
    clearToken: (): void => setCookie(CSRF_COOKIE, '', 0),
    setToken: (token: string, expirationInHours: number = 24): void => {
        setCookie(CSRF_COOKIE, token, expirationInHours * 60 * 60);
    }
}; 