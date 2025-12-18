
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface NavIconProps {
    icon: LucideIcon;
    label: string;
    active: boolean;
    onClick: () => void;
    tooltip?: string;
}

export const NavIcon: React.FC<NavIconProps> = ({ icon: Icon, label, active, onClick, tooltip }) => {
    return (
        <button
            onClick={onClick}
            className={`relative flex flex-col md:flex-row items-center md:items-center justify-center md:justify-start gap-1 md:gap-3 p-2 md:px-4 md:py-3 rounded-lg w-full transition-all duration-300 group overflow-visible ${active
                ? 'bg-white/10 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-white/20'
                : 'text-zinc-500 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
        >
            {/* Active Indicator Glow */}
            {active && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-tech-gold shadow-[0_0_10px_rgba(255,215,0,0.8)]"></div>}

            <Icon size={18} className={`transition-colors duration-300 ${active ? 'text-tech-gold drop-shadow-[0_0_5px_rgba(255,215,0,0.5)]' : 'group-hover:text-white'}`} />
            <span className={`text-[9px] md:text-[10px] font-mono uppercase tracking-widest transition-colors duration-300 ${active ? 'text-white' : 'text-zinc-500 group-hover:text-zinc-300'}`}>
                {label}
            </span>
            {active && (
                <div className="ml-auto w-1.5 h-1.5 bg-tech-gold rounded-full hidden md:block shadow-[0_0_8px_rgba(255,215,0,0.8)] animate-pulse"></div>
            )}

            {/* Tooltip */}
            {tooltip && (
                <div className="absolute left-full ml-4 px-2 py-1 bg-zinc-900 border border-white/10 text-[10px] text-white rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 pointer-events-none hidden md:block">
                    {tooltip}
                </div>
            )}
        </button>
    );
};
