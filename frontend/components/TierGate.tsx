
import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useTier } from '../hooks/useTier';

interface TierGateProps {
    requiredTier: 'observer' | 'operator' | 'architect';
    children: ReactNode;
    feature: string;
    previewMode?: boolean;
}

export function TierGate({ requiredTier, children, feature, previewMode = false }: TierGateProps) {
    const { isObserver, isOperator, isArchitect, showUpgrade } = useTier();

    // Logic: Higher tiers have access to lower tier features
    let hasAccess = false;

    if (requiredTier === 'architect') {
        hasAccess = isArchitect;
    } else if (requiredTier === 'operator') {
        hasAccess = isOperator; // isOperator is inclusive (Operator+) in useTier
    } else {
        hasAccess = true; // Observer is base
    }

    if (hasAccess) {
        return <>{children}</>;
    }

    return (
        <div className="relative w-full h-full">
            {previewMode && (
                <div className="blur-md pointer-events-none opacity-50 select-none w-full h-full">
                    {children}
                </div>
            )}

            <div className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-50">
                <motion.div
                    className="max-w-md p-8 bg-gradient-to-b from-gray-900 to-black border border-cyan-400/30 rounded-lg shadow-2xl text-center"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                >
                    <div className="text-cyan-400 text-sm mb-2 font-mono tracking-widest uppercase">
                        ACCESS RESTRICTED
                    </div>
                    <h3 className="text-2xl mb-4 text-white font-serif">{feature}</h3>
                    <p className="text-gray-400 mb-6 font-mono text-xs">
                        This operation requires {requiredTier.toUpperCase()} clearance.
                    </p>
                    <button
                        onClick={() => showUpgrade()}
                        className="w-full bg-cyan-400 text-black py-3 px-6 font-mono hover:bg-cyan-300 transition-colors uppercase tracking-widest text-xs font-bold"
                    >
                        UPGRADE TO {requiredTier.toUpperCase()}
                    </button>
                </motion.div>
            </div>
        </div>
    );
}
