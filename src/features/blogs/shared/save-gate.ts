export type SaveAction = 'draft' | 'review' | 'publish'

export type SaveBlockers = {
  missingAlt: number
  unsettledUploads: number
}

export type SaveGate = {
  allowed: boolean
  message: string | null
}

export const NO_BLOCKERS: SaveBlockers = { missingAlt: 0, unsettledUploads: 0 }

const imageNoun = (count: number) => (count === 1 ? 'image' : 'images')

export const getSaveGate = ({
  blockers,
  action,
}: {
  blockers: SaveBlockers
  action: SaveAction
}): SaveGate => {
  const { missingAlt, unsettledUploads } = blockers
  if (unsettledUploads > 0) {
    return {
      allowed: false,
      message: `${unsettledUploads} ${imageNoun(unsettledUploads)} still uploading or failed — retry or remove before saving`,
    }
  }
  if (missingAlt > 0) {
    return {
      allowed: action === 'draft',
      message: `${missingAlt} ${imageNoun(missingAlt)} missing alt text`,
    }
  }
  return { allowed: true, message: null }
}

export const isServerSaveBlocked = ({ unsettledUploads }: SaveBlockers) =>
  unsettledUploads > 0
