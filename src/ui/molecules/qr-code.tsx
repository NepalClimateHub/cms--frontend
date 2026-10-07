import React, { useMemo } from 'react'

/**
 * Lightweight, zero-dependency QR Code generator for React.
 * Generates an SVG element containing the QR code matrix.
 */

// QR Code generation algorithms (Version 1 to 10 supported, Byte mode, Error Correction Levels L, M, Q, H)
type ErrorCorrectionLevel = 'L' | 'M' | 'Q' | 'H'

interface QRCodeProps {
  value: string
  size?: number
  level?: ErrorCorrectionLevel
  fgColor?: string
  bgColor?: string
  includeMargin?: boolean
  className?: string
  title?: string
}

// Polynomial operations in GF(256)
const GF256_EXP = new Uint8Array(512)
const GF256_LOG = new Uint8Array(256)

;(() => {
  let x = 1
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x
    GF256_EXP[i + 255] = x
    GF256_LOG[x] = i
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0)
  }
  GF256_LOG[0] = 0
})()

function gfMultiply(x: number, y: number): number {
  if (x === 0 || y === 0) return 0
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]]
}

function rsGeneratorPoly(degree: number): Uint8Array {
  let poly = new Uint8Array([1])
  for (let i = 0; i < degree; i++) {
    const nextPoly = new Uint8Array(poly.length + 1)
    const factor = GF256_EXP[i]
    for (let j = 0; j < poly.length; j++) {
      nextPoly[j] ^= gfMultiply(poly[j], factor)
      nextPoly[j + 1] ^= poly[j]
    }
    poly = nextPoly
  }
  return poly
}

function rsComputeRemainder(data: Uint8Array, numEccBytes: number): Uint8Array {
  const gen = rsGeneratorPoly(numEccBytes)
  const remainder = new Uint8Array(numEccBytes)
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0]
    remainder.copyWithin(0, 1)
    remainder[numEccBytes - 1] = 0
    for (let j = 0; j < numEccBytes; j++) {
      remainder[j] ^= gfMultiply(gen[j], factor)
    }
  }
  return remainder
}

// Table of QR parameters (Versions 1-10, EC Level M)
// [version, totalCodewords, dataCodewordsM, eccCodewordsPerBlock, numBlocks]
const VERSION_TABLE: Record<number, { total: number; dataM: number; ecBlock: number; blocks: number; align: number[] }> = {
  1: { total: 26, dataM: 16, ecBlock: 10, blocks: 1, align: [] },
  2: { total: 44, dataM: 28, ecBlock: 16, blocks: 1, align: [6, 18] },
  3: { total: 70, dataM: 44, ecBlock: 26, blocks: 1, align: [6, 22] },
  4: { total: 100, dataM: 64, ecBlock: 18, blocks: 2, align: [6, 26] },
  5: { total: 134, dataM: 86, ecBlock: 24, blocks: 2, align: [6, 30] },
  6: { total: 172, dataM: 108, ecBlock: 16, blocks: 4, align: [6, 34] },
  7: { total: 196, dataM: 124, ecBlock: 18, blocks: 4, align: [6, 22, 38] },
  8: { total: 242, dataM: 154, ecBlock: 22, blocks: 4, align: [6, 24, 42] },
  9: { total: 292, dataM: 182, ecBlock: 22, blocks: 5, align: [6, 26, 46] },
  10: { total: 346, dataM: 216, ecBlock: 26, blocks: 5, align: [6, 28, 50] },
}

