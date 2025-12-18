/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    readonly DEV: boolean;
    readonly PROD: boolean;
    // more env variables...
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
