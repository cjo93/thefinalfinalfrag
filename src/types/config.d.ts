declare module '*jules.config' {
    const config: any;
    export default config;
}

declare module '*antigravity.config' {
    const config: any;
    export default config;
}

interface ImportMeta {
    env: {
        VITE_API_URL?: string;
        DEV: boolean;
        PROD: boolean;
        [key: string]: any;
    };
}
