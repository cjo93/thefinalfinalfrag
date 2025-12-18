import React, { useState } from 'react';
import { Plus, Users, Trash2, Brain } from 'lucide-react';
import { API_ENDPOINTS } from '../src/config/api';
import { apiClient } from '../src/config/apiClient';
import { LineageMember, Vector3 } from '../../src/types/family-system';

interface FamilyInputNodeProps {
    members: LineageMember[];
    onUpdateMembers: (members: LineageMember[]) => void;
    onAnalyze?: () => void;
}

export const FamilyInputNode: React.FC<FamilyInputNodeProps> = ({ members, onUpdateMembers, onAnalyze }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [newRole, setNewRole] = useState('');
    const [newBio, setNewBio] = useState({
        birthDate: '',
        birthTime: '',
        birthLocation: ''
    });

    const resetForm = () => {
        setIsAdding(false);
        setNewRole('');
        setNewBio({ birthDate: '', birthTime: '', birthLocation: '' });
    };

    const handleAddMember = () => {
        if (!newRole) return;
        const newMember: LineageMember = {
            id: crypto.randomUUID(),
            role: newRole,
            vector: { x: 0, y: 0, z: 0 },
            bioMetrics: (newBio.birthDate || newBio.birthTime || newBio.birthLocation) ? newBio : undefined
        };
        onUpdateMembers([...members, newMember]);
        resetForm();
    };

    const handleUpdateVector = (id: string, axis: keyof Vector3, value: number) => {
        const updated = members.map(m => {
            if (m.id === id) {
                return {
                    ...m,
                    vector: { ...m.vector!, [axis]: value }
                };
            }
            return m;
        });
        onUpdateMembers(updated);
    };

    const handleDelete = (id: string) => {
        onUpdateMembers(members.filter(m => m.id !== id));
    };

    const handleImportContacts = async () => {
        // Feature detection for Contact Picker API
        if ('contacts' in navigator && 'ContactsManager' in window) {
            try {
                const props = ['name'];
                const opts = { multiple: true };
                // @ts-expect-error: Contact Picker API is experimental
                const contacts = await navigator.contacts.select(props, opts);

                if (contacts && contacts.length > 0) {
                    const newMembers: LineageMember[] = contacts.map((c: { name: string[] }) => ({
                        id: crypto.randomUUID(),
                        role: c.name?.[0] || 'Unknown Contact',
                        vector: { x: 0, y: 0, z: 0 } // Default center position
                    }));

                    // Merge avoiding duplicates if possible, or just append
                    onUpdateMembers([...members, ...newMembers]);
                }
            } catch (ex) {
                console.error("Contact import failed or cancelled", ex);
            }
        } else {
            alert("Contact Import is only available on supported mobile devices (Android/Chrome).");
        }
    };

    const [simulating, setSimulating] = useState(false);

    const handleRunPhysics = async () => {
        setSimulating(true);
        try {
            // const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002'; // DEPRECATED
            // Using INIT endpoint for full user update or dedicated update endpoint if available.
            // Assuming INIT handles upsert as per useAuth.
            // Using SIMULATE endpoint for physics calculation
            const res = await apiClient.post(API_ENDPOINTS.SIMULATE, {
                members: members,
                iterations: 30
            }, {
                headers: { 'Authorization': 'Bearer mock_token' }
            });
            const data = await res.json();
            if (data.success && data.data.members) {
                // Determine if any nodes moved significantly? Optional UI feedback.
                onUpdateMembers(data.data.members);
            }
        } catch (e) {
            console.error("Simulation failed", e);
        } finally {
            setSimulating(false);
        }
    };

    return (
        <div className="absolute top-0 right-0 h-full w-80 bg-black/80 backdrop-blur-md border-l border-white/10 p-6 flex flex-col overflow-hidden">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-serif text-white text-lg">System Layout</h3>
                <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                    <Users size={12} />
                    {members.length} Nodes
                </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-6">
                {/* Physics Control - New */}
                <div className="p-4 bg-emerald-900/10 border border-emerald-500/20 rounded-sm">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">Physics Entanglement</span>
                        {simulating && (
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        )}
                    </div>
                    <button
                        onClick={handleRunPhysics}
                        disabled={simulating || members.length === 0}
                        className="w-full py-2 bg-emerald-950 hover:bg-emerald-900 text-emerald-400 border border-emerald-900 hover:border-emerald-700 transition-all font-mono text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {simulating ? 'Calculating Forces...' : 'Run Simulation'}
                    </button>
                    <p className="text-[9px] text-zinc-500 mt-2 leading-relaxed">
                        Applies relationship forces to calculate organic positions.
                    </p>
                </div>


                {/* Intelligence Control - New */}
                <div className="p-4 bg-tech-gold/10 border border-tech-gold/20 rounded-sm mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <span className="text-[10px] font-mono text-tech-gold uppercase tracking-widest">Deep Intelligence</span>
                        <Brain size={12} className="text-tech-gold" />
                    </div>
                    <button
                        onClick={onAnalyze}
                        disabled={!onAnalyze || members.length === 0}
                        className="w-full py-2 bg-black hover:bg-tech-gold/20 text-tech-gold border border-tech-gold/40 hover:border-tech-gold transition-all font-mono text-[10px] uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        Analyze System
                    </button>
                    <p className="text-[9px] text-zinc-500 mt-2 leading-relaxed">
                        Uses Gemini AI to generate a psycho-cybernetic diagnostic report.
                    </p>
                </div>

                {members.map(member => (
                    <div key={member.id} className="p-4 border border-white/10 bg-white/5 rounded-sm group relative hover:border-white/30 transition-colors">
                        <button
                            onClick={() => handleDelete(member.id)}
                            className="absolute top-2 right-2 text-zinc-600 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 size={14} />
                        </button>

                        <div className="mb-4">
                            <div className="text-sm font-mono text-white uppercase tracking-widest font-bold">{member.role}</div>
                            {member.bioMetrics && (
                                <div className="text-[9px] font-mono text-zinc-500 mt-1">
                                    {member.bioMetrics.birthDate} // {member.bioMetrics.birthLocation}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3">
                            {/* Manual Controls */}
                            <div className="space-y-1">
                                <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                                    <span>Connection (X)</span>
                                    <span>{member.vector?.x.toFixed(2)}</span>
                                </div>
                                <input
                                    type="range" min="-1" max="1" step="0.1"
                                    value={member.vector?.x || 0}
                                    onChange={(e) => handleUpdateVector(member.id, 'x', parseFloat(e.target.value))}
                                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-blue-400"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                                    <span>Agency (Y)</span>
                                    <span>{member.vector?.y.toFixed(2)}</span>
                                </div>
                                <input
                                    type="range" min="-1" max="1" step="0.1"
                                    value={member.vector?.y || 0}
                                    onChange={(e) => handleUpdateVector(member.id, 'y', parseFloat(e.target.value))}
                                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
                                />
                            </div>
                            <div className="space-y-1">
                                <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase">
                                    <span>Meaning (Z)</span>
                                    <span>{member.vector?.z.toFixed(2)}</span>
                                </div>
                                <input
                                    type="range" min="-1" max="1" step="0.1"
                                    value={member.vector?.z || 0}
                                    onChange={(e) => handleUpdateVector(member.id, 'z', parseFloat(e.target.value))}
                                    className="w-full h-1 bg-zinc-700 rounded-lg appearance-none cursor-pointer accent-purple-400"
                                />
                            </div>
                        </div>

                        {/* New: Relationship Type Selector (Simple for now, to drive physics) */}
                        <div className="mt-4 pt-3 border-t border-white/5">
                            <div className="flex justify-between text-[9px] font-mono text-zinc-500 uppercase mb-1">
                                <span>Vector Type</span>
                            </div>
                            <select
                                className="w-full bg-zinc-900 border border-zinc-800 text-[10px] text-zinc-300 p-1 outline-none"
                                value={member.relationshipType || 'close'}
                                onChange={(e) => {
                                    const updated = members.map(m => m.id === member.id ? { ...m, relationshipType: e.target.value as 'close' | 'conflict' | 'distant' | 'cutoff' } : m);
                                    onUpdateMembers(updated);
                                }}
                            >
                                <option value="close">Close (Attract)</option>
                                <option value="conflict">Conflict (Repel)</option>
                                <option value="distant">Distant (Drift)</option>
                                <option value="cutoff">Cutoff (Static)</option>
                            </select>
                        </div>
                    </div>
                ))}

                {/* Add New State */}
                {isAdding ? (
                    <div className="p-4 border border-zinc-700 border-dashed rounded-sm animate-in fade-in space-y-3">
                        <input
                            autoFocus
                            type="text"
                            placeholder="Role (e.g. Mother)"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddMember()} // Only submit on Enter if Role is focused? Maybe risky with date inputs.
                            className="w-full bg-transparent text-sm font-mono text-white outline-none placeholder:text-zinc-600 border-b border-zinc-800 pb-2 focus:border-white transition-colors"
                        />

                        <div className="space-y-2 pt-2">
                            <label className="text-[9px] font-mono uppercase text-zinc-500 tracking-widest block">Biometrics (Optional)</label>
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="date"
                                    value={newBio.birthDate}
                                    onChange={(e) => setNewBio({ ...newBio, birthDate: e.target.value })}
                                    className="bg-zinc-900/50 border border-zinc-800 p-2 text-[10px] font-mono text-zinc-300 outline-none focus:border-white/30 transition-colors"
                                />
                                <input
                                    type="time"
                                    value={newBio.birthTime}
                                    onChange={(e) => setNewBio({ ...newBio, birthTime: e.target.value })}
                                    className="bg-zinc-900/50 border border-zinc-800 p-2 text-[10px] font-mono text-zinc-300 outline-none focus:border-white/30 transition-colors"
                                />
                            </div>
                            <input
                                type="text"
                                placeholder="Birth Location"
                                value={newBio.birthLocation}
                                onChange={(e) => setNewBio({ ...newBio, birthLocation: e.target.value })}
                                className="w-full bg-zinc-900/50 border border-zinc-800 p-2 text-[10px] font-mono text-zinc-300 outline-none focus:border-white/30 transition-colors"
                            />
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button onClick={resetForm} className="flex-1 py-2 text-[10px] uppercase border border-zinc-700 text-zinc-500 hover:text-white transition-colors">Cancel</button>
                            <button onClick={handleAddMember} className="flex-1 py-2 text-[10px] uppercase bg-white text-black hover:bg-zinc-200 transition-colors">Confirm</button>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-2">
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-4 border border-zinc-800 border-dashed text-zinc-500 hover:text-white hover:border-zinc-600 transition-colors flex flex-col items-center gap-2"
                        >
                            <Plus size={16} />
                            <span className="text-[10px] font-mono uppercase tracking-widest">Add Node</span>
                        </button>

                        {/* Contacts Import Button */}
                        <button
                            onClick={handleImportContacts}
                            className="w-full py-3 bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <span className="text-[10px] font-mono uppercase tracking-widest">Import Contacts</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
