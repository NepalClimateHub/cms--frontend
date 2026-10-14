import React, { useRef, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/ui/shadcn/dialog'
import { Button } from '@/ui/shadcn/button'
import { QRCodeSVG } from '@/ui/molecules/qr-code'
import { Printer, Download, ExternalLink, Loader2 } from 'lucide-react'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

export interface CertificatePreviewData {
  certificateNumber: string
  verificationCode?: string
  name: string
  role: string
  teamName?: string | null
  certificateType: string
  dateJoined: string
  dateEnded?: string | null
  issuedAt?: string
  organization?: string
}

interface CertificatePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  data: CertificatePreviewData | null
}

export const CertificatePreviewDialog: React.FC<CertificatePreviewDialogProps> = ({
  open,
  onOpenChange,
  data,
}) => {
  const printRef = useRef<HTMLDivElement>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  if (!data) return null

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return 'Present'
    try {
      const d = new Date(dateStr)
      if (isNaN(d.getTime())) return dateStr
      return d.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

  const verificationBaseUrl =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'https://nepalclimatehub.org'
      : window.location.origin

  const verificationUrl = data.verificationCode
    ? `${verificationBaseUrl}/verify?code=${encodeURIComponent(data.verificationCode)}`
    : `${verificationBaseUrl}/verify`

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadPdf = async () => {
    if (!printRef.current) return
    try {
      setIsGeneratingPdf(true)
      const element = printRef.current
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      })
      const pdfWidth = 297
      const pdfHeight = 210
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`${data.certificateNumber || 'certificate'}.pdf`)
    } catch (err) {
      console.error('Failed to generate PDF', err)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const getCertificateTitle = (type: string) => {
    const upper = type.toUpperCase()
    if (upper === 'VOLUNTEER') return 'Certificate of Volunteering'
    if (upper === 'INTERNSHIP') return 'Certificate of Internship'
    if (upper === 'TRAINING') return 'Certificate of Training'
    if (upper === 'WORKSHOP') return 'Certificate of Participation'
    if (upper === 'SERVICE') return 'Certificate of Service'
    return `Certificate of ${type}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-4xl p-0 overflow-hidden bg-slate-900 border-slate-800 text-slate-100 print:border-none print:shadow-none print:max-w-none print:w-full print:h-full print:p-0'>
        {/* Actions Bar (hidden during print) */}
        <DialogHeader className='p-4 bg-slate-800/80 border-b border-slate-700 flex flex-row items-center justify-between print:hidden'>
          <DialogTitle className='text-base font-semibold text-slate-200'>
            Certificate Preview & Print
          </DialogTitle>
          <div className='flex items-center gap-2'>
            <Button
              size='sm'
              variant='outline'
              onClick={() => window.open(verificationUrl, '_blank')}
              className='text-xs gap-1.5 border-slate-700 hover:bg-slate-700 text-slate-300'
            >
              <ExternalLink className='h-3.5 w-3.5' />
              Verify Link
            </Button>
            <Button
              size='sm'
              variant='outline'
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className='text-xs gap-1.5 border-emerald-600/80 text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300'
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className='h-3.5 w-3.5 animate-spin' />
                  Generating PDF...
                </>
              ) : (
                <>
                  <Download className='h-3.5 w-3.5' />
                  Download PDF
                </>
              )}
            </Button>
            <Button
              size='sm'
              onClick={handlePrint}
              className='bg-emerald-600 hover:bg-emerald-700 text-white text-xs gap-1.5 shadow-sm'
            >
              <Printer className='h-3.5 w-3.5' />
              Print / Save PDF
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable container for preview */}
        <div className='p-4 sm:p-6 overflow-auto max-h-[82vh] flex justify-center bg-slate-950/80 print:p-0 print:m-0 print:max-h-none print:bg-white'>
          {/* Official Printable Certificate (A4 Landscape aspect ratio ~ 1.414) */}
          <div
            ref={printRef}
            id='printable-certificate'
            className='relative w-full max-w-[850px] aspect-[1.414/1] bg-white text-slate-900 shadow-2xl rounded-sm p-8 sm:p-12 flex flex-col justify-between border-[12px] border-slate-900 print:shadow-none print:m-0 print:w-[100vw] print:h-[100vh] print:max-w-none print:border-[10px] print:border-slate-900 print:rounded-none'
          >
            {/* Inner Border */}
            <div className='absolute inset-2 sm:inset-3 border-2 border-slate-300 pointer-events-none' />
            <div className='absolute inset-3 sm:inset-4 border border-slate-200 pointer-events-none' />

            {/* Corner Ornaments */}
            <div className='absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-slate-400 pointer-events-none' />
            <div className='absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-slate-400 pointer-events-none' />
            <div className='absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-slate-400 pointer-events-none' />
            <div className='absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-slate-400 pointer-events-none' />

            {/* Certificate Header */}
            <div className='text-center relative z-10 pt-2'>
              <div className='flex items-center justify-center gap-3 mb-2'>
                <img
                  src='/images/logo.png'
                  alt='Nepal Climate Hub'
                  className='h-12 sm:h-14 w-auto object-contain'
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </div>

              <div className='text-xs sm:text-sm font-semibold tracking-[0.25em] text-slate-900 uppercase'>
                Nepal Climate Hub
              </div>

              <h1 className='text-2xl sm:text-4xl font-serif font-bold text-slate-900 mt-2 tracking-tight uppercase'>
                {getCertificateTitle(data.certificateType)}
              </h1>
              <div className='w-24 h-0.5 bg-slate-900 mx-auto mt-2' />
            </div>

            {/* Certificate Body */}
            <div className='text-center my-auto py-2 sm:py-4 relative z-10 space-y-2 sm:space-y-3'>
              <p className='text-xs sm:text-sm font-serif italic text-slate-700'>
                This certificate is proudly presented to
              </p>

              <div className='text-2xl sm:text-4xl font-serif font-extrabold text-slate-950 uppercase tracking-wide border-b border-slate-300 pb-1 max-w-lg mx-auto'>
                {data.name}
              </div>

              <p className='text-xs sm:text-sm text-slate-700 max-w-md mx-auto leading-relaxed'>
                for serving as{' '}
                <span className='font-semibold text-slate-900'>{data.role}</span>
                {data.teamName && (
                  <>
                    {' '}in the{' '}
                    <span className='font-semibold text-slate-900'>{data.teamName}</span>
                  </>
                )}{' '}
                with <span className='font-semibold text-slate-900'>Nepal Climate Hub</span>
              </p>

              <div className='flex items-center justify-center gap-5 text-xs sm:text-sm text-slate-600 pt-1'>
                <div>
                  <span className='font-semibold text-slate-800'>Joined:</span>{' '}
                  {formatDate(data.dateJoined)}
                </div>
                <span>•</span>
                <div>
                  <span className='font-semibold text-slate-800'>Completed:</span>{' '}
                  {formatDate(data.dateEnded)}
                </div>
                {data.issuedAt && (
                  <>
                    <span>•</span>
                    <div>
                      <span className='font-semibold text-slate-800'>Issued:</span>{' '}
                      {formatDate(data.issuedAt)}
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Certificate Footer with QR Code, Verification Info, & Signatures */}
            <div className='relative z-10 pt-2 border-t border-slate-200/80 flex items-end justify-between gap-4'>
              {/* Left: QR Code & Verification Info */}
              <div className='flex items-center gap-3'>
                <div className='p-1.5 bg-white border border-slate-300 rounded shadow-sm'>
                  <QRCodeSVG
                    value={verificationUrl}
                    size={88}
                    includeMargin={false}
                    className='w-16 h-16 sm:w-18 sm:h-18'
                  />
                </div>
                <div className='text-left space-y-0.5 text-[10px] sm:text-xs text-slate-600'>
                  <div>
                    <span className='font-semibold text-slate-700'>Cert No:</span>{' '}
                    <span className='font-mono font-medium text-slate-900'>
                      {data.certificateNumber}
                    </span>
                  </div>
                  {data.verificationCode && (
                    <div>
                      <span className='font-semibold text-slate-700'>Code:</span>{' '}
                      <span className='font-mono font-bold text-emerald-900'>
                        {data.verificationCode}
                      </span>
                    </div>
                  )}
                  <div className='text-slate-600'>
                    Verify at: <span className='font-medium text-slate-900'>nepalclimatehub.org/verify</span>
                  </div>
                </div>
              </div>

              {/* Center: Official Seal Embellishment */}
              <div className='hidden sm:flex flex-col items-center justify-center'>
                <div className='w-14 h-14 rounded-full border-2 border-slate-700 bg-slate-100 flex items-center justify-center text-slate-900 text-[9px] font-serif font-bold text-center leading-tight shadow-inner'>
                  OFFICIAL
                  <br />
                  NCH SEAL
                </div>
              </div>

              {/* Right: Signature Block */}
              <div className='text-right'>
                <div className='w-36 sm:w-44 border-b border-slate-800 mb-1 mx-auto' />
                <div className='text-xs sm:text-sm font-semibold text-slate-900'>
                  Executive Director
                </div>
                <div className='text-[10px] sm:text-xs text-slate-500'>
                  Nepal Climate Hub
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Print Stylesheet for Seamless A4 Landscape Printing */}
        <style dangerouslySetInnerHTML={{
          __html: `
            @media print {
              body * {
                visibility: hidden;
              }
              #printable-certificate, #printable-certificate * {
                visibility: visible;
              }
              #printable-certificate {
                position: fixed;
                left: 0;
                top: 0;
                width: 100vw !important;
                height: 100vh !important;
                max-width: none !important;
                border-width: 12px !important;
                margin: 0 !important;
                padding: 40px !important;
                box-shadow: none !important;
                -webkit-print-color-adjust: exact !important;
                print-color-adjust: exact !important;
              }
              @page {
                size: A4 landscape;
                margin: 0;
              }
            }
          `,
        }} />
      </DialogContent>
    </Dialog>
  )
}
