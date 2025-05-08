export type User = {
  id: string
  email: string
  fullName: string;
  permissions: string[];
  isActive: boolean;
  isSuperAdmin: boolean;
  organization: {
    businessName?: string;
  };
  createdAt: string;
  updatedAt: string;
}
