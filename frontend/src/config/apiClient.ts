/**
 * API Client with Global Error Handling
 * Wraps native fetch with automatic error interception.
 */

interface FetchOptions extends RequestInit {
    skipErrorHandling?: boolean;
}

export class ApiError extends Error {
    status: number;
    statusText: string;
    data: unknown;

    constructor(status: number, statusText: string, data: unknown) {
        super(`API Error ${status}: ${statusText}`);
        this.status = status;
        this.statusText = statusText;
        this.data = data;
    }
}

export const apiClient = {
    async fetch(url: string, options: FetchOptions = {}) {
        const { skipErrorHandling, ...fetchOptions } = options;

        try {
            const response = await fetch(url, fetchOptions);

            if (!response.ok) {
                // Parse error body if possible
                let errorData;
                try {
                    errorData = await response.json();
                } catch {
                    errorData = { message: 'Unknown error occurred' };
                }

                // Global Error Handling Logic
                if (!skipErrorHandling) {
                    handleGlobalErrors(response.status, errorData);
                }

                throw new ApiError(response.status, response.statusText, errorData);
            }

            return response;
        } catch (error) {
            // Re-throw if it's already an ApiError (handled above)
            if (error instanceof ApiError) {
                throw error;
            }
            // Network or Request Errors
            console.error("Network/Request Error:", error);
            throw new Error('Network request failed');
        }
    },

    // Convenience methods
    async get(url: string, options: FetchOptions = {}) {
        return this.fetch(url, { ...options, method: 'GET' });
    },

    async post(url: string, body: unknown, options: FetchOptions = {}) {
        return this.fetch(url, {
            ...options,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            body: JSON.stringify(body),
        });
    }
};

/**
 * Global Error Handler
 * Dispatches UI events or logs based on status code.
 * In a React app, this might dispatch to a global Toast/Context.
 * Here we use window events or simple alerts for now.
 */
function handleGlobalErrors(status: number, _data: unknown) {
    switch (status) {
        case 401:
            console.warn("Unauthorized (401). Redirecting to login or showing modal.");
            // Example: window.dispatchEvent(new CustomEvent('auth:required'));
            break;
        case 403:
            console.warn("Forbidden (403). Feature locked.");
            // Example: window.dispatchEvent(new CustomEvent('ui:toast', { detail: { type: 'error', message: 'Access Denied: Upgrade Required' } }));
            break;
        case 429:
            console.warn("Rate Limit Exceeded (429).");
            // Example: window.dispatchEvent(new CustomEvent('ui:toast', { detail: { type: 'warning', message: 'System Cooling Down. excessive signal.' } }));
            break;
        case 500:
            console.error("Server Error (500).");
            break;
    }
}
