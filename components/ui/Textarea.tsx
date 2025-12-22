import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(({ className, label, ...props }, ref) => {
    return (
        <div className="flex flex-col gap-1 w-full">
            {label && <label className="text-sm font-medium text-gray-400">{label}</label>}
            <textarea
                className={`bg-white/5 border border-white/10 text-white text-sm rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 placeholder-gray-500 transition-all duration-300 hover:bg-white/10 outline-none resize-none min-h-[100px] ${className}`}
                ref={ref}
                {...props}
            />
        </div>
    );
});

Textarea.displayName = "Textarea";

export default Textarea;
