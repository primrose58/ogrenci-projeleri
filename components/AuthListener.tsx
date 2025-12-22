"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

export default function AuthListener() {
    const searchParams = useSearchParams();
    const router = useRouter();

    useEffect(() => {
        const verified = searchParams.get("verified");

        if (verified === "true") {
            // Show success message
            toast.success("Email başarıyla doğrulandı! Giriş yapıldı.", {
                duration: 5000,
                description: "Artık platformu tam özellikleriyle kullanabilirsiniz."
            });

            // Clean up the URL
            const newParams = new URLSearchParams(searchParams.toString());
            newParams.delete("verified");

            // Construct new path
            // We use window.location.pathname because we want to stay on the same page but clean params
            const newPath = window.location.pathname + (newParams.toString() ? `?${newParams.toString()}` : "");

            router.replace(newPath);
            router.refresh(); // Refresh server components to update auth state in UI
        }
    }, [searchParams, router]);

    return null;
}
