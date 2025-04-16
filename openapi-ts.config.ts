import {  defineConfig } from '@hey-api/openapi-ts'

export default defineConfig({
  input: 'http://localhost:8080/swagger.json',
  
  output: 'src/api',
  plugins: ['@hey-api/client-fetch', '@tanstack/react-query'],
})
