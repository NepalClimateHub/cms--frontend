export const getProfileCompletion = (user: any): number => {
  if (!user) return 0

  const fields = []
  const role = user.role?.toString().trim().toUpperCase()

  const hasValue = (val: any) => {
    if (val === null || val === undefined) return false
    if (typeof val === 'string') return val.trim().length > 0
    if (typeof val === 'object') {
      // Handle cases where fields like bio/linkedin might be returned as empty objects or { [key]: unknown }
      return Object.keys(val).length > 0 || String(val).trim().length > 0
    }
    return Boolean(val)
  }

  if (role === 'ORGANIZATION') {
    const org = user.organization
    fields.push(hasValue(user.fullName))
    fields.push(hasValue(org?.name))
    fields.push(hasValue(org?.logoImageUrl))
    fields.push(hasValue(org?.verificationDocumentUrl))
  } else {
    fields.push(hasValue(user.fullName))
    fields.push(hasValue(user.bio))
    fields.push(hasValue(user.currentRole))
    fields.push(hasValue(user.profilePhotoUrl))

    // Check if at least one social link is present
    const socials = user.socials || {}
    const hasAnySocial =
      hasValue(socials.linkedin) ||
      hasValue(socials.facebook) ||
      hasValue(socials.instagram)
    fields.push(hasAnySocial)
  }

  const completed = fields.filter(Boolean).length
  return Math.round((completed / fields.length) * 100)
}
