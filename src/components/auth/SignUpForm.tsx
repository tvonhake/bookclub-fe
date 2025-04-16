import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';
import { useEmailValidation } from '../../hooks/useEmailValidation';
import { validatePassword } from '../../utils/passwordValidation';
import { rateLimiter } from '../../utils/rateLimiter';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SIGN_UP_MUTATION = gql`
  mutation SignUp($email: String!, $password: String!, $passwordConfirmation: String!, $name: String!) {
    signUp(input: {
      email: $email,
      password: $password,
      passwordConfirmation: $passwordConfirmation,
      name: $name
    }) {
      token
      user {
        id
        email
        name
      }
      errors
    }
  }
`;

const SignUpForm: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [isRateLimited, setIsRateLimited] = useState(false);
    const [remainingAttempts, setRemainingAttempts] = useState(5);
    const [timeUntilReset, setTimeUntilReset] = useState(0);
    const [signUp] = useMutation(SIGN_UP_MUTATION);
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();
    const { validateEmail } = useEmailValidation();

    useEffect(() => {
        const checkRateLimit = () => {
            const allowed = rateLimiter.isAllowed(email);
            setIsRateLimited(!allowed);
            setRemainingAttempts(rateLimiter.getRemainingAttempts(email));
            setTimeUntilReset(rateLimiter.getTimeUntilReset(email));
        };

        if (email) {
            checkRateLimit();
        }
    }, [email]);

    const handleEmailBlur = () => {
        const error = validateEmail(email);
        setEmailError(error);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);

        if (isRateLimited) {
            setErrors([`Too many attempts. Please try again in ${Math.ceil(timeUntilReset / 60000)} minutes.`]);
            return;
        }

        const emailValidationError = validateEmail(email);
        if (emailValidationError) {
            setEmailError(emailValidationError);
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            setErrors(passwordValidation.errors);
            return;
        }

        if (password !== passwordConfirmation) {
            setErrors(['Passwords do not match']);
            return;
        }

        try {
            const { data } = await signUp({
                variables: { name, email, password, passwordConfirmation },
            });

            if (data.signUp.errors) {
                setErrors(data.signUp.errors);
                return;
            }

            rateLimiter.reset(email);
            authLogin(data.signUp.token);
            navigate('/dashboard');
        } catch (error) {
            console.error('Sign up failed:', error);
            setErrors(['An unexpected error occurred. Please try again.']);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-[#242424] rounded-lg shadow-md flex flex-col gap-6">
                <h2 className="text-3xl font-bold text-center text-white">Sign Up</h2>
                {errors.length > 0 && (
                    <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded relative" role="alert">
                        <ul className="list-disc list-inside">
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
                {isRateLimited && (
                    <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 px-4 py-3 rounded relative" role="alert">
                        <p>Too many attempts. Please try again in {Math.ceil(timeUntilReset / 60000)} minutes.</p>
                        <p>Remaining attempts: {remainingAttempts}</p>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name" className="text-white">
                            Name
                        </Label>
                        <Input
                            id="name"
                            type="text"
                            placeholder="Your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                            className="bg-[#1a1a1a] text-white placeholder:text-gray-400 border-gray-600"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email" className="text-white">
                            Email
                        </Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (emailError) {
                                    setEmailError(null);
                                }
                            }}
                            onBlur={handleEmailBlur}
                            required
                            className={`bg-[#1a1a1a] text-white placeholder:text-gray-400 ${emailError ? 'border-red-700' : 'border-gray-600'}`}
                        />
                        {emailError && (
                            <p className="text-sm text-red-200">{emailError}</p>
                        )}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="password" className="text-white">
                            Password
                        </Label>
                        <Input
                            id="password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-[#1a1a1a] text-white placeholder:text-gray-400 border-gray-600"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="passwordConfirmation" className="text-white">
                            Confirm Password
                        </Label>
                        <Input
                            id="passwordConfirmation"
                            type="password"
                            placeholder="Confirm password"
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                            className="bg-[#1a1a1a] text-white placeholder:text-gray-400 border-gray-600"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-[#1a1a1a] text-white hover:bg-[#2a2a2a]"
                        disabled={isRateLimited}
                    >
                        Sign Up
                    </Button>
                    <div className="text-center text-gray-400">
                        Already have an account?{' '}
                        <Link to="/login" className="text-blue-400 hover:text-blue-300">
                            Sign in
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUpForm; 