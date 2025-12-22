import { Github, Linkedin, Globe, Instagram, Mail, Twitter, Facebook, Youtube, Link as LinkIcon } from 'lucide-react';
import React from 'react';

export const getSocialPlatform = (url: string) => {
    if (!url || typeof url !== 'string') {
        return { icon: <Globe size={18} />, label: 'Website', color: 'text-gray-400' };
    }
    const lowerUrl = url.toLowerCase();

    // Check for email (mailto:)
    if (lowerUrl.startsWith('mailto:') || lowerUrl.includes('@')) {
        return { icon: <Mail size={18} />, label: 'Email', color: 'text-red-400' };
    }

    if (lowerUrl.includes('github.com')) {
        return { icon: <Github size={18} />, label: 'GitHub', color: 'text-gray-900 dark:text-white' };
    }

    if (lowerUrl.includes('linkedin.com')) {
        return { icon: <Linkedin size={18} />, label: 'LinkedIn', color: 'text-blue-400' };
    }

    if (lowerUrl.includes('instagram.com')) {
        return { icon: <Instagram size={18} />, label: 'Instagram', color: 'text-pink-400' };
    }

    if (lowerUrl.includes('twitter.com') || lowerUrl.includes('x.com')) {
        return { icon: <Twitter size={18} />, label: 'X (Twitter)', color: 'text-blue-400' };
    }

    if (lowerUrl.includes('facebook.com')) {
        return { icon: <Facebook size={18} />, label: 'Facebook', color: 'text-blue-600' };
    }

    if (lowerUrl.includes('youtube.com')) {
        return { icon: <Youtube size={18} />, label: 'YouTube', color: 'text-red-500' };
    }

    // Default
    return { icon: <Globe size={18} />, label: 'Website', color: 'text-green-400' };
};

export const SocialIcon = ({ url, size = 18, className = "" }: { url: string, size?: number, className?: string }) => {
    const platform = getSocialPlatform(url);
    // Clone element to apply size and class if needed, or just return as is
    const iconNode = React.cloneElement(platform.icon as React.ReactElement<any>, { size, className: `${platform.color} ${className}` });

    return (
        <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:opacity-80 transition-opacity"
            title={platform.label}
        >
            {iconNode}
        </a>
    );
};
