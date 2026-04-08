export type OrganizationProfile = {
  id: string
  name: string
  logoImageUrl: string
  logoImageId: string | null
  isVerifiedByAdmin: boolean
  verificationDocumentUrl: string | null
  verificationDocumentId: string | null
  verificationRequestRemarks: string | null
  verificationRequestedAt: string | null
}
