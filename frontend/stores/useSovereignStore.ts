
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import CryptoJS from 'crypto-js';
import { LineageMember } from '../../src/types/family-system';

// --- Zero-Knowledge Encryption Middleware ---

const SECRET_KEY = 'sovereign-state-key-v1'; // Ideally this would be user-generated/session-based

// Custom Storage Engine that encrypts on save and decrypts on load
const encryptedStorage = {
    getItem: (name: string) => {
        const encrypted = localStorage.getItem(name);
        if (!encrypted) return null;
        try {
            const bytes = CryptoJS.AES.decrypt(encrypted, SECRET_KEY);
            const decrypted = bytes.toString(CryptoJS.enc.Utf8);
            return JSON.parse(decrypted);
        } catch (e) {
            console.error("Failed to decrypt sovereign state", e);
            return null;
        }
    },
    setItem: (name: string, value: unknown) => {
        const stringified = JSON.stringify(value);
        const encrypted = CryptoJS.AES.encrypt(stringified, SECRET_KEY).toString();
        localStorage.setItem(name, encrypted);
    },
    removeItem: (name: string) => {
        localStorage.removeItem(name);
    },
};

// --- Store Interface ---

interface SovereignState {
    // Family Data
    familyMembers: LineageMember[];
    updateMember: (id: string, updates: Partial<LineageMember>) => void;
    addMember: (member: LineageMember) => void;
    removeMember: (id: string) => void;
    setMembers: (members: LineageMember[]) => void;

    // Biometrics (Local Privacy Only)
    biometrics: {
        birthDate: string;
        birthTime: string;
        birthLocation: string;
    };
    updateBiometrics: (bio: Partial<SovereignState['biometrics']>) => void;

    // Privacy Actions
    purgeState: () => void;
    exportMindFile: () => string; // Returns encrypted JSON
    importMindFile: (encryptedData: string) => boolean;
}

// --- Store Implementation ---

export const useSovereignStore = create<SovereignState>()(
    persist(
        (set, get) => ({
            familyMembers: [],

            updateMember: (id, updates) => set((state) => ({
                familyMembers: state.familyMembers.map((m) =>
                    m.id === id ? { ...m, ...updates } : m
                )
            })),

            addMember: (member) => set((state) => ({
                familyMembers: [...state.familyMembers, member]
            })),

            removeMember: (id) => set((state) => ({
                familyMembers: state.familyMembers.filter((m) => m.id !== id)
            })),

            setMembers: (members) => set({ familyMembers: members }),

            biometrics: {
                birthDate: '',
                birthTime: '',
                birthLocation: ''
            },

            updateBiometrics: (bio) => set((state) => ({
                biometrics: { ...state.biometrics, ...bio }
            })),

            purgeState: () => {
                set({ familyMembers: [], biometrics: { birthDate: '', birthTime: '', birthLocation: '' } });
                localStorage.removeItem('sovereign-storage');
            },

            exportMindFile: () => {
                const state = get();
                const data = { familyMembers: state.familyMembers, biometrics: state.biometrics };
                return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
            },

            importMindFile: (encryptedData) => {
                try {
                    const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
                    const decrypted = JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
                    if (decrypted.familyMembers && decrypted.biometrics) {
                        set({ familyMembers: decrypted.familyMembers, biometrics: decrypted.biometrics });
                        return true;
                    }
                    return false;
                } catch (e) {
                    console.error("Import failed", e);
                    return false;
                }
            }
        }),
        {
            name: 'sovereign-storage', // Key in localStorage
            storage: createJSONStorage(() => encryptedStorage), // Use our encrypted engine
        }
    )
);
