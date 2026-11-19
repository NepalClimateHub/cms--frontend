import type { FC } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/ui/shadcn/alert-dialog'
import type { UnsavedChangesGuard } from './use-unsaved-changes-guard'

type Props = Pick<UnsavedChangesGuard, 'open' | 'onStay' | 'onLeave'>

export const UnsavedChangesDialog: FC<Props> = ({ open, onStay, onLeave }) => (
  <AlertDialog open={open}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
        <AlertDialogDescription>
          This blog has changes that have not been saved. Leaving now will lose
          them.
        </AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onStay}>Keep editing</AlertDialogCancel>
        <AlertDialogAction onClick={onLeave}>
          Discard and leave
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)
