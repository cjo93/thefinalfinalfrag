
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { PricingModal } from '../../components/PricingModal';

interface TierContextType {
    openPricing: () => void;
    closePricing: () => void;
}

const TierContext = createContext<TierContextType | undefined>(undefined);

export const TierProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    const openPricing = () => setIsOpen(true);
    const closePricing = () => setIsOpen(false);

    return (
        <TierContext.Provider value={{ openPricing, closePricing }}>
            {children}
            <PricingModal isOpen={isOpen} onClose={closePricing} />
        </TierContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTierContext = () => {
    const context = useContext(TierContext);
    if (!context) {
        // Fallback if used outside provider (e.g. tests)
        return { openPricing: () => console.warn("TierProvider missing"), closePricing: () => { } };
    }
    return context;
};
