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

// ── NCH Logo SVG (exact Figma vector export) ──────────────────────────────────
const NchLogoSvg: React.FC<{ className?: string; style?: React.CSSProperties }> = ({
  className,
  style,
}) => (
  <svg
    width="162"
    height="78"
    viewBox="0 0 162 78"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={style}
  >
    <circle cx="39" cy="39" r="39" fill="#121212" />
    <path
      d="M28.9183 37.9946L37.1179 44.4068L55.2821 23.7625L66.632 36.5647C64.5318 23.6061 53.2937 13.7085 39.7319 13.7085C24.6732 13.7085 12.4744 25.9074 12.4744 40.9661C12.4744 44.943 13.3234 48.7412 14.865 52.1372L28.9183 37.9946Z"
      fill="white"
    />
    <path
      d="M56.4215 28.2298L38.2572 48.8741L30.0576 42.4395L8.40796 64.2902L30.0799 49.6784L40.8042 56.2917L56.4215 28.2298Z"
      fill="#CCDC29"
    />
    <path
      d="M107.987 14.5383H106.606V25.2524L105.127 25.2724L98.2416 17.017H98.1627V22.9737H99.9382V25.2524H94.3157V22.9737H95.6966V14.5383H94.0986V12.2596H97.5906L104.061 19.9753H104.14V14.5383H102.286V12.2596H107.987V14.5383Z"
      fill="#121212"
    />
    <path
      d="M117.149 22.414C117.083 23.2136 116.695 23.9198 115.985 24.5328C115.275 25.1458 114.282 25.4523 113.006 25.4523C111.677 25.4523 110.579 25.0725 109.711 24.313C108.856 23.5534 108.429 22.4207 108.429 20.9148C108.429 19.5289 108.817 18.3762 109.593 17.4567C110.382 16.5239 111.48 16.0575 112.887 16.0575C114.124 16.0575 115.123 16.4173 115.886 17.1369C116.662 17.8565 117.057 18.8027 117.07 19.9753C117.07 20.4151 117.024 20.8482 116.932 21.2746H111.092C111.237 22.7005 111.934 23.4135 113.183 23.4135C113.867 23.4135 114.328 23.2469 114.564 22.9137C114.814 22.5806 114.966 22.2807 115.018 22.0142L117.149 22.414ZM114.446 19.7755C114.499 19.3224 114.4 18.8959 114.15 18.4962C113.913 18.0964 113.492 17.8965 112.887 17.8965C112.361 17.8965 111.954 18.0697 111.664 18.4162C111.375 18.7627 111.191 19.2158 111.112 19.7755H114.446Z"
      fill="#121212"
    />
    <path
      d="M128.382 20.535C128.382 21.8676 128.034 23.0203 127.336 23.9931C126.653 24.9659 125.64 25.4523 124.298 25.4523C123.049 25.4523 122.141 25.0059 121.576 24.1131V27.5112H123.154V29.5101H117.847V27.5112H119.031V18.1763H117.748V16.2374H121.576V17.9565C121.813 17.4367 122.168 16.9903 122.641 16.6172C123.115 16.2441 123.759 16.0575 124.575 16.0575C125.706 16.0575 126.62 16.4506 127.317 17.2369C128.027 18.0231 128.382 19.1225 128.382 20.535ZM125.738 20.7949C125.738 19.9154 125.541 19.2491 125.147 18.796C124.765 18.3296 124.272 18.0964 123.667 18.0964C123.009 18.0964 122.503 18.3429 122.148 18.836C121.806 19.329 121.622 19.9554 121.596 20.7149L121.576 21.0348C121.576 21.7677 121.767 22.3474 122.148 22.7738C122.529 23.2002 123.036 23.4135 123.667 23.4135C124.272 23.4135 124.765 23.2002 125.147 22.7738C125.541 22.3474 125.738 21.6877 125.738 20.7949Z"
      fill="#121212"
    />
    <path
      d="M130.163 16.8771C130.939 16.5572 131.584 16.344 132.097 16.2374C132.623 16.1175 133.248 16.0575 133.971 16.0575C134.931 16.0575 135.76 16.3107 136.457 16.8171C137.154 17.3235 137.502 18.0897 137.502 19.1158V23.0337C137.502 23.5001 137.706 23.7333 138.114 23.7333C138.232 23.7333 138.357 23.7133 138.489 23.6733L138.508 25.0326C137.996 25.3124 137.463 25.4523 136.91 25.4523C135.74 25.4523 135.089 24.8593 134.957 23.6733V23.6533C134.707 24.1064 134.346 24.5195 133.872 24.8926C133.412 25.2658 132.82 25.4523 132.097 25.4523C131.452 25.4523 130.834 25.2591 130.242 24.8727C129.65 24.4862 129.354 23.8199 129.354 22.8738C129.354 21.7677 129.789 21.0348 130.657 20.675C131.538 20.3152 132.485 20.1353 133.497 20.1353C134.063 20.1353 134.55 20.1619 134.957 20.2152V19.9154C134.957 19.449 134.892 18.9959 134.76 18.5561C134.642 18.1164 134.221 17.8965 133.497 17.8965C133.234 17.8965 132.991 17.9165 132.767 17.9565C132.557 17.9831 132.347 18.0497 132.136 18.1564L131.801 19.4356L129.769 19.2158L130.163 16.8771ZM134.957 21.5745V21.4545C134.747 21.4279 134.53 21.4012 134.306 21.3746C134.096 21.3479 133.885 21.3346 133.675 21.3346C133.228 21.3346 132.833 21.4212 132.491 21.5945C132.149 21.7544 131.978 22.0809 131.978 22.5739C131.978 22.8671 132.057 23.1136 132.215 23.3135C132.373 23.5134 132.643 23.6133 133.024 23.6133C133.471 23.6133 133.885 23.4534 134.267 23.1336C134.661 22.8005 134.892 22.2807 134.957 21.5745Z"
      fill="#121212"
    />
    <path
      d="M144.069 25.2524H139.157V23.3135H140.34V13.4589H139.058V11.5H142.885V23.3135H144.069V25.2524Z"
      fill="#121212"
    />
    <path
      d="M105.245 44.397C104.824 44.8635 104.147 45.2432 103.213 45.5364C102.292 45.8296 101.372 45.9762 100.451 45.9762C98.623 45.9762 97.0908 45.3832 95.8545 44.1972C94.6182 42.9978 94 41.432 94 39.4997C94 38.487 94.2104 37.4475 94.6313 36.3815C95.0522 35.3154 95.7427 34.4159 96.7028 33.6829C97.6629 32.95 98.9518 32.5835 100.57 32.5835C101.661 32.5835 102.602 32.7501 103.391 33.0833C104.18 33.4031 104.778 33.7562 105.186 34.1427L105.502 37.161L103.351 37.3609L103.075 35.6419C102.733 35.4153 102.319 35.2421 101.832 35.1222C101.346 35.0022 100.885 34.9422 100.451 34.9422C99.3464 34.9422 98.4652 35.3154 97.8076 36.0616C97.1631 36.8079 96.8409 37.894 96.8409 39.3198C96.8409 40.8257 97.196 41.9184 97.9062 42.598C98.6164 43.2777 99.5239 43.6175 100.629 43.6175C101.668 43.6175 102.483 43.4376 103.075 43.0778L103.351 41.1388L105.502 41.3387L105.245 44.397Z"
      fill="#121212"
    />
    <path
      d="M111.49 45.7763H106.578V43.8374H107.762V33.9828H106.479V32.0239H110.307V43.8374H111.49V45.7763Z"
      fill="#121212"
    />
    <path
      d="M113.565 35.1621V32.4836H116.11V35.1621H113.565ZM117.392 45.7763H112.48V43.8374H113.663V38.7202H112.381V36.7612H116.208V43.8374H117.392V45.7763Z"
      fill="#121212"
    />
    <path
      d="M134.789 45.7763H131.061V40.6991C131.061 39.9262 130.929 39.3731 130.666 39.04C130.416 38.7068 130.041 38.5403 129.541 38.5403C128.936 38.5403 128.496 38.7402 128.22 39.1399C127.957 39.5397 127.825 40.0528 127.825 40.6791V43.8374H129.009V45.7763H125.28V40.6991C125.28 39.9262 125.149 39.3731 124.886 39.04C124.636 38.7068 124.261 38.5403 123.761 38.5403C123.143 38.5403 122.702 38.7402 122.439 39.1399C122.176 39.5397 122.045 40.0528 122.045 40.6791V43.8374H123.741V45.7763H118.316V43.8374H119.5V38.7202H118.336V36.7612H122.045V38.1205C122.61 37.0944 123.511 36.5813 124.747 36.5813C125.392 36.5813 125.984 36.7413 126.523 37.0611C127.062 37.3809 127.437 37.8673 127.648 38.5203C128.174 37.2277 129.14 36.5813 130.548 36.5813C131.35 36.5813 132.06 36.8345 132.678 37.3409C133.296 37.8473 133.605 38.6336 133.605 39.6996V43.8374H134.789V45.7763Z"
      fill="#121212"
    />
    <path
      d="M136.367 37.4009C137.143 37.0811 137.787 36.8679 138.3 36.7612C138.826 36.6413 139.451 36.5813 140.175 36.5813C141.135 36.5813 141.963 36.8345 142.66 37.3409C143.357 37.8473 143.706 38.6136 143.706 39.6397V43.5575C143.706 44.0239 143.91 44.2571 144.318 44.2571C144.436 44.2571 144.561 44.2371 144.692 44.1972L144.712 45.5564C144.199 45.8363 143.666 45.9762 143.114 45.9762C141.944 45.9762 141.293 45.3832 141.161 44.1972V44.1772C140.911 44.6302 140.549 45.0434 140.076 45.4165C139.616 45.7896 139.024 45.9762 138.3 45.9762C137.656 45.9762 137.038 45.7829 136.446 45.3965C135.854 45.01 135.558 44.3437 135.558 43.3976C135.558 42.2915 135.992 41.5586 136.86 41.1988C137.741 40.839 138.688 40.6591 139.701 40.6591C140.267 40.6591 140.753 40.6858 141.161 40.7391V40.4392C141.161 39.9728 141.095 39.5197 140.964 39.08C140.845 38.6402 140.424 38.4203 139.701 38.4203C139.438 38.4203 139.195 38.4403 138.971 38.4803C138.761 38.507 138.55 38.5736 138.34 38.6802L138.004 39.9595L135.972 39.7396L136.367 37.4009ZM141.161 42.0983V41.9784C140.951 41.9517 140.734 41.9251 140.51 41.8984C140.3 41.8718 140.089 41.8584 139.879 41.8584C139.431 41.8584 139.037 41.9451 138.695 42.1183C138.353 42.2782 138.182 42.6047 138.182 43.0978C138.182 43.3909 138.261 43.6375 138.419 43.8374C138.577 44.0372 138.846 44.1372 139.228 44.1372C139.675 44.1372 140.089 43.9773 140.47 43.6575C140.865 43.3243 141.095 42.8046 141.161 42.0983Z"
      fill="#121212"
    />
    <path
      d="M153.015 42.9778C152.883 44.0173 152.528 44.7768 151.95 45.2566C151.371 45.7363 150.621 45.9762 149.701 45.9762C148.714 45.9762 147.912 45.7296 147.294 45.2366C146.689 44.7302 146.386 44.0106 146.386 43.0778V38.6002H145.124V36.7612H146.386V34.0228H148.931V36.7612H152.127V38.6002H148.931V42.638C148.931 43.4242 149.286 43.8174 149.997 43.8174C150.154 43.8174 150.365 43.7507 150.628 43.6175C150.904 43.4709 151.082 43.0644 151.16 42.3981L153.015 42.9778Z"
      fill="#121212"
    />
    <path
      d="M162 42.9378C161.934 43.7374 161.546 44.4437 160.836 45.0567C160.126 45.6697 159.133 45.9762 157.857 45.9762C156.529 45.9762 155.43 45.5964 154.562 44.8368C153.708 44.0772 153.28 42.9445 153.28 41.4387C153.28 40.0528 153.668 38.9001 154.444 37.9806C155.233 37.0478 156.331 36.5813 157.739 36.5813C158.975 36.5813 159.975 36.9411 160.737 37.6608C161.513 38.3804 161.908 39.3265 161.921 40.4992C161.921 40.9389 161.875 41.372 161.783 41.7985H155.943C156.088 43.2244 156.785 43.9373 158.035 43.9373C158.719 43.9373 159.179 43.7707 159.416 43.4376C159.665 43.1044 159.817 42.8046 159.869 42.5381L162 42.9378ZM159.297 40.2993C159.35 39.8462 159.251 39.4198 159.001 39.02C158.765 38.6202 158.344 38.4203 157.739 38.4203C157.213 38.4203 156.805 38.5936 156.516 38.94C156.226 39.2865 156.042 39.7396 155.963 40.2993H159.297Z"
      fill="#121212"
    />
    <path
      d="M107.77 66.3001H102.365V64.0214H103.746V60.8431H98.3205V64.0214H99.7015V66.3001H94.2959V64.0214H95.6769V55.586H94.2959V53.3073H99.7015V55.586H98.3205V58.5844H103.746V55.586H102.365V53.3073H107.77V55.586H106.389V64.0214H107.77V66.3001Z"
      fill="#121212"
    />
    <path
      d="M119.434 66.3001H115.606V64.9209C115.014 65.9603 114.061 66.48 112.746 66.48C111.904 66.48 111.174 66.2268 110.556 65.7204C109.938 65.2141 109.629 64.4278 109.629 63.3617V59.224H108.445V57.2851H112.174V62.3623C112.174 63.1485 112.298 63.7082 112.548 64.0414C112.811 64.3612 113.193 64.5211 113.693 64.5211C114.298 64.5211 114.765 64.3212 115.093 63.9214C115.435 63.5217 115.606 63.0086 115.606 62.3823V59.224H114.166V57.2851H118.151V64.3612H119.434V66.3001Z"
      fill="#121212"
    />
    <path
      d="M130.165 61.5827C130.165 62.9153 129.816 64.068 129.119 65.0408C128.436 66.0136 127.423 66.5 126.081 66.5C124.727 66.5 123.773 65.9803 123.221 64.9409C123.194 65.1674 123.161 65.394 123.122 65.6205C123.096 65.847 123.063 66.0736 123.023 66.3001H120.478C120.57 65.8337 120.649 65.3673 120.715 64.9009C120.781 64.4345 120.814 63.9747 120.814 63.5217V54.5066H119.63V52.5477H123.359V59.0041C123.595 58.4844 123.951 58.038 124.424 57.6649C124.911 57.2918 125.555 57.1052 126.357 57.1052C127.475 57.1052 128.389 57.4983 129.1 58.2845C129.81 59.0708 130.165 60.1702 130.165 61.5827ZM127.521 61.8026C127.521 60.9364 127.337 60.2768 126.969 59.8237C126.601 59.3706 126.114 59.1441 125.509 59.1441C124.825 59.1441 124.293 59.3973 123.911 59.9036C123.543 60.41 123.359 60.9964 123.359 61.6627V61.8826C123.359 62.6155 123.536 63.2351 123.891 63.7415C124.26 64.2346 124.779 64.4811 125.45 64.4811C126.029 64.4811 126.515 64.2679 126.91 63.8415C127.318 63.4017 127.521 62.7221 127.521 61.8026Z"
      fill="#121212"
    />
  </svg>
)

