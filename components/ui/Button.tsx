import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline';
    isLoading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant = 'primary', isLoading, children, ...props }, ref) => {
    const baseStyles = "relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-sm font-medium rounded-lg group focus:ring-4 focus:outline-none focus:ring-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed";

    let variantStyles = "";
    let content = children;

    if (variant === 'primary') {
        variantStyles = "bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 text-white w-full";
        content = <span className="relative px-5 py-2.5 transition-all ease-in duration-75 bg-gray-900 rounded-md group-hover:bg-opacity-0 w-full flex justify-center items-center gap-2">{isLoading ? "Loading..." : children}</span>;
    } else if (variant === 'secondary') {
        // similar to primary but different colors
        variantStyles = "bg-white text-black hover:bg-gray-200 w-full py-2.5 px-5";
    }

    return (
        <button
            className={`${baseStyles} ${variantStyles} ${className}`}
            ref={ref}
            disabled={isLoading || props.disabled}
            {...props}
        >
            {variant === 'primary' ? content : (isLoading ? "..." : children)}
        </button>
    );
});

Button.displayName = "Button";

export default Button;
