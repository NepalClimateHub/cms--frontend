import { useState } from 'react'
import { Main } from '@/ui/layouts/main'
import { Button } from '@/ui/shadcn/button'
import { Database, Download, Loader2 } from 'lucide-react'
import PageHeader from '@/ui/page-header'
import { getAccessToken } from '@/stores/authStore'
import { toast } from '@/hooks/use-toast'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card'

export default function DatabaseExport() {
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    const accessToken = getAccessToken()
    const apiUrl = import.meta.env.VITE_API_URL

    try {
      const response = await fetch(`${apiUrl}/api/v1/database/export`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        throw new Error('Failed to export database')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      
      // Get filename from header if possible, or use default
      const contentDisposition = response.headers.get('Content-Disposition')
      let fileName = 'database_backup.zip'
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/)
        if (match && match[1]) fileName = match[1]
      }
      
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: 'Success',
        description: 'Database backup downloaded successfully.',
      })
    } catch {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to export database. Please try again.',
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Main>
      <PageHeader
        title='Database Export'
        description='Manage your database backups'
      />
      
      <div className='mt-6 max-w-2xl'>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Full Database Backup
            </CardTitle>
            <CardDescription>
              This will generate a full PostgreSQL dump of the current database, compress it into a ZIP file, and download it to your computer.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md mb-6 text-sm">
              <p className="font-medium mb-2">Important Notes:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>The backup includes all tables, data, and schema.</li>
                <li>Large databases may take a moment to compress.</li>
                <li>The downloaded file will be in .zip format containing a .sql file.</li>
              </ul>
            </div>
            
            <Button 
              onClick={handleExport} 
              disabled={isExporting}
              className="w-full sm:w-auto"
            >
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Backup...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download Database Backup
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </Main>
  )
}