// ── Signature component ("Bibek Pant" in cursive handwriting) ────────────────
const SignatureText: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      left: 72,
      top: 575,
      width: 164,
      height: 40,
      fontFamily: "'Dancing Script', 'Caveat', 'Brush Script MT', cursive",
      fontSize: 32,
      fontWeight: 600,
      lineHeight: '40px',
      color: '#1A1B1E',
      userSelect: 'none',
      whiteSpace: 'nowrap',
      zIndex: 10,
    }}
  >
    Bibek Pant
  </div>
)

function getCertificateTitle(type?: string): string {
  if (!type) return 'CERTIFICATE OF APPRECIATION'
  const upper = type.toUpperCase()
  if (upper === 'VOLUNTEER' || upper === 'APPRECIATION') return 'CERTIFICATE OF APPRECIATION'
  if (upper === 'INTERNSHIP') return 'CERTIFICATE OF INTERNSHIP'
  if (upper === 'TRAINING') return 'CERTIFICATE OF TRAINING'
  if (upper === 'WORKSHOP' || upper === 'PARTICIPATION') return 'CERTIFICATE OF PARTICIPATION'
  if (upper === 'SERVICE') return 'CERTIFICATE OF SERVICE'
  if (upper === 'EMPLOYMENT') return 'CERTIFICATE OF EMPLOYMENT'
  return `CERTIFICATE OF ${upper}`
}

