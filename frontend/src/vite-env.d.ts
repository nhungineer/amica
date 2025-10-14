/// <reference types="vite/client" />
// Extend Vite's existing ImportMetaEnv interface
interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}
// Tell TypeScript that import.meta has .env property
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
