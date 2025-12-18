
import React, { useState } from 'react';
import { User } from '../hooks/useAuth';
import { Save, LogOut } from 'lucide-react';
import { haptics, HapticPatterns } from '../src/services/haptics';
import { MandalaProfileCard } from './MandalaProfileCard';

interface SettingsViewProps {
    user: User;
    onUpdateUser: (user: User) => void;
    onLogout?: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ user, onUpdateUser, onLogout }) => {
    // Local state for editing
    const [name, setName] = useState(user.name);
    const [birthData, setBirthData] = useState({
        birthDate: user.bioMetrics?.birthDate || '',
        birthTime: user.bioMetrics?.birthTime || '',
        birthLocation: user.bioMetrics?.birthLocation || ''
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        setIsSaving(true);
        haptics.trigger(HapticPatterns.SUCCESS);

        const updatedUser: User = {
            ...user,
            name,
            bioMetrics: {
                ...user.bioMetrics!,
                ...birthData
            }
        };

        onUpdateUser(updatedUser);
        await new Promise(r => setTimeout(r, 800));
        setIsSaving(false);
    };


    return (
        <div className="h-full w-full overflow-y-auto custom-scrollbar p-6 md:p-12 pb-40">
            <div className="max-w-4xl mx-auto space-y-12">

                {/* Header */}
                <div className="flex items-end justify-between border-b border-white/10 pb-6">
                    <div>
                        <h2 className="text-3xl md:text-5xl font-serif text-white tracking-tight leading-[1.15] mb-2">
                            System Settings
                        </h2>
                        <p className="text-sm font-mono text-zinc-500 uppercase tracking-widest">
                            Configuration // Calibration // Identity
                        </p>
                    </div>
                </div>

                {/* Grid Layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12">

                    {/* Left Column: Calibration Data */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-lg font-serif text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-tech-gold rounded-full"></span>
                                Identity Matrix
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Signal Alias</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-zinc-900/50 border border-white/10 p-3 text-sm font-mono text-white focus:border-white/30 outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">UUID</label>
                                    <div className="w-full bg-black/50 border border-white/5 p-3 text-xs font-mono text-zinc-600 select-all cursor-copy">
                                        {user.id}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-serif text-white mb-6 flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                                Bio-Metric Calibration
                            </h3>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Birth Date</label>
                                    <input
                                        type="date"
                                        value={birthData.birthDate}
                                        onChange={(e) => setBirthData({ ...birthData, birthDate: e.target.value })}
                                        className="w-full bg-zinc-900/50 border border-white/10 p-3 text-sm font-mono text-white focus:border-white/30 outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Birth Time</label>
                                    <input
                                        type="time"
                                        value={birthData.birthTime}
                                        onChange={(e) => setBirthData({ ...birthData, birthTime: e.target.value })}
                                        className="w-full bg-zinc-900/50 border border-white/10 p-3 text-sm font-mono text-white focus:border-white/30 outline-none transition-colors"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-mono uppercase text-zinc-500 tracking-widest">Location Vector</label>
                                    <input
                                        type="text"
                                        value={birthData.birthLocation}
                                        onChange={(e) => setBirthData({ ...birthData, birthLocation: e.target.value })}
                                        className="w-full bg-zinc-900/50 border border-white/10 p-3 text-sm font-mono text-white focus:border-white/30 outline-none transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="w-full py-4 bg-white text-black font-mono text-xs uppercase tracking-widest hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                        >
                            {isSaving ? <span className="animate-pulse">Saving Protocol...</span> : <><Save size={14} /> Update Calibration</>}
                        </button>
                    </div>

                    {/* Right Column: Mandala & Account */}
                    <div className="space-y-8">
                        {/* Mandala Card */}
                        <MandalaProfileCard user={user} className="glass-panel" />

                        {/* Danger Zone */}
                        <div className="pt-12 border-t border-white/5">
                            <h4 className="text-[10px] font-mono text-red-900 uppercase tracking-widest mb-4">Danger Zone</h4>
                            <button
                                onClick={onLogout}
                                className="text-xs font-mono text-red-500 hover:text-red-400 flex items-center gap-2 transition-colors uppercase tracking-wider"
                            >
                                <LogOut size={14} /> Terminate Session
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};
