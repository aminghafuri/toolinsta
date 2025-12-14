"use client";

import { useEffect } from "react";

// Update this version when you deploy a new version that needs cache clearing
const APP_VERSION = "1.0.1";

export function CacheBuster() {
    useEffect(() => {
        if (typeof window === "undefined") return;

        const storedVersion = localStorage.getItem("app-version");

        // If version changed, clear all caches
        if (storedVersion !== APP_VERSION) {
            console.log(`[CacheBuster] Version changed from ${storedVersion} to ${APP_VERSION}. Clearing caches...`);

            // Clear all caches
            if ("caches" in window) {
                caches.keys().then((cacheNames) => {
                    cacheNames.forEach((cacheName) => {
                        console.log(`[CacheBuster] Deleting cache: ${cacheName}`);
                        caches.delete(cacheName);
                    });
                });
            }

            // Unregister old service workers and register fresh
            if ("serviceWorker" in navigator) {
                navigator.serviceWorker.getRegistrations().then((registrations) => {
                    registrations.forEach((registration) => {
                        console.log(`[CacheBuster] Unregistering old SW`);
                        registration.unregister();
                    });
                });
            }

            // Store new version
            localStorage.setItem("app-version", APP_VERSION);

            // Reload after a short delay to get fresh content
            setTimeout(() => {
                window.location.reload();
            }, 500);
        }
    }, []);

    return null;
}
