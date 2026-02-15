import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { useSignup } from '@/query/auth/use-auth'
import { orgSchema, indSchema } from '@/schemas/auth/signup'
import { Button } from '@/ui/shadcn/button'
import {
  Card,
  CardContent,
} from '@/ui/shadcn/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/ui/shadcn/form'
import { Input } from '@/ui/shadcn/input'
import { cn } from '@/ui/shadcn/lib/utils'
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/ui/shadcn/select'
import { Loader2 } from 'lucide-react'
import { PasswordInput } from '@/ui/password-input'

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
    'Bhojpur', 'Dhankuta', 'Ilam', 'Jhapa', 'Khotang', 'Morang', 'Okhaldhunga', 'Panchthar', 'Sankhuwasabha', 'Solukhumbu', 'Sunsari', 'Taplejung', 'Terhathum', 'Udayapur',
  ],
  Madesh: [
    'Bara', 'Dhanusha', 'Mahottari', 'Parsa', 'Rautahat', 'Saptari', 'Sarlahi', 'Siraha',
  ],
  Bagmati: [
    'Bhaktapur', 'Chitwan', 'Dhading', 'Dolakha', 'Kathmandu', 'Kavrepalanchok', 'Lalitpur', 'Makwanpur', 'Nuwakot', 'Ramechhap', 'Rasuwa', 'Sindhuli', 'Sindhupalchok',
  ],
  Gandaki: [
    'Baglung', 'Gorkha', 'Kaski', 'Lamjung', 'Manang', 'Mustang', 'Myagdi', 'Nawalpur', 'Parbat', 'Syangja', 'Tanahun',
  ],
  Lumbini: [
    'Arghakhanchi', 'Banke', 'Bardiya', 'Dang', 'Eastern Rukum', 'Gulmi', 'Kapilvastu', 'Parasi', 'Palpa', 'Pyuthan', 'Rolpa', 'Rupandehi',
  ],
  Karnali: [
    'Dailekh', 'Dolpa', 'Humla', 'Jajarkot', 'Jumla', 'Kalikot', 'Mugu', 'Salyan', 'Surkhet', 'Western Rukum',
  ],
  Sudurpaschim: [
    'Achham', 'Baitadi', 'Bajhang', 'Bajura', 'Dadeldhura', 'Darchula', 'Doti', 'Kailali', 'Kanchanpur',
  ],
}

type OrgForm = z.infer<typeof orgSchema>
type IndForm = z.infer<typeof indSchema>
type TabType = 'organization' | 'individual'

