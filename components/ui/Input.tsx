import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    containerClassName?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, containerClassName, label, ...props }, ref) => {
    return (
        <div className={`flex flex-col gap-1 w-full ${containerClassName || ''}`}>
            {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-400">{label}</label>}
            <input
                className={`bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-white/5 dark:border-white/10 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 transition-all duration-300 hover:bg-gray-100 dark:hover:bg-white/10 outline-none ${className}`}
                ref={ref}
                {...props}
            />
        </div>
    );
});

Input.displayName = "Input";

export default Input;
