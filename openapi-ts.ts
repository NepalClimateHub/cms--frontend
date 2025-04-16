import { createClient } from '@hey-api/openapi-ts'

createClient({
  input: 'https://get.heyapi.dev/hey-api/backend',
  output: 'src/api',
  plugins: ['@hey-api/client-fetch', '@tanstack/react-query'],
})