export default function SignUp() {
  const [tab, setTab] = useState<TabType>('organization')
  const { mutate: mutateSignup, isPending } = useSignup()

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

  const indForm = useForm<IndForm>({
    resolver: zodResolver(indSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  })

  function handleOrgSubmit(data: OrgForm) {
    mutateSignup({
      body: {
        name: data.adminName,
        username: data.orgEmail,
        password: data.password,
        email: data.orgEmail,
        userType: 'ORGANIZATION' as const,
      },
    })
  }

  function handleIndSubmit(data: IndForm) {
    mutateSignup({
      body: {
        name: data.fullName,
        username: data.email,
        password: data.password,
        email: data.email,
        userType: 'INDIVIDUAL' as const,
      },
    })
  }

  return (
    <div className='flex min-h-screen bg-background'>
      {/* Left Pane - Branding (Desktop Only) */}
      <div className='relative hidden w-1/2 flex-col justify-between bg-zinc-900 p-10 text-white lg:flex'>
        <div 
          className='absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50 brightness-75 transition-opacity'
          style={{ backgroundImage: 'url("/signup-bg.png")' }}
        />
        <div className='absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent' />
        
        <div className='relative z-20 flex items-center text-lg font-medium'>
          <svg
            xmlns='http://www.w3.org/2000/svg'
            viewBox='0 0 24 24'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            strokeLinecap='round'
            strokeLinejoin='round'
            className='mr-2 h-6 w-6'
          >
            <path d='M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3' />
          </svg>
          Nepal Climate Hub
        </div>
        
        <div className='relative z-20 mt-auto'>
          <blockquote className='space-y-2'>
            <p className='text-lg'>
              &ldquo;Join our community of climate leaders and organizations working together 
              to build a sustainable and resilient future for Nepal.&rdquo;
            </p>
            <footer className='text-sm italic'>Uniting for Climate Action</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Pane - Form */}
      <div className='flex w-full items-center justify-center p-4 lg:w-1/2 lg:p-8 overflow-y-auto'>
        <div className='mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[550px]'>
          <div className='flex flex-col space-y-2 text-center animate-in fade-in slide-in-from-top-4 duration-500'>
            <h1 className='text-3xl font-semibold tracking-tight'>
              Create an account
            </h1>
            <p className='text-sm text-muted-foreground'>
              Enter your details below to get started
            </p>
          </div>

          <Card className='border-none bg-transparent shadow-none'>
            <CardContent className='p-0'>
              <div className='mb-8 flex justify-center animate-in fade-in duration-700'>
                <div className='inline-flex h-12 items-center justify-center rounded-xl bg-muted p-1 text-muted-foreground w-full sm:w-auto'>
                  <button
                    onClick={() => setTab('organization')}
                    className={cn(
                      'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-8 py-2 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 sm:flex-none',
                      tab === 'organization' ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground/80'
                    )}
                  >
                    Organization
                  </button>
                  <button
                    onClick={() => setTab('individual')}
                    className={cn(
                      'inline-flex items-center justify-center whitespace-nowrap rounded-lg px-8 py-2 text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 flex-1 sm:flex-none',
                      tab === 'individual' ? 'bg-background text-foreground shadow-sm' : 'hover:text-foreground/80'
                    )}
                  >
                    Individual
                  </button>
                </div>
              </div>

              <div className='grid gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500'>
                {tab === 'organization' && (
                  <Form {...orgForm}>
                    <form
                      onSubmit={orgForm.handleSubmit(handleOrgSubmit)}
                      className='space-y-4'
                    >
                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <FormField
                          control={orgForm.control}
                          name='orgName'
                          render={({ field }) => (
                            <FormItem className='sm:col-span-2'>
                              <FormLabel>Organization Name</FormLabel>
                              <FormControl>
                                <Input placeholder='Acme Corp' {...field} autoComplete='organization' />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={orgForm.control}
                          name='orgEmail'
                          render={({ field }) => (
                            <FormItem className='sm:col-span-2'>
                              <FormLabel>Organization Email</FormLabel>
                              <FormControl>
                                <Input placeholder='hello@acme.com' type='email' {...field} autoComplete='email' />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={orgForm.control}
                          name='orgType'
                          render={({ field }) => (
                            <FormItem className={cn(orgForm.watch('orgType') === 'Other' ? 'sm:col-span-1' : 'sm:col-span-2')}>
                              <FormLabel>Organization Type</FormLabel>
                              <Select
                                value={field.value}
                                onValueChange={(val) =>
                                  orgForm.setValue('orgType', val)
                                }
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder='Select type' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {organizationTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        {orgForm.watch('orgType') === 'Other' && (
                          <FormField
                            control={orgForm.control}
                            name='orgTypeOther'
                            render={({ field }) => (
                              <FormItem className='sm:col-span-1 text-accent-foreground'>
                                <FormLabel>Specify Type</FormLabel>
                                <FormControl>
                                  <Input placeholder='Other type' {...field} />
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
                              <Select
                                value={field.value}
                                onValueChange={(val) => {
                                  orgForm.setValue('province', val)
                                  orgForm.setValue('district', '')
                                }}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder='Select province' />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {provinces.map((prov) => (
                                    <SelectItem key={prov} value={prov}>
                                      {prov}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
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
                              <Select
                                value={field.value}
                                onValueChange={(val) =>
                                  orgForm.setValue('district', val)
                                }
                                disabled={!orgForm.watch('province')}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder='Select district' />
                                  </SelectTrigger>
                                </FormControl>
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
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={orgForm.control}
                          name='adminName'
                          render={({ field }) => (
                            <FormItem className='sm:col-span-2'>
                              <FormLabel>Admin Full Name</FormLabel>
                              <FormControl>
                                <Input placeholder='John Doe' {...field} autoComplete='name' />
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
                                  placeholder='••••••••'
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
                                  placeholder='••••••••'
                                  {...field}
                                  autoComplete='new-password'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        className='h-11 w-full bg-primary font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]'
                        type='submit'
                        disabled={isPending}
                      >
                        {isPending && (
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        )}
                        Sign Up as Organization
                      </Button>
                    </form>
                  </Form>
                )}

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
                              <Input placeholder='John Doe' {...field} autoComplete='name' />
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
                              <Input placeholder='john@example.com' type='email' {...field} autoComplete='email' />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
                        <FormField
                          control={indForm.control}
                          name='password'
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Password</FormLabel>
                              <FormControl>
                                <PasswordInput
                                  placeholder='••••••••'
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
                                  placeholder='••••••••'
                                  {...field}
                                  autoComplete='new-password'
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <Button
                        className='h-11 w-full bg-primary font-semibold text-primary-foreground transition-all hover:opacity-90 active:scale-[0.98]'
                        type='submit'
                        disabled={isPending}
                      >
                        {isPending && (
                          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                        )}
                        Sign Up as Individual
                      </Button>
                    </form>
                  </Form>
                )}
              </div>

              {/* Footer */}
              <div className='mt-8 flex flex-col items-center space-y-4 text-center'>
                <p className='text-sm text-muted-foreground'>
                  Already have an account?{' '}
                  <Link
                    to='/sign-in'
                    className='font-semibold text-primary underline-offset-4 hover:underline transition-colors'
                  >
                    Sign In
                  </Link>
                </p>
                <div className='max-w-[340px] text-xs leading-normal text-muted-foreground'>
                  By creating an account, you agree to our{' '}
                  <a href='/terms' className='underline underline-offset-4 hover:text-primary transition-colors'>
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href='/privacy' className='underline underline-offset-4 hover:text-primary transition-colors'>
                    Privacy Policy
                  </a>.
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
