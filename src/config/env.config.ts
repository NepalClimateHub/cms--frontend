const getEnvVar = (key: string): string | undefined => {
  const value = import.meta.env[key];
  if (!value || value === 'undefined' || value === 'null' || value.trim() === '') {
    return undefined;
  }
  return value;
};

// A scheme with a single slash ("https:/host") is parsed as a *relative* URL by
// the browser whenever the page shares its scheme, so requests silently go to
// the CMS origin instead of the API. Normalise it rather than shipping broken
// requests that the SPA asset handler answers with index.html and a 200.
const normaliseBaseUrl = (value: string | undefined): string | undefined => {
  if (!value) return undefined;
  const trimmed = value.trim().replace(/\/+$/, '');
  const singleSlashScheme = /^(https?):\/(?!\/)/i;
  if (singleSlashScheme.test(trimmed)) {
    const fixed = trimmed.replace(singleSlashScheme, '$1://');
    // eslint-disable-next-line no-console -- surface a misconfigured build variable
    console.warn(
      `[env] VITE_API_URL is malformed ("${trimmed}") — missing a slash after the scheme. Using "${fixed}". Fix the build variable.`
    );
    return fixed;
  }
  return trimmed;
};

export const env = {
  VITE_API_URL: normaliseBaseUrl(getEnvVar('VITE_API_URL')),
  VITE_RAG_API_URL:
    normaliseBaseUrl(getEnvVar('VITE_RAG_API_URL')) || 'http://localhost:8000',
  MODE: import.meta.env.MODE,
};

export const isEnvConfigured = (): boolean => {
  return typeof env.VITE_API_URL === 'string';
};
