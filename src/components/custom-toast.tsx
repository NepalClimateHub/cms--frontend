import { toast } from 'sonner'

export const getCustomToast = ({
  title,
  type = 'success',
}: {
  title: string
  type?: 'success' | 'error' | 'warning' | 'info'
}) => {
  return toast(title, {
    style: {
      backgroundColor:
        type === 'success'
          ? '#008000'
          : type === 'error'
            ? '#FF0000'
            : type === 'warning'
              ? '#FFA500'
              : '#0000FF',
      color: '#FFFFFF',
    },
  })
}