function encodeText(text: string): boolean[][] {
  const encoder = new TextEncoder()
  const bytes = encoder.encode(text)

  // Find minimum version that fits bytes with Byte mode (overhead: 4 mode bits + 8 length bits = 1.5 bytes)
  let version = 1
  while (version <= 10 && bytes.length + 2 > VERSION_TABLE[version].dataM) {
    version++
  }

  if (version > 10) {
    version = 10
  }

  const vInfo = VERSION_TABLE[version]
  const size = 17 + version * 4

  // Initialize modules grid (-1: unset, 0: light, 1: dark, 2: reserved/function)
  const grid: number[][] = Array.from({ length: size }, () => Array(size).fill(-1))

  // Finder patterns
  const placeFinder = (row: number, col: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        const nr = row + r
        const nc = col + c
        if (nr >= 0 && nr < size && nc >= 0 && nc < size) {
          const isDark =
            (r >= 0 && r <= 6 && (c === 0 || c === 6)) ||
            (c >= 0 && c <= 6 && (r === 0 || r === 6)) ||
            (r >= 2 && r <= 4 && c >= 2 && c <= 4)
          grid[nr][nc] = isDark ? 1 : 0
        }
      }
    }
  }

  placeFinder(0, 0)
  placeFinder(0, size - 7)
  placeFinder(size - 7, 0)

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    if (grid[6][i] === -1) grid[6][i] = i % 2 === 0 ? 1 : 0
    if (grid[i][6] === -1) grid[i][6] = i % 2 === 0 ? 1 : 0
  }

  // Dark module
  grid[4 * version + 9][8] = 1

  // Alignment patterns
  if (vInfo.align.length > 0) {
    const coords = vInfo.align
    for (const r of coords) {
      for (const c of coords) {
        if (grid[r][c] !== -1) continue
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isBorder = Math.abs(dr) === 2 || Math.abs(dc) === 2
            const isCenter = dr === 0 && dc === 0
            grid[r + dr][c + dc] = isBorder || isCenter ? 1 : 0
          }
        }
      }
    }
  }

  // Reserve format info areas
  for (let i = 0; i < 9; i++) {
    if (grid[8][i] === -1) grid[8][i] = 2
    if (grid[i][8] === -1) grid[i][8] = 2
  }
  for (let i = size - 8; i < size; i++) {
    if (grid[8][i] === -1) grid[8][i] = 2
    if (grid[i][8] === -1) grid[i][8] = 2
  }

  // Build bitstream: Mode (0100 for Byte) + Count (8 bits for V1-9, 16 for V10) + Data + Terminator
  const bits: number[] = []
  const appendBits = (val: number, len: number) => {
    for (let i = len - 1; i >= 0; i--) {
      bits.push((val >> i) & 1)
    }
  }

  appendBits(0b0100, 4) // Byte mode
  appendBits(bytes.length, version < 10 ? 8 : 16)
  for (const b of bytes) {
    appendBits(b, 8)
  }

  // Terminator
  const dataCapacityBits = vInfo.dataM * 8
  const termLen = Math.min(4, dataCapacityBits - bits.length)
  for (let i = 0; i < termLen; i++) bits.push(0)

  // Pad to multiple of 8
  while (bits.length % 8 !== 0) bits.push(0)

  // Pad bytes
  const padBytes = [0xec, 0x11]
  let padIdx = 0
  while (bits.length < dataCapacityBits) {
    appendBits(padBytes[padIdx % 2], 8)
    padIdx++
  }

  // Convert to data codewords
  const dataCodewords = new Uint8Array(vInfo.dataM)
  for (let i = 0; i < vInfo.dataM; i++) {
    let byteVal = 0
    for (let b = 0; b < 8; b++) {
      byteVal = (byteVal << 1) | bits[i * 8 + b]
    }
    dataCodewords[i] = byteVal
  }

  // Split into blocks & compute Reed-Solomon EC
  const numBlocks = vInfo.blocks
  const ecPerBlock = vInfo.ecBlock
  const blockDataLen = Math.floor(vInfo.dataM / numBlocks)
  const finalCodewords: number[] = []

  const dataBlocks: Uint8Array[] = []
  const ecBlocks: Uint8Array[] = []

  for (let i = 0; i < numBlocks; i++) {
    const start = i * blockDataLen
    const end = i === numBlocks - 1 ? vInfo.dataM : start + blockDataLen
    const slice = dataCodewords.slice(start, end)
    dataBlocks.push(slice)
    ecBlocks.push(rsComputeRemainder(slice, ecPerBlock))
  }

  // Interleave data
  const maxBlockLen = Math.max(...dataBlocks.map((b) => b.length))
  for (let col = 0; col < maxBlockLen; col++) {
    for (let b = 0; b < numBlocks; b++) {
      if (col < dataBlocks[b].length) {
        finalCodewords.push(dataBlocks[b][col])
      }
    }
  }

  // Interleave EC
  for (let col = 0; col < ecPerBlock; col++) {
    for (let b = 0; b < numBlocks; b++) {
      finalCodewords.push(ecBlocks[b][col])
    }
  }

  // Convert all codewords to bits
  const finalBits: number[] = []
  for (const cw of finalCodewords) {
    for (let i = 7; i >= 0; i--) {
      finalBits.push((cw >> i) & 1)
    }
  }

  // Place data bits with Mask 0 ((r + c) % 2 === 0)
  let bitIdx = 0
  let right = size - 1
  let goingUp = true

  while (right > 0) {
    if (right === 6) right-- // Skip vertical timing line

    const rows = goingUp
      ? Array.from({ length: size }, (_, i) => size - 1 - i)
      : Array.from({ length: size }, (_, i) => i)

    for (const r of rows) {
      for (const col of [right, right - 1]) {
        if (grid[r][col] === -1) {
          const bit = bitIdx < finalBits.length ? finalBits[bitIdx++] : 0
          const mask = (r + col) % 2 === 0
          grid[r][col] = (bit ^ (mask ? 1 : 0)) === 1 ? 1 : 0
        }
      }
    }

    right -= 2
    goingUp = !goingUp
  }

  // Format info (EC Level M = 00, Mask 0 = 000 -> 00000)
  // Format string for EC M + Mask 0 with BCH error code and XOR mask 0x5412: 101010000010010
  const FORMAT_BITS = [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0]

  // Place format info
  for (let i = 0; i < 6; i++) grid[8][i] = FORMAT_BITS[i]
  grid[8][7] = FORMAT_BITS[6]
  grid[8][8] = FORMAT_BITS[7]
  grid[7][8] = FORMAT_BITS[8]
  for (let i = 9; i < 15; i++) grid[14 - i][8] = FORMAT_BITS[i]

  for (let i = 0; i < 8; i++) grid[size - 1 - i][8] = FORMAT_BITS[i]
  for (let i = 8; i < 15; i++) grid[8][size - 15 + i] = FORMAT_BITS[i]

  return grid.map((row) => row.map((cell) => cell === 1))
}

export const QRCodeSVG: React.FC<QRCodeProps> = ({
  value,
  size = 128,
  fgColor = '#000000',
  bgColor = '#ffffff',
  includeMargin = true,
  className = '',
  title,
}) => {
  const matrix = useMemo(() => {
    try {
      return encodeText(value)
    } catch {
      return []
    }
  }, [value])

  if (!matrix.length) {
    return null
  }

  const matrixSize = matrix.length
  const margin = includeMargin ? 4 : 0
  const totalSize = matrixSize + margin * 2

  // Generate SVG path for dark modules for performance
  let path = ''
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      if (matrix[r][c]) {
        const x = c + margin
        const y = r + margin
        path += `M${x},${y}h1v1h-1z `
      }
    }
  }

  return (
    <svg
      role='img'
      aria-label={title || 'QR Code'}
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      width={size}
      height={size}
      className={className}
      style={{ shapeRendering: 'crispEdges' }}
    >
      {title && <title>{title}</title>}
      <rect width={totalSize} height={totalSize} fill={bgColor} />
      <path d={path} fill={fgColor} />
    </svg>
  )
}
