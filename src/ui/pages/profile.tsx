import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/ui/shadcn/avatar'
import { Button } from '@/ui/shadcn/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/ui/shadcn/card'
import { Badge } from '@/ui/shadcn/badge'
import { Separator } from '@/ui/shadcn/separator'
import { useAuthStore } from '@/stores/authStore'
import { getInitialsForAvatar } from '@/ui/shadcn/lib/utils'
import {
  CalendarDays,
  Mail,
  Shield,
  User,
  Edit,
  Settings,
} from 'lucide-react'
import ChangePasswordDialog from '@/ui/organisms/dashboard/ChangePasswordDialog'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const nameInitials = getInitialsForAvatar(user?.fullName || 'User')
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false)

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
          <User className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-semibold text-gray-900">No user data</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Please log in to view your profile.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
          <p className="text-muted-foreground">
            Manage your account settings and view your information.
          </p>
        </div>
        <Button variant="outline" size="sm">
          <Edit className="mr-2 h-4 w-4" />
          Edit Profile
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Information Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
              <CardDescription>
                Your personal details and account information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar and Basic Info */}
              <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={undefined} alt={user.fullName} />
                  <AvatarFallback className="text-lg">
                    {nameInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-2xl font-semibold">{user.fullName}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={user.isActive ? 'default' : 'secondary'}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                    {user.isSuperAdmin && (
                      <Badge variant="destructive">
                        <Shield className="mr-1 h-3 w-3" />
                        Super Admin
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              <Separator />

              {/* Contact Information */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span className="text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Member since:</span>
                    <span className="text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

            
            
            </CardContent>
          </Card>
        </div>

        {/* Organization Information Card */}
        <div className="lg:col-span-1">
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Account Settings
              </CardTitle>
              <CardDescription>
                Manage your account preferences and security.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Account Status</span>
                  <Badge variant={user.isActive ? 'default' : 'secondary'}>
                    {user.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Account Type</span>
                  <Badge variant="outline">
                    {user.isSuperAdmin ? 'Super Admin' : 'Standard User'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Updated</span>
                  <span className="text-sm text-muted-foreground">
                    {new Date(user.updatedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setIsChangePasswordDialogOpen(true)}
                >
                  Change Password
                </Button>
               
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <ChangePasswordDialog
        open={isChangePasswordDialogOpen}
        onOpenChange={setIsChangePasswordDialogOpen}
      />
    </div>
  )
}
