"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { createClient } from "@/lib/supabase/client";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { useRouter } from "@/i18n/routing";
import SearchableSelect from "@/components/ui/SearchableSelect";
import { departments } from "@/data/departments";
import { toast } from "sonner";

export default function AuthPage() {
    const t = useTranslations('Auth');
    const router = useRouter();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
        studentId: '',
        department: '',
        phoneNumber: ''
    });

    const [isStudent, setIsStudent] = useState(true);

    const supabase = createClient();

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: formData.email,
                    password: formData.password
                });

                if (error) throw error;

                // Check if user exists but email is not confirmed (Supabase handles this usually via error, but custom flows might need it)
                // Actually, if 'email_confirm' is on, signIn returns error if not confirmed or session is null.
                if (data.session) {
                    toast.success(t('loginSuccess') || "Giriş başarılı! Hoş geldin.");
                    router.refresh(); // Refresh to update server components like Navbar
                    router.push('/');
                } else {
                    // This creates a smoother UX if session isn't immediately available or requires verification
                    toast.error("Lütfen email adresinizi onaylayın.");
                }

            } else {
                const { error } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                        data: {
                            full_name: formData.name,
                            student_number: isStudent ? formData.studentId : null,
                            department: isStudent ? formData.department : null,
                            phone: !isStudent ? formData.phoneNumber : null,
                            is_student: isStudent
                        }
                    }
                });

                if (error) throw error;

                toast.success("Hesap oluşturuldu! Lütfen giriş yapmadan önce email adresinize gelen onay linkine tıklayın.", {
                    duration: 6000,
                });

                // Optionally verify if we want to switch to login mode automatically
                setIsLogin(true);
            }
        } catch (err: unknown) {
            if (err instanceof Error) {
                const isInvalidCreds = err.message.includes("Invalid login credentials");
                const msg = isInvalidCreds ? t('invalidCredentials') : err.message;
                setError(msg);
                toast.error(msg);
            } else {
                setError('An unknown error occurred');
                toast.error('Beklenmedik bir hata oluştu');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[80vh] w-full p-4">
            <div className="relative w-full max-w-md p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 to-blue-500" />
                <div className="absolute -top-10 -right-10 w-24 h-24 bg-blue-500/20 rounded-full blur-xl" />
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-purple-500/20 rounded-full blur-xl" />

                <div className="relative z-10 flex flex-col items-center gap-6">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        {isLogin ? t('login') : t('signup')}
                    </h1>

                    {error && (
                        <div className="w-full p-3 text-sm text-red-200 bg-red-500/10 border border-red-500/20 rounded-lg">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleAuth} className="w-full flex flex-col gap-4">
                        {!isLogin && (
                            <>
                                <Input
                                    label={t('name')}
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />

                                <div className="flex items-center gap-2 mb-2">
                                    <input
                                        type="checkbox"
                                        id="studentCheck"
                                        checked={isStudent}
                                        onChange={(e) => setIsStudent(e.target.checked)}
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                                    />
                                    <label htmlFor="studentCheck" className="text-sm text-gray-300 select-none cursor-pointer">
                                        {t('areYouStudent')}
                                    </label>
                                </div>

                                {isStudent ? (
                                    <>
                                        <Input
                                            label={t('idNumber')}
                                            placeholder="2023001"
                                            value={formData.studentId}
                                            onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                                            required={isStudent}
                                        />

                                        <SearchableSelect
                                            label={t('department')}
                                            placeholder={t('department')}
                                            options={departments}
                                            value={formData.department}
                                            onChange={(value) => setFormData({ ...formData, department: value })}
                                            required={isStudent}
                                        />
                                    </>
                                ) : (
                                    <Input
                                        label={t('phoneNumber')}
                                        type="tel"
                                        placeholder="555 123 45 67"
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        required={!isStudent}
                                    />
                                )}
                            </>
                        )}
                        <Input
                            label={t('email')}
                            type="email"
                            placeholder="example@student.edu"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <Input
                            label={t('password')}
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />

                        <Button type="submit" isLoading={loading} className="mt-2">
                            {isLogin ? t('submitLogin') : t('submitSignup')}
                        </Button>
                    </form>

                    <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{isLogin ? t('noAccount') : t('haveAccount')}</span>
                        <button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-white hover:text-blue-400 hover:underline transition-colors font-medium"
                        >
                            {isLogin ? t('signup') : t('login')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
