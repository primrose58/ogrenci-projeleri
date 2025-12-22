"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";

interface SearchableSelectProps {
    options: string[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    label?: string;
    required?: boolean;
}

export default function SearchableSelect({
    options,
    value,
    onChange,
    placeholder = "Select...",
    label,
    required = false
}: SearchableSelectProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [search, setSearch] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Filter options based on search
    const filteredOptions = options.filter(option =>
        option.toLocaleLowerCase('tr').includes(search.toLocaleLowerCase('tr'))
    );

    // Close dropdown when clicking outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex flex-col gap-1 w-full relative" ref={wrapperRef}>
            {label && (
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}

            <div
                className={`
                    w-full px-4 py-3 rounded-lg border flex items-center justify-between cursor-pointer
                    transition-all duration-200
                    ${isOpen
                        ? 'bg-gray-100 border-purple-500 text-gray-900 dark:bg-white/10 dark:border-purple-500/50 dark:text-white'
                        : 'bg-gray-50 border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-100 dark:bg-white/5 dark:border-white/10 dark:text-gray-300 dark:hover:border-white/20 dark:hover:bg-white/10'
                    }
                `}
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className={value ? "text-gray-900 dark:text-white" : "text-gray-500"}>
                    {value || placeholder}
                </span>
                <ChevronDown size={18} className={`text-gray-500 dark:text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-lg shadow-xl z-50 overflow-hidden flex flex-col max-h-60 animate-in fade-in zoom-in-95 duration-100">
                    {/* Search Input */}
                    <div className="p-2 border-b border-gray-200 dark:border-white/10 sticky top-0 bg-white dark:bg-[#1a1a1a]">
                        <div className="relative">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                            <input
                                type="text"
                                className="w-full bg-gray-50 dark:bg-white/5 border border-gray-300 dark:border-white/10 rounded-md py-1.5 pl-9 pr-3 text-sm text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-600 focus:outline-none focus:border-purple-500"
                                placeholder="Ara..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                autoFocus
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>

                    {/* Options List */}
                    <div className="overflow-y-auto flex-1 p-1">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => (
                                <div
                                    key={option}
                                    className={`
                                        px-3 py-2 text-sm rounded-md cursor-pointer flex items-center justify-between
                                        ${value === option
                                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-300'
                                            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-white'}
                                    `}
                                    onClick={() => {
                                        onChange(option);
                                        setIsOpen(false);
                                        setSearch("");
                                    }}
                                >
                                    {option}
                                    {value === option && <Check size={14} />}
                                </div>
                            ))
                        ) : (
                            <div className="p-4 text-center text-sm text-gray-500">
                                Sonuç bulunamadı.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
