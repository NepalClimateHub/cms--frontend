import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { orgSchema, indSchema } from '@/schemas/auth/signup'
import { cn } from '@/ui/shadcn/lib/utils'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/ui/select'
import { PasswordInput } from '@/components/password-input'

const organizationTypes = [
  'Non-Profit / NGO',
  'Business / Company',
  'Educational Institution',
  'Student Club',
  'Social Enterprise',
  'Government',
  'Other',
]

const provinces = [
  'Koshi',
  'Madesh',
  'Bagmati',
  'Gandaki',
  'Lumbini',
  'Karnali',
  'Sudurpaschim',
]

const districtsByProvince: Record<string, string[]> = {
  Koshi: [
    'Bhojpur',
    'Dhankuta',
    'Ilam',
    'Jhapa',
    'Khotang',
    'Morang',
    'Okhaldhunga',
    'Panchthar',
    'Sankhuwasabha',
    'Solukhumbu',
    'Sunsari',
    'Taplejung',
    'Terhathum',
    'Udayapur',
  ],
  Madesh: [
    'Bara',
    'Dhanusha',
    'Mahottari',
    'Parsa',
    'Rautahat',
    'Saptari',
    'Sarlahi',
    'Siraha',
  ],
  Bagmati: [
    'Bhaktapur',
    'Chitwan',
    'Dhading',
    'Dolakha',
    'Kathmandu',
    'Kavrepalanchok',
    'Lalitpur',
    'Makwanpur',
    'Nuwakot',
    'Ramechhap',
    'Rasuwa',
    'Sindhuli',
    'Sindhupalchok',
  ],
  Gandaki: [
    'Baglung',
    'Gorkha',
    'Kaski',
    'Lamjung',
    'Manang',
    'Mustang',
    'Myagdi',
    'Nawalpur',
    'Parbat',
    'Syangja',
    'Tanahun',
  ],
  Lumbini: [
    'Arghakhanchi',
    'Banke',
    'Bardiya',
    'Dang',
    'Eastern Rukum',
    'Gulmi',
    'Kapilvastu',
    'Parasi',
    'Palpa',
    'Pyuthan',
    'Rolpa',
    'Rupandehi',
  ],
  Karnali: [
    'Dailekh',
    'Dolpa',
    'Humla',
    'Jajarkot',
    'Jumla',
    'Kalikot',
    'Mugu',
    'Salyan',
    'Surkhet',
    'Western Rukum',
  ],
  Sudurpaschim: [
    'Achham',
    'Baitadi',
    'Bajhang',
    'Bajura',
    'Dadeldhura',
    'Darchula',
    'Doti',
    'Kailali',
    'Kanchanpur',
  ],
}

type OrgForm = z.infer<typeof orgSchema>
type IndForm = z.infer<typeof indSchema>
type TabType = 'organization' | 'individual'

