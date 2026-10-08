export type OrganizationProfile = {
  id: string
  name: string
  logoImageUrl: string
  logoImageId: string | null
  verificationDocumentUrl: string | null
  verificationDocumentId: string | null
  verificationDocuments?: Array<{ id: string; url: string }> | null
  verificationRequestRemarks: string | null
  verificationRequestedAt: string | null
  verificationAdminMessage?: string | null
  verificationMessageSentAt?: string | null
}
