import React, { useState } from 'react';
import { Activity } from 'lucide-react';

interface NatalDataFormProps {
    onSubmit: (data: { birthDate: string; birthTime: string; birthLocation: string }) => void;
    isLoading?: boolean;
}

export const NatalDataForm: React.FC<NatalDataFormProps> = ({ onSubmit, isLoading }) => {
    const [data, setData] = useState({
        birthDate: '',
        birthTime: '',
        birthLocation: ''
    });

    const isComplete = data.birthDate && data.birthTime && data.birthLocation;

    return (
        <div className="fixed inset-0 z-[150] bg-black flex items-center justify-center font-mono">
            {/* Background Elements */}
            <div className="absolute inset-0 opacity-20 pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-50 contrast-150"></div>

            <div className="w-full max-w-md p-8 relative z-10">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-3 h-3 bg-zinc-500 rounded-full animate-pulse"></div>
                    <h1 className="text-xl text-white font-bold tracking-[0.2em] uppercase">Initialize Profile</h1>
                </div>

                <div className="space-y-6">
                    <p className="text-zinc-500 text-xs leading-relaxed uppercase tracking-widest border-l-2 border-zinc-800 pl-4">
                        Your birth data establishes your unique geometry. <br />
                        Enter details to calibrate the system.
                    </p>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-[10px] uppercase text-zinc-600 tracking-widest">Date of Birth</label>
                            <input
                                type="date"
                                value={data.birthDate}
                                onChange={(e) => setData({ ...data, birthDate: e.target.value })}
                                className="w-full bg-zinc-900/50 border border-zinc-800 text-white p-3 text-sm focus:border-white transition-colors outline-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-zinc-600 tracking-widest">Time of Birth</label>
                                <input
                                    type="time"
                                    value={data.birthTime}
                                    onChange={(e) => setData({ ...data, birthTime: e.target.value })}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 text-white p-3 text-sm focus:border-white transition-colors outline-none"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase text-zinc-600 tracking-widest">Location</label>
                                <input
                                    type="text"
                                    placeholder="City, Country"
                                    value={data.birthLocation}
                                    onChange={(e) => setData({ ...data, birthLocation: e.target.value })}
                                    className="w-full bg-zinc-900/50 border border-zinc-800 text-white p-3 text-sm focus:border-white transition-colors outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => isComplete && onSubmit(data)}
                        disabled={!isComplete || isLoading}
                        className={`w-full py-4 mt-8 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-[0.2em] transition-all duration-300 ${isComplete && !isLoading ? 'bg-white text-black hover:bg-zinc-200' : 'bg-zinc-900 text-zinc-600 cursor-not-allowed'}`}
                    >
                        {isLoading ? (
                            <Activity size={16} className="animate-spin" />
                        ) : (
                            <span>Initialize System</span>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
