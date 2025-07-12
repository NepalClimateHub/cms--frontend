import { useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { orgSchema, indSchema } from '@/schemas/auth/signup'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
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
    <Card className='mx-auto mt-10 w-full max-w-2xl p-6'>
      <div className='mb-2 flex flex-col space-y-2 text-left'>
        <h1 className='text-lg font-semibold tracking-tight'>
          Create an account
        </h1>
        <p className='text-sm text-muted-foreground'>
          Enter your email and password to create an account. <br />
          Already have an account?{' '}
          <Link
            to='/sign-in'
            className='underline underline-offset-4 hover:text-primary'
          >
            Sign In
          </Link>
        </p>
      </div>
      {showSuccess ? (
        <div className='py-8 text-center'>
          <h2 className='mb-2 text-xl font-semibold text-green-700'>
            Thanks for registering!
          </h2>
          <p className='mb-4 text-gray-600'>
            We've sent a verification link to your email address. Please verify
            to continue.
          </p>
        </div>
      ) : (
        <div className={cn('grid gap-6')}>
          {/* Tabs */}
          <div className='mb-6 flex w-full justify-center gap-2'>
            <Button
              type='button'
              variant={tab === 'organization' ? 'default' : 'outline'}
              className='w-40'
              onClick={() => setTab('organization')}
            >
              Organization
            </Button>
            <Button
              type='button'
              variant={tab === 'individual' ? 'default' : 'outline'}
              className='w-40'
              onClick={() => setTab('individual')}
            >
              Individual
            </Button>
          </div>

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
                        <Input {...field} />
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
                        <Input type='email' {...field} />
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
                        <select
                          className='w-full rounded-md border border-gray-300 bg-white p-2'
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            orgForm.setValue('orgType', e.target.value)
                          }}
                        >
                          <option value=''>Select type</option>
                          {organizationTypes.map((type) => (
                            <option key={type} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
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
                        <select
                          className='w-full rounded-md border border-gray-300 bg-white p-2'
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            orgForm.setValue('district', '')
                          }}
                        >
                          <option value=''>Select province</option>
                          {provinces.map((prov) => (
                            <option key={prov} value={prov}>
                              {prov}
                            </option>
                          ))}
                        </select>
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
                        <select
                          className='w-full rounded-md border border-gray-300 bg-white p-2'
                          {...field}
                          disabled={!orgForm.watch('province')}
                        >
                          <option value=''>Select district</option>
                          {(
                            districtsByProvince[orgForm.watch('province')] || []
                          ).map((d) => (
                            <option key={d} value={d}>
                              {d}
                            </option>
                          ))}
                        </select>
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
                        <Input {...field} />
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
                        <PasswordInput {...field} />
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
                        <PasswordInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className='mt-2 w-full' type='submit'>
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
                        <Input {...field} />
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
                        <Input type='email' {...field} />
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
                        <PasswordInput {...field} />
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
                        <PasswordInput {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button className='mt-2 w-full' type='submit'>
                  Register
                </Button>
              </form>
            </Form>
          )}
        </div>
      )}
      <p className='mt-4 px-8 text-center text-sm text-muted-foreground'>
        By creating an account, you agree to our{' '}
        <a
          href='/terms'
          className='underline underline-offset-4 hover:text-primary'
        >
          Terms of Service
        </a>{' '}
        and{' '}
        <a
          href='/privacy'
          className='underline underline-offset-4 hover:text-primary'
        >
          Privacy Policy
        </a>
        .
      </p>
    </Card>
  )
}