export default function SignUp() {
  const [tab, setTab] = useState<TabType>('organization')
  const [showSuccess, setShowSuccess] = useState(false)

  // Organization form
  const orgForm = useForm<OrgForm>({
    resolver: zodResolver(orgSchema),
    defaultValues: {
      orgName: '',
      orgEmail: '',
      orgType: '',
      orgTypeOther: '',
      province: '',
      district: '',
      adminName: '',
      password: '',
      confirmPassword: '',
    },
  })

  // Individual form
  const indForm = useForm<IndForm>({
    resolver: zodResolver(indSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  function handleOrgSubmit(_data: OrgForm) {
    setShowSuccess(true)
  }
  function handleIndSubmit(_data: IndForm) {
    setShowSuccess(true)
  }

  return (
    <div className='flex min-h-screen items-center justify-center bg-background px-4 py-6 sm:px-6 lg:px-8'>
      <Card className='w-full max-w-2xl border-0 bg-white shadow-none'>
        <CardHeader className='pb-2'>
          <CardTitle className='text-2xl font-bold text-gray-900 sm:text-3xl'>
            Sign Up
          </CardTitle>
          <CardDescription className='text-sm sm:text-base'>
            Create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Tabs */}
          <div className='mb-6 flex w-full justify-center gap-2'>
            <Button
              type='button'
              variant={tab === 'organization' ? 'default' : 'outline'}
              className={cn(
                'w-32 rounded-lg font-semibold transition-all sm:w-40',
                tab === 'organization'
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
              onClick={() => setTab('organization')}
            >
              Organization
            </Button>
            <Button
              type='button'
              variant={tab === 'individual' ? 'default' : 'outline'}
              className={cn(
                'w-32 rounded-lg font-semibold transition-all sm:w-40',
                tab === 'individual'
                  ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              )}
              onClick={() => setTab('individual')}
            >
              Individual
            </Button>
          </div>

          {/* Success Message */}
          {showSuccess ? (
            <Alert className='mb-6 mt-4 border-blue-200 bg-blue-50'>
              <AlertTitle className='text-blue-800'>
                Thanks for registering!
              </AlertTitle>
              <AlertDescription className='text-blue-700'>
                We've sent a verification link to your email address. Please
                verify to continue.
              </AlertDescription>
            </Alert>
          ) : (
            <div className='grid gap-6'>
              {/* Organization Form */}
              {tab === 'organization' && (
                <Form {...orgForm}>
                  <form
                    onSubmit={orgForm.handleSubmit(handleOrgSubmit)}
                    className='space-y-4'
                  >
                    <FormField
                      control={orgForm.control}
                      name='orgName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Name</FormLabel>
                          <FormControl>
                            <Input {...field} autoComplete='organization' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={orgForm.control}
                      name='orgEmail'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Email</FormLabel>
                          <FormControl>
                            <Input
                              type='email'
                              {...field}
                              autoComplete='email'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={orgForm.control}
                      name='orgType'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization Type</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(val) =>
                                orgForm.setValue('orgType', val)
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Select type' />
                              </SelectTrigger>
                              <SelectContent>
                                {organizationTypes.map((type) => (
                                  <SelectItem key={type} value={type}>
                                    {type}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Show text input if 'Other' is selected */}
                    {orgForm.watch('orgType') === 'Other' && (
                      <FormField
                        control={orgForm.control}
                        name='orgTypeOther'
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Other (please specify)</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    <FormField
                      control={orgForm.control}
                      name='province'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Province</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(val) => {
                                orgForm.setValue('province', val)
                                orgForm.setValue('district', '')
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Select province' />
                              </SelectTrigger>
                              <SelectContent>
                                {provinces.map((prov) => (
                                  <SelectItem key={prov} value={prov}>
                                    {prov}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={orgForm.control}
                      name='district'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>District</FormLabel>
                          <FormControl>
                            <Select
                              value={field.value}
                              onValueChange={(val) =>
                                orgForm.setValue('district', val)
                              }
                              disabled={!orgForm.watch('province')}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder='Select district' />
                              </SelectTrigger>
                              <SelectContent>
                                {(
                                  districtsByProvince[
                                    orgForm.watch('province')
                                  ] || []
                                ).map((d) => (
                                  <SelectItem key={d} value={d}>
                                    {d}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={orgForm.control}
                      name='adminName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Admin Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} autoComplete='name' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={orgForm.control}
                      name='password'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <PasswordInput
                              {...field}
                              autoComplete='new-password'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={orgForm.control}
                      name='confirmPassword'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <PasswordInput
                              {...field}
                              autoComplete='new-password'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      className='mt-2 h-10 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 sm:h-11 sm:text-base'
                      type='submit'
                    >
                      Register
                    </Button>
                  </form>
                </Form>
              )}

              {/* Individual Form */}
              {tab === 'individual' && (
                <Form {...indForm}>
                  <form
                    onSubmit={indForm.handleSubmit(handleIndSubmit)}
                    className='space-y-4'
                  >
                    <FormField
                      control={indForm.control}
                      name='fullName'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Full Name</FormLabel>
                          <FormControl>
                            <Input {...field} autoComplete='name' />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={indForm.control}
                      name='email'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input
                              type='email'
                              {...field}
                              autoComplete='email'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={indForm.control}
                      name='password'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <PasswordInput
                              {...field}
                              autoComplete='new-password'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={indForm.control}
                      name='confirmPassword'
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirm Password</FormLabel>
                          <FormControl>
                            <PasswordInput
                              {...field}
                              autoComplete='new-password'
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button
                      className='mt-2 h-10 w-full rounded-lg bg-blue-600 text-sm font-semibold text-white transition-colors duration-200 hover:bg-blue-700 sm:h-11 sm:text-base'
                      type='submit'
                    >
                      Register
                    </Button>
                  </form>
                </Form>
              )}
            </div>
          )}

          {/* Footer */}
          <div className='mt-6 text-center'>
            <span className='text-sm text-gray-600'>
              Already have an account?{' '}
              <Link
                to='/sign-in'
                className='font-medium text-blue-600 underline underline-offset-4 transition-colors hover:text-blue-700'
              >
                Sign In
              </Link>
            </span>
            <p className='mt-3 text-xs text-gray-500'>
              By creating an account, you agree to our{' '}
              <a
                href='/terms'
                className='font-medium text-blue-600 transition-colors hover:text-blue-700'
              >
                Terms
              </a>{' '}
              and{' '}
              <a
                href='/privacy'
                className='font-medium text-blue-600 transition-colors hover:text-blue-700'
              >
                Privacy
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
