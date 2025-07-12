import { HTMLAttributes, useState } from 'react'
import { z } from 'zod'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
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

const orgSchema = z
  .object({
    orgName: z.string().min(1, 'Organization Name is required'),
    orgEmail: z.string().email('Invalid email'),
    orgType: z.string().min(1, 'Organization Type is required'),
    orgTypeOther: z.string().optional(),
    province: z.string().min(1, 'Province is required'),
    district: z.string().min(1, 'District is required'),
    adminName: z.string().min(1, 'Admin Full Name is required'),
    password: z.string().min(7, 'Password must be at least 7 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

const indSchema = z
  .object({
    fullName: z.string().min(1, 'Full Name is required'),
    email: z.string().email('Invalid email'),
    password: z.string().min(7, 'Password must be at least 7 characters'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ['confirmPassword'],
  })

type OrgForm = z.infer<typeof orgSchema>
type IndForm = z.infer<typeof indSchema>

type SignUpFormProps = HTMLAttributes<HTMLDivElement>

type TabType = 'organization' | 'individual'

export function SignUpForm({ className, ...props }: SignUpFormProps) {
  const [tab, setTab] = useState<TabType>('organization')
  const [province, setProvince] = useState('')
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

  function handleOrgSubmit(data: OrgForm) {
    setShowSuccess(true)
  }
  function handleIndSubmit(data: IndForm) {
    setShowSuccess(true)
  }

  if (showSuccess) {
    return (
      <div className='py-8 text-center'>
        <h2 className='mb-2 text-xl font-semibold text-green-700'>
          Thanks for registering!
        </h2>
        <p className='mb-4 text-gray-600'>
          We've sent a verification link to your email address. Please verify to
          continue.
        </p>
      </div>
    )
  }

  return (
    <div className={cn('grid gap-6', className)} {...props}>
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
                        setProvince(e.target.value)
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
  )
}
