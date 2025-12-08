"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Share, X } from "lucide-react";

export function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [showPrompt, setShowPrompt] = useState(false);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if running in standalone mode (already installed)
        const isStandaloneMode =
            window.matchMedia("(display-mode: standalone)").matches ||
            (window.navigator as any).standalone ||
            document.referrer.includes("android-app://");

        setIsStandalone(isStandaloneMode);

        if (isStandaloneMode) return;

        // Check if iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isIosDevice);

        if (isIosDevice) {
            // Show prompt for iOS after a small delay to not annoy immediately
            // Only show if not already dismissed in this session (simplified)
            const timer = setTimeout(() => setShowPrompt(true), 3000);
            return () => clearTimeout(timer);
        }

        // Capture the android/chrome install prompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowPrompt(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === "accepted") {
                setDeferredPrompt(null);
                setShowPrompt(false);
            }
        }
    };

    if (!showPrompt || isStandalone) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 bg-background/80 backdrop-blur-md border border-primary/20 p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-[0_0_20px_rgba(236,72,153,0.15)] animate-in slide-in-from-bottom-10 fade-in duration-500">
            <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                    <h3 className="font-bold text-lg mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                        Install ToolInsta
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {isIOS ? (
                            <>
                                To install on iOS: Tap <Share className="inline h-4 w-4 mx-1 text-primary" /> and select{" "}
                                <span className="font-medium text-foreground">"Add to Home Screen"</span>
                            </>
                        ) : (
                            "Install our app for a better full-screen experience and offline access."
                        )}
                    </p>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 -mt-2 -mr-2 text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPrompt(false)}
                >
                    <X className="h-4 w-4" />
                </Button>
            </div>

            {!isIOS && (
                <div className="mt-5 flex justify-end gap-3">
                    <Button
                        variant="ghost"
                        onClick={() => setShowPrompt(false)}
                        className="text-muted-foreground hover:text-foreground hover:bg-transparent"
                    >
                        Maybe Later
                    </Button>
                    <Button
                        onClick={handleInstallClick}
                        className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white border-0 shadow-lg shadow-pink-500/20 transition-all duration-300 hover:shadow-pink-500/40"
                    >
                        Install App
                    </Button>
                </div>
            )}
        </div>
    );
}