function formatCertificateTypeLabel(type?: string): string {
  if (!type) return 'Volunteer'
  const upper = type.toUpperCase()
  if (upper === 'VOLUNTEER') return 'Volunteer'
  if (upper === 'INTERNSHIP') return 'Intern'
  if (upper === 'TRAINING') return 'Trainee'
  if (upper === 'PARTICIPATION') return 'Participant'
  if (upper === 'SERVICE') return 'Service'
  return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase()
}

function formatDateStr(dateStr?: string | null): string {
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

function formatIssueDate(dateStr?: string | null): string {
  if (!dateStr) return '[DD Month YYYY]'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const day = d.getDate()
    const month = d.toLocaleDateString('en-US', { month: 'long' })
    const year = d.getFullYear()
    return `${String(day).padStart(2, '0')} ${month} ${year}`
  } catch {
    return dateStr
  }
}

export const CertificatePreviewDialog: React.FC<CertificatePreviewDialogProps> = ({
  open,
  onOpenChange,
  data,
}) => {
  const printRef = useRef<HTMLDivElement>(null)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)

  if (!data) return null

  const verificationBaseUrl =
    window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      ? 'https://nepalclimatehub.org'
      : window.location.origin

  // Verification code to display under "Code: " and encode in QR
  // Strictly display verification code; never fall back to certificateNumber
  const displayCode =
    data.verificationCode?.trim() ||
    'NCH-[YYYY]-[XXXX]'

  const verificationUrl = `${verificationBaseUrl}/verify?code=${encodeURIComponent(
    displayCode,
  )}`

  // Local/direct link for testing verification in the active environment
  const localVerifyUrl = `/verify?code=${encodeURIComponent(displayCode)}`

  const handlePrint = () => window.print()

  const handleDownloadPdf = async () => {
    if (!printRef.current) return
    try {
      setIsGeneratingPdf(true)
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const el = clonedDoc.getElementById('printable-certificate')
          if (el) {
            el.style.transform = 'none'
            el.style.position = 'static'
            el.style.width = '1220px'
            el.style.height = '737px'
          }
        },
      })
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      // A4 Landscape: 297mm x 210mm. Certificate aspect ratio 1220/737 = 1.655359.
      const pdfWidth = 285
      const pdfHeight = pdfWidth / (1220 / 737) // ~ 172.17 mm
      const xOffset = (297 - pdfWidth) / 2
      const yOffset = (210 - pdfHeight) / 2
      pdf.addImage(imgData, 'PNG', xOffset, yOffset, pdfWidth, pdfHeight)
      pdf.save(`${data.certificateNumber || 'certificate'}.pdf`)
    } catch (err) {
      console.error('Failed to generate PDF', err)
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  const certTitle = getCertificateTitle(data.certificateType)
  const rawName = data.name ? data.name.replace(/[\[\]]/g, '').trim() : ''
  const displayName = rawName || 'Sajan Thapa'
  const role = data.role || 'Software Engineer'
  const certType = formatCertificateTypeLabel(data.certificateType)
  const teamPart = data.teamName ? ` in the ${data.teamName} Team` : ''
  const startDate = data.dateJoined ? formatDateStr(data.dateJoined) : 'January 1, 2024'
  const endDate = data.dateEnded ? formatDateStr(data.dateEnded) : 'December 2, 2026'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl p-0 overflow-hidden bg-slate-900 border-slate-800 text-slate-100 print:border-none print:shadow-none print:max-w-none print:w-full print:h-full print:p-0">
        {/* Actions header */}
        <DialogHeader className="p-3 bg-slate-900 border-b border-slate-800 flex flex-row items-center justify-between print:hidden">
          <DialogTitle className="text-sm font-semibold text-white">
            Certificate Preview &amp; Print
          </DialogTitle>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => window.open(localVerifyUrl, '_blank')}
              className="bg-[#CEFE00] hover:bg-[#b8e600] text-[#1A1B1E] text-xs gap-1.5 font-semibold shadow-sm border border-[#CEFE00] transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Verify Link
            </Button>
            <Button
              size="sm"
              onClick={handleDownloadPdf}
              disabled={isGeneratingPdf}
              className="bg-[#CEFE00] hover:bg-[#b8e600] text-[#1A1B1E] text-xs gap-1.5 font-semibold shadow-sm border border-[#CEFE00] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </>
              )}
            </Button>
            <Button
              size="sm"
              onClick={handlePrint}
              className="bg-[#CEFE00] hover:bg-[#b8e600] text-[#1A1B1E] text-xs gap-1.5 font-semibold shadow-sm border border-[#CEFE00] transition-colors"
            >
              <Printer className="h-3.5 w-3.5" />
              Print / Save PDF
            </Button>
          </div>
        </DialogHeader>

        {/* Scrollable preview viewport */}
        <div className="p-4 sm:p-6 overflow-auto max-h-[86vh] flex justify-center bg-slate-950/80 print:p-0 print:m-0 print:max-h-none print:bg-white">
          {/* Responsive scale wrapper */}
          <div
            style={{ width: '100%', maxWidth: 1100, aspectRatio: '1220/737' }}
            className="relative print:max-w-none print:w-[100vw] print:h-[100vh]"
          >
            {/*
             * Exact 1220px x 737px Figma Certificate Canvas
             */}
            <div
              ref={printRef}
              id="printable-certificate"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 1220,
                height: 737,
                background: '#FFFFFF',
                boxSizing: 'border-box',
                transformOrigin: 'top left',
                fontFamily: "'Roboto', sans-serif",
              }}
              className="nch-certificate-root overflow-hidden"
            >
              {/* Outer border (NCH-Black) */}
              <div
                style={{
                  boxSizing: 'border-box',
                  position: 'absolute',
                  width: 1172,
                  height: 687,
                  left: 24,
                  top: 25,
                  border: '10px solid #1A1B1E',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              />

              {/* Accent border (NCH-Primary-Color #CEFE00) */}
              <div
                style={{
                  boxSizing: 'border-box',
                  position: 'absolute',
                  width: 1142,
                  height: 657,
                  left: 'calc(50% - 1142px/2)',
                  top: 'calc(50% - 657px/2)',
                  border: '3px solid #CEFE00',
                  pointerEvents: 'none',
                  zIndex: 3,
                }}
              />

              {/* Central Watermark (Group 1000006434 - 353x353, opacity: 0.05) */}
              <svg
                width="353"
                height="353"
                viewBox="0 0 78 78"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                  position: 'absolute',
                  width: 353,
                  height: 353,
                  left: 422,
                  top: 262,
                  opacity: 0.05,
                  pointerEvents: 'none',
                  zIndex: 1,
                }}
              >
                <circle cx="39" cy="39" r="39" fill="#121212" />
                <path
                  d="M28.9183 37.9946L37.1179 44.4068L55.2821 23.7625L66.632 36.5647C64.5318 23.6061 53.2937 13.7085 39.7319 13.7085C24.6732 13.7085 12.4744 25.9074 12.4744 40.9661C12.4744 44.943 13.3234 48.7412 14.865 52.1372L28.9183 37.9946Z"
                  fill="white"
                />
                <path
                  d="M56.4215 28.2298L38.2572 48.8741L30.0576 42.4395L8.40796 64.2902L30.0799 49.6784L40.8042 56.2917L56.4215 28.2298Z"
                  fill="#CCDC29"
                />
              </svg>

              {/* Main logo (top-left: left: 63px, top: 64px, width: 162px, height: 78px) */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 0,
                  gap: 16,
                  position: 'absolute',
                  width: 162,
                  height: 78,
                  left: 63,
                  top: 64,
                  zIndex: 10,
                }}
              >
                <NchLogoSvg style={{ width: 162, height: 78 }} />
              </div>

              {/* Certificate details (top-right: left: 897px, top: 72px, width: 252px, height: 32px) */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  padding: 0,
                  gap: 4,
                  position: 'absolute',
                  width: 252,
                  height: 32,
                  left: 897,
                  top: 72,
                  zIndex: 10,
                }}
              >
                {/* Certificate number */}
                <div
                  style={{
                    width: 252,
                    height: 14,
                    fontFamily: "'Roboto', sans-serif",
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: 12,
                    lineHeight: '14px',
                    textAlign: 'right',
                    color: '#1A1B1E',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Certificate No.: {data.certificateNumber || 'NCH-[YYYY]-[XXXX]'}
                </div>

                {/* Issue date */}
                <div
                  style={{
                    width: 252,
                    height: 14,
                    fontFamily: "'Roboto', sans-serif",
                    fontStyle: 'normal',
                    fontWeight: 400,
                    fontSize: 12,
                    lineHeight: '14px',
                    textAlign: 'right',
                    color: '#1A1B1E',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Issued on: {formatIssueDate(data.issuedAt)}
                </div>
              </div>

              {/* Certificate title (left: calc(50% - 940px/2), top: 172px, width: 940px, height: 57px) */}
              <div
                style={{
                  position: 'absolute',
                  width: 940,
                  height: 57,
                  left: 'calc(50% - 940px/2)',
                  top: 172,
                  fontFamily: "'Roboto Slab', serif",
                  fontStyle: 'normal',
                  fontWeight: 800,
                  fontSize: 43,
                  lineHeight: '57px',
                  textAlign: 'center',
                  color: '#1A1B1E',
                  letterSpacing: '0.02em',
                  whiteSpace: 'nowrap',
                  zIndex: 10,
                }}
              >
                {certTitle}
              </div>

              {/* Appreciation message (left: calc(50% - 784px/2), top: 273px, width: 784px, height: 22px) */}
              <div
                style={{
                  position: 'absolute',
                  width: 784,
                  height: 22,
                  left: 'calc(50% - 784px/2)',
                  top: 273,
                  fontFamily: "'Roboto', sans-serif",
                  fontStyle: 'normal',
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: '135%',
                  textAlign: 'center',
                  color: '#1A1B1E',
                  zIndex: 10,
                }}
              >
                This certificate is proudly presented to
              </div>

              {/* Recipient name (left: calc(50% - 780px/2), top: 311px, width: 780px, height: 62px) */}
              <div
                style={{
                  position: 'absolute',
                  width: 780,
                  height: 62,
                  left: 'calc(50% - 780px/2)',
                  top: 311,
                  fontFamily: "'Zilla Slab', Georgia, serif",
                  fontStyle: 'italic',
                  fontWeight: 400,
                  fontSize: 52,
                  lineHeight: '120%',
                  textAlign: 'center',
                  color: '#535353',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  zIndex: 10,
                }}
              >
                {displayName}
              </div>

              {/* Recognition statement 1 (left: calc(50% - 790px/2), top: 389px, width: 790px, height: 22px) */}
              <div
                style={{
                  position: 'absolute',
                  width: 790,
                  height: 22,
                  left: 'calc(50% - 790px/2)',
                  top: 389,
                  fontFamily: "'Roboto', sans-serif",
                  fontStyle: 'normal',
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: '135%',
                  textAlign: 'center',
                  color: '#1A1B1E',
                  zIndex: 10,
                }}
              >
                In recognition of your commitment and contributions as a
              </div>

              {/* Recognition statement 2 (left: calc(50% - 790px/2), top: 411px, width: 790px, height: 48px) */}
              <div
                style={{
                  position: 'absolute',
                  width: 790,
                  height: 48,
                  left: 'calc(50% - 790px/2)',
                  top: 411,
                  fontFamily: "'Roboto', sans-serif",
                  fontStyle: 'normal',
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: '135%',
                  textAlign: 'center',
                  color: '#1A1B1E',
                  zIndex: 10,
                }}
              >
                <span style={{ fontWeight: 700 }}>{role}</span> ({certType}) at Nepal
                Climate Hub (legally registered as Climate Hub Nepal){teamPart}, from{' '}
                {startDate} to {endDate}.
              </div>

              {/* Recognition statement 3 (left: calc(50% - 790px/2), top: 465px, width: 790px, height: 66px) */}
              <div
                style={{
                  position: 'absolute',
                  width: 790,
                  height: 66,
                  left: 'calc(50% - 790px/2)',
                  top: 465,
                  fontFamily: "'Roboto', sans-serif",
                  fontStyle: 'normal',
                  fontWeight: 400,
                  fontSize: 16,
                  lineHeight: '140%',
                  textAlign: 'center',
                  color: '#1A1B1E',
                  zIndex: 10,
                }}
              >
                Your time, commitment, and work have helped educate, connect, and empower
                Nepal's youth for meaningful climate action, bringing us one step closer
                to a climate-resilient Nepal. We are grateful for your dedication and the
                meaningful contribution you have made to our mission.
              </div>

              {/* Director signature (left: 72px, top: 575px, width: 164px, height: 40px) */}
              <SignatureText />

              {/* Signature rule (left: 71px, top: 617px, width: 180px, height: 1.5px, background: #555555) */}
              <div
                style={{
                  position: 'absolute',
                  width: 180,
                  height: 1.5,
                  left: 71,
                  top: 617,
                  background: '#555555',
                  zIndex: 10,
                }}
              />

              {/* Signatory name (left: 72px, top: 624px, width: 215px, height: 18px) */}
              <div
                style={{
                  position: 'absolute',
                  width: 215,
                  height: 18,
                  left: 72,
                  top: 624,
                  fontFamily: "'Roboto', sans-serif",
                  fontStyle: 'normal',
                  fontWeight: 700,
                  fontSize: 13,
                  lineHeight: '135%',
                  color: '#1A1B1E',
                  zIndex: 10,
                }}
              >
                Bibek Pant
              </div>

              {/* Signatory title (left: 72px, top: 641px, width: 215px, height: 16px) */}
              <div
                style={{
                  position: 'absolute',
                  width: 215,
                  height: 16,
                  left: 72,
                  top: 641,
                  fontFamily: "'Roboto', sans-serif",
                  fontStyle: 'normal',
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: '135%',
                  color: '#1A1B1E',
                  zIndex: 10,
                }}
              >
                Executive Director
              </div>

              {/* Signatory organization (left: 72px, top: 657px, width: 215px, height: 16px) */}
              <div
                style={{
                  position: 'absolute',
                  width: 215,
                  height: 16,
                  left: 72,
                  top: 657,
                  fontFamily: "'Roboto', sans-serif",
                  fontStyle: 'normal',
                  fontWeight: 400,
                  fontSize: 12,
                  lineHeight: '135%',
                  color: '#1A1B1E',
                  zIndex: 10,
                }}
              >
                Nepal Climate Hub
              </div>

              {/* Verification container (left: 883px, top: 589px, width: 266px, height: 84px) */}
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  padding: 0,
                  gap: 14,
                  position: 'absolute',
                  width: 266,
                  height: 84,
                  left: 883,
                  top: 589,
                  zIndex: 10,
                }}
              >
                {/* Verification details (width: 168px, height: 44px) */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    padding: 0,
                    gap: 3,
                    width: 168,
                    height: 44,
                    flex: 'none',
                    order: 0,
                    flexGrow: 1,
                  }}
                >
                  {/* Verification instruction */}
                  <div
                    style={{
                      width: 168,
                      height: 13,
                      fontFamily: "'Roboto', sans-serif",
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: 11,
                      lineHeight: '13px',
                      textAlign: 'right',
                      color: '#1A1B1E',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Verify this certificate
                  </div>

                  {/* Verification website */}
                  <div
                    style={{
                      width: 168,
                      height: 13,
                      fontFamily: "'Roboto', sans-serif",
                      fontStyle: 'normal',
                      fontWeight: 700,
                      fontSize: 11,
                      lineHeight: '13px',
                      textAlign: 'right',
                      color: '#1A1B1E',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    nepalclimatehub.org/verify
                  </div>

                  {/* Verification code (ALWAYS displayed with code or fallback) */}
                  <div
                    style={{
                      width: 168,
                      height: 12,
                      fontFamily: "'Roboto', sans-serif",
                      fontStyle: 'normal',
                      fontWeight: 400,
                      fontSize: 10,
                      lineHeight: '12px',
                      textAlign: 'right',
                      color: '#1A1B1E',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Code: {displayCode}
                  </div>
                </div>

                {/* QR code (84px x 84px) */}
                <div
                  style={{
                    width: 84,
                    height: 84,
                    background: '#FFFFFF',
                    flex: 'none',
                    order: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <QRCodeSVG
                    value={verificationUrl}
                    size={84}
                    includeMargin={false}
                    bgColor="#FFFFFF"
                    fgColor="#1A1B1E"
                  />
                </div>
              </div>
            </div>
            {/* End #printable-certificate */}
          </div>
        </div>

        {/* Global stylesheet for Google fonts, responsive scaling & print */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
              @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@600;700&family=Roboto+Slab:wght@700;800&family=Roboto:ital,wght@0,400;0,500;0,700;1,400&family=Zilla+Slab:ital,wght@0,400;0,600;1,400;1,600&display=swap');

              .nch-certificate-root {
                transform-origin: top left;
              }

              @media print {
                body * {
                  visibility: hidden !important;
                }
                #printable-certificate, #printable-certificate * {
                  visibility: visible !important;
                }
                #printable-certificate {
                  position: fixed !important;
                  left: 50% !important;
                  top: 50% !important;
                  transform: translate(-50%, -50%) scale(0.92) !important;
                  transform-origin: center center !important;
                  width: 1220px !important;
                  height: 737px !important;
                  margin: 0 !important;
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
          }}
        />

        {/* Auto-scaler to fit modal width dynamically */}
        <ScaleScript />
      </DialogContent>
    </Dialog>
  )
}

function ScaleScript() {
  React.useEffect(() => {
    const updateScale = () => {
      const cert = document.getElementById('printable-certificate')
      if (!cert) return
      const parent = cert.parentElement
      if (!parent) return
      const parentW = parent.offsetWidth
      if (!parentW) return
      const s = parentW / 1220
      cert.style.transform = `scale(${s})`
      parent.style.height = `${737 * s}px`
    }

    const cert = document.getElementById('printable-certificate')
    const parent = cert?.parentElement
    if (!parent) return

    updateScale()
    const timer = setTimeout(updateScale, 80)

    const observer = new ResizeObserver(() => {
      updateScale()
    })
    observer.observe(parent)

    window.addEventListener('resize', updateScale)
    return () => {
      clearTimeout(timer)
      observer.disconnect()
      window.removeEventListener('resize', updateScale)
    }
  }, [])
  return null
}
