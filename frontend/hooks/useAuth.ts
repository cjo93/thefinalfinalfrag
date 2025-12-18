
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useState, useEffect, useCallback } from 'react';
import { LineageMember } from '../../src/types/family-system';
import { CubeState } from '../types/geometry';
import { API_ENDPOINTS } from '../src/config/api';
import { apiClient } from '../src/config/apiClient';

export interface User {
    id: string;
    name: string;
    email: string;
    tier: 'ACCESS_SIGNAL' | 'HELIX_PROTOCOL' | 'ARCHITECT_NODE' | null;
    mandalaId?: string;
    // Bio-Metric Data for DEFRAG Analysis
    bioMetrics?: {
        birthDate: string;
        birthTime: string;
        birthLocation: string;
        humanDesignType: string; // e.g., "Projector 2/4"
        enneagram: string; // e.g., "Type 5 (The Investigator)"
    };
    tosAcceptedAt?: string; // ISO Date String
    gate?: number;
    familyMembers?: LineageMember[];
    family_system_state?: CubeState;
    gamification?: {
        xp: number;
        level: number;
        rank: 'INITIATE' | 'OBSERVER' | 'ARCHITECT' | 'SYSTEM_WEAVER';
        streak: number;
        lastActionTimestamp: number;
    };
}

export const useAuth = () => {
    // Initialize state from local storage or fallback to dev user
    const [user, setUser] = useState<User | null>(() => {
        const stored = localStorage.getItem('defrag_user');
        if (stored) {
            try {
                return JSON.parse(stored);
            } catch (e) {
                console.error("Failed to parse stored user", e);
            }
        }
        return null; // Production: Start unauthenticated
    });

    const [isLoading, setIsLoading] = useState(false);

    // Sync any external changes (not strictly necessary with the setter wrapper, but good for safety)
    useEffect(() => {
        // We don't need to load here anymore since we did it in init
    }, []);

    const login = useCallback(async (provider: 'google' | 'apple' | 'email', birthData?: { birthDate: string, birthTime: string, birthLocation: string }) => {
        setIsLoading(true);
        try {
            // 1. [TODO: INTEGRATION POINT] Handle Provider Auth (Firebase/Auth0/Clerk) here
            // In a production env, you would await signInWithPopup(auth, provider)
            // and get the resulting user object/token.
            const mockUserId = `usr_${Math.random().toString(36).substr(2, 9)}`;
            const mockEmail = "operator@defrag.os";
            const mockName = "OPERATOR_01";

            // 2. Call Backend Init
            let userBioMetrics = null;
            if (birthData) {
                const response = await apiClient.post(API_ENDPOINTS.INIT, {
                    userId: mockUserId,
                    email: mockEmail,
                    name: mockName,
                    bioMetrics: birthData
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.status === 'success' || data.status === 'success_mock') {
                        userBioMetrics = data.user.bioMetrics;
                    }
                }
            }

            // 3. Update State
            const finalUser: User = {
                id: mockUserId,
                name: mockName,
                email: mockEmail,
                tier: 'HELIX_PROTOCOL',
                mandalaId: `MNDL-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                bioMetrics: userBioMetrics || {
                    birthDate: birthData?.birthDate || "1989-11-04",
                    birthTime: birthData?.birthTime || "12:00",
                    birthLocation: birthData?.birthLocation || "Unknown",
                    humanDesignType: "Calibrating...",
                    enneagram: "Calibrating..."
                }
            };

            setUser(finalUser);
            localStorage.setItem('defrag_user', JSON.stringify(finalUser));

        } catch (err) {
            console.error("Login failed:", err);
            // Fallback for demo
            const fallbackUser: User = {
                id: "fallback_user",
                name: "OFFLINE_OPERATOR",
                email: "offline@defrag.os",
                tier: 'ACCESS_SIGNAL',
                bioMetrics: birthData ? { ...birthData, humanDesignType: "?", enneagram: "?" } : undefined
            };
            setUser(fallbackUser);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const logout = useCallback(() => {
        setUser(null);
        localStorage.removeItem('defrag_user');
    }, []);

    const upgradeTier = useCallback(async (tier: User['tier']) => {
        if (!user) return;
        setIsLoading(true);
        try {
            const response = await apiClient.post(API_ENDPOINTS.CHECKOUT, {
                tier: tier,
                userId: user.id,
                successUrl: window.location.origin,
                cancelUrl: window.location.origin,
            });

            const data = await response.json();
            if (data.url) {
                window.location.href = data.url;
            } else {
                console.error("No checkout URL returned", data);
                setIsLoading(false);
            }
        } catch (e) {
            console.error("Upgrade failed", e);
            setIsLoading(false);
        }
    }, [user]);

    // Check for Payment Return
    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const sessionId = query.get('session_id');

        if (sessionId && user) {
            const verifyPayment = async () => {
                setIsLoading(true);
                // Clear URL param to avoid loops
                window.history.replaceState({}, document.title, window.location.pathname);

                try {
                    const response = await apiClient.get(API_ENDPOINTS.CHECKOUT_STATUS(sessionId));
                    const data = await response.json();

                    if (data.payment_status === 'paid') {
                        // Update local user
                        const updatedUser = { ...user, tier: data.tier || user.tier }; // Use returned tier or keep current if checking
                        setUser(updatedUser);
                        localStorage.setItem('defrag_user', JSON.stringify(updatedUser));
                        // Optional: Show toast "Upgrade Complete"
                    }
                } catch (e) {
                    console.error("Payment verification failed", e);
                } finally {
                    setIsLoading(false);
                }
            };
            verifyPayment();
        }
    }, [user]); // Run once on mount if params exist, or when user loads

    return {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        upgradeTier,
        updateUser: (newUser: User | null) => {
            setUser(newUser);
            if (newUser) {
                localStorage.setItem('defrag_user', JSON.stringify(newUser));

                // [NEW] Background Sync to Backend
                // We fire this asynchronously and don't block the UI
                // Only sync if bioMetrics exist (required by backend)
                if (newUser.bioMetrics) {
                    // Use keepalive to ensure sync completes even if user navigates away
                    apiClient.post(API_ENDPOINTS.INIT, {
                        userId: newUser.id,
                        email: newUser.email,
                        name: newUser.name,
                        bioMetrics: newUser.bioMetrics,
                        familyMembers: newUser.familyMembers || []
                    }, { keepalive: true } as any).catch(e => console.error("Background sync failed", e));
                }
            } else {
                localStorage.removeItem('defrag_user');
            }
        }
    };
};
