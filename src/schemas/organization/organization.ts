export type Organization = {
  id: string
  businessName: string
  email: string
  contact: string
  dateOfJoin?: Date
  createdAt: Date
  updatedAt: Date
  deletedAt?: Date | null
}
