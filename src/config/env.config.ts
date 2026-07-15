const getEnvVar = (key: string): string | undefined => {
  const value = import.meta.env[key];
  if (!value || value === 'undefined' || value === 'null' || value.trim() === '') {
    return undefined;
  }
  return value;
};

export const env = {
  VITE_API_URL: getEnvVar('VITE_API_URL'),
  VITE_RAG_API_URL: getEnvVar('VITE_RAG_API_URL') || 'http://localhost:8000',
  MODE: import.meta.env.MODE,
};

export const isEnvConfigured = (): boolean => {
  return typeof env.VITE_API_URL === 'string';
};
