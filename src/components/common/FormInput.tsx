import React, { useState } from 'react';

interface FormInputProps {
    id: string;
    name: string;
    type: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    placeholder: string;
    required?: boolean;
    error?: string;
    className?: string;
    validate?: (value: string) => string | null;
}

const FormInput: React.FC<FormInputProps> = ({
    id,
    name,
    type,
    value,
    onChange,
    onBlur,
    placeholder,
    required = false,
    error,
    className = '',
    validate
}) => {
    const [localError, setLocalError] = useState<string | null>(null);

    const handleBlur = () => {
        if (validate) {
            const validationError = validate(value);
            setLocalError(validationError);
        }
        onBlur?.();
    };

    const handleChange = (newValue: string) => {
        onChange(newValue);
        if (localError && validate) {
            const validationError = validate(newValue);
            setLocalError(validationError);
        }
    };

    return (
        <div className={className}>
            <label htmlFor={id} className="sr-only">{placeholder}</label>
            <input
                id={id}
                name={name}
                type={type}
                required={required}
                className={`appearance-none rounded-md relative block w-full px-3 py-2 border bg-[#1a1a1a] ${(error || localError) ? 'border-red-700' : 'border-gray-600'
                    } placeholder-gray-400 text-white focus:outline-none focus:ring-[#646cff] focus:border-[#646cff] focus:z-10 sm:text-sm`}
                placeholder={placeholder}
                value={value}
                onChange={(e) => handleChange(e.target.value)}
                onBlur={handleBlur}
            />
            {(error || localError) && <p className="mt-1 text-sm text-red-200">{error || localError}</p>}
        </div>
    );
};

export default FormInput; 