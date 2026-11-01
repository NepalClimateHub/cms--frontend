const getEnvVar = (key: string): string | undefined => {
  const value = import.meta.env[key]
  if (
    !value ||
    value === 'undefined' ||
    value === 'null' ||
    value.trim() === ''
  ) {
    return undefined
  }
  return value
}

// A scheme with a single slash ("https:/host") is parsed as a *relative* URL by
// the browser whenever the page shares its scheme, so requests silently go to
// the CMS origin instead of the API. Normalise it rather than shipping broken
// requests that the SPA asset handler answers with index.html and a 200.
const normaliseBaseUrl = (value: string | undefined): string | undefined => {
  if (!value) return undefined
  const trimmed = value.trim().replace(/\/+$/, '')
  const singleSlashScheme = /^(https?):\/(?!\/)/i
  if (singleSlashScheme.test(trimmed)) {
    const fixed = trimmed.replace(singleSlashScheme, '$1://')
    console.warn(
      `[env] VITE_API_URL is malformed ("${trimmed}") — missing a slash after the scheme. Using "${fixed}". Fix the build variable.`
    )
    return fixed
  }
  return trimmed
}

const productionPreviewSiteUrl = (
  value: string | undefined
): string | undefined => {
  // The CMS must never submit unpublished preview content back to its own SPA.
  // The production CMS origin has no server-side /blog-preview route; the public
  // Astro site owns that POST-only route.
  if (
    typeof window !== 'undefined' &&
    window.location.origin === 'https://cms.nepalclimatehub.org'
  ) {
    return 'https://nepalclimatehub.org'
  }
  return normaliseBaseUrl(value)
}

export const env = {
  VITE_API_URL: normaliseBaseUrl(getEnvVar('VITE_API_URL')),
  VITE_RAG_API_URL:
    normaliseBaseUrl(getEnvVar('VITE_RAG_API_URL')) || 'http://localhost:8000',
  VITE_MAPTILER_API_KEY: getEnvVar('VITE_MAPTILER_API_KEY'),
  VITE_PUBLIC_SITE_URL: productionPreviewSiteUrl(
    getEnvVar('VITE_PUBLIC_SITE_URL')
  ),
  MODE: import.meta.env.MODE,
}

export const isEnvConfigured = (): boolean => {
  return typeof env.VITE_API_URL === 'string'
}
