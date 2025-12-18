
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import { useCallback } from 'react';

export const useAnalytics = () => {
  const track = useCallback((category: string, action: string, label?: string) => {
    // Privacy-Focused Analytics Implementation
    // 1. No PII (Personally Identifiable Information) is collected.
    // 2. No IP addresses are stored or logged.
    // 3. No cookies or persistent trackers are used.
    // 4. Data is strictly event-based for UX improvement.

    // In a production environment, this would send an anonymous payload to a privacy-first
    // service like Plausible, Fathom, or a self-hosted instance.

    // For development/demo, we log the secure event to the console.
    if (process.env.NODE_ENV === 'development') { // Force log for demo visibility
      const timestamp = new Date().toISOString();
      console.debug(`[SECURE_METRICS] T:${timestamp} | CAT:${category} | ACT:${action} ${label ? `| LBL:${label}` : ''}`);
    }
  }, []);

  return { track };
};
