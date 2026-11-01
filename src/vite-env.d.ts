/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_PUBLIC_SITE_URL?: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
