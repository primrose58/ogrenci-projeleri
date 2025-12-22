"use client"

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="w-16 h-8 rounded-full bg-gray-200 dark:bg-white/10 opacity-50" />
        );
    }

    const toggleTheme = () => {
        setTheme(theme === "dark" ? "light" : "dark");
    };

    return (
        <button
            onClick={toggleTheme}
            className="relative flex items-center w-16 h-8 rounded-full bg-gray-200 dark:bg-white/10 p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
            aria-label="Toggle Theme"
        >
            {/* Sliding Pill */}
            <motion.div
                className="absolute left-1 w-6 h-6 rounded-full shadow-sm flex items-center justify-center"
                animate={{
                    x: theme === 'dark' ? 32 : 0,
                    backgroundColor: theme === 'dark' ? '#000000' : '#ffffff',
                    color: theme === 'dark' ? '#ffffff' : '#eab308'
                }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
                {theme === 'dark' ? (
                    <Moon size={14} />
                ) : (
                    <Sun size={14} />
                )}
            </motion.div>

            {/* Background Icons (Visual cues) */}
            <div className="w-full flex justify-between px-2">
                <div className={`transition-opacity duration-300 ${theme === 'light' ? 'opacity-0' : 'opacity-50'}`}>
                    <Sun size={14} className="text-yellow-600 dark:text-yellow-400" />
                </div>
                <div className={`transition-opacity duration-300 ${theme === 'dark' ? 'opacity-0' : 'opacity-50'}`}>
                    <Moon size={14} className="text-gray-600 dark:text-blue-300" />
                </div>
            </div>
        </button>
    );
}
