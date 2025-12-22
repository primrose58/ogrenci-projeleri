export default function Loading() {
    return (
        <div className="min-h-screen text-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-400">Yükleniyor...</p>
            </div>
        </div>
    );
}
