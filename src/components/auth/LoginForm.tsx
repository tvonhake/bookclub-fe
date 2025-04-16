import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useAuth } from '../../context/AuthContext';
import { useEmailValidation } from '../../hooks/useEmailValidation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const SIGN_IN_MUTATION = gql`
  mutation SignIn($email: String!, $password: String!) {
    signIn(input: { email: $email, password: $password }) {
      token
      user {
        id
        email
      }
      errors
    }
  }
`;

const LoginForm: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<string[]>([]);
    const [emailError, setEmailError] = useState<string | null>(null);
    const [login] = useMutation(SIGN_IN_MUTATION);
    const navigate = useNavigate();
    const { login: authLogin } = useAuth();
    const { validateEmail } = useEmailValidation();

    const handleEmailBlur = () => {
        const error = validateEmail(email);
        setEmailError(error);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors([]);

        const emailValidationError = validateEmail(email);
        if (emailValidationError) {
            setEmailError(emailValidationError);
            return;
        }

        try {
            const { data } = await login({
                variables: { email, password },
            });
            if (data.signIn.errors) {
                setErrors(data.signIn.errors);
                return;
            }
            authLogin(data.signIn.token);
            navigate('/dashboard');
        } catch (error) {
            console.error('Login failed:', error);
            setErrors(['An unexpected error occurred. Please try again.']);
        }
    };

    return (
        <div className="min-h-[calc(100vh-4rem)] w-full flex items-center justify-center">
            <div className="w-full max-w-md p-8 bg-[#242424] rounded-lg shadow-md flex flex-col gap-6">
                <h2 className="text-3xl font-bold text-center text-white">Login</h2>
                {errors.length > 0 && (
                    <div className="bg-red-900/50 border border-red-700 text-red-200 px-4 py-3 rounded relative" role="alert">
                        <ul className="list-disc list-inside">
                            {errors.map((error, index) => (
                                <li key={index}>{error}</li>
                            ))}
                        </ul>
                    </div>
                )}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
                            className={`bg-[#1a1a1a] text-white placeholder:text-gray-400 ${emailError ? 'border-red-700' : 'border-gray-600'
                                }`}
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
                            className="bg-[#1a1a1a] border-gray-600 text-white placeholder:text-gray-400"
                        />
                    </div>
                    <Button
                        type="submit"
                        className="w-full bg-[#1a1a1a] text-white hover:bg-[#1a1a1a] hover:border-[#646cff] border border-transparent"
                    >
                        Sign in
                    </Button>
                </form>
                <p className="text-center text-white">
                    Don't have an account?{' '}
                    <Link to="/signup" className="text-[#646cff] hover:text-[#535bf2]">
                        Sign up
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginForm; 