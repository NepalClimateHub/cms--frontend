import * as React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/ui/shadcn/dialog'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { Label } from '@/ui/shadcn/label'
import { Checkbox } from '@/ui/shadcn/checkbox'

interface ImageResizerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  width: number
  height: number
  naturalWidth: number
  naturalHeight: number
  onResize: (width: number, height: number) => void
}

export const ImageResizer: React.FC<ImageResizerProps> = ({
  open,
  onOpenChange,
  width: initialWidth,
  height: initialHeight,
  naturalWidth,
  naturalHeight,
  onResize,
}) => {
  const [width, setWidth] = React.useState(initialWidth)
  const [height, setHeight] = React.useState(initialHeight)
  const [maintainAspectRatio, setMaintainAspectRatio] = React.useState(true)

  React.useEffect(() => {
    if (open) {
      setWidth(initialWidth)
      setHeight(initialHeight)
    }
  }, [open, initialWidth, initialHeight])

  const aspectRatio = naturalWidth / naturalHeight

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newWidth = parseInt(e.target.value) || 0
    setWidth(newWidth)
    if (maintainAspectRatio) {
      setHeight(Math.round(newWidth / aspectRatio))
    }
  }

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHeight = parseInt(e.target.value) || 0
    setHeight(newHeight)
    if (maintainAspectRatio) {
      setWidth(Math.round(newHeight * aspectRatio))
    }
  }

  const setPreset = (percent: number) => {
    const newWidth = Math.round(naturalWidth * (percent / 100))
    const newHeight = Math.round(naturalHeight * (percent / 100))
    setWidth(newWidth)
    setHeight(newHeight)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Resize Image</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="width" className="text-right">
              Width
            </Label>
            <Input
              id="width"
              type="number"
              value={width}
              onChange={handleWidthChange}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="height" className="text-right">
              Height
            </Label>
            <Input
              id="height"
              type="number"
              value={height}
              onChange={handleHeightChange}
              className="col-span-3"
            />
          </div>
          <div className="flex items-center space-x-2 pl-24">
            <Checkbox
              id="aspect"
              checked={maintainAspectRatio}
              onCheckedChange={(checked) => setMaintainAspectRatio(!!checked)}
            />
            <Label htmlFor="aspect" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Maintain aspect ratio
            </Label>
          </div>
          <div className="flex justify-center gap-2 mt-2">
            {[25, 50, 75, 100].map((p) => (
              <Button
                key={p}
                variant="outline"
                size="sm"
                onClick={() => setPreset(p)}
              >
                {p}%
              </Button>
            ))}
          </div>
        </div>
        <DialogFooter>
          <Button onClick={() => onResize(width, height)}>Apply Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
