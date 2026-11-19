import ImageKit from 'imagekit-javascript'
import type React from 'react'
import { useContext } from 'react'
import { ImageKitContext } from '../IKContext'
import type { IKContextBaseProps } from '../IKContext/props'

const useImageKitComponent = <T = void>(
  props: React.PropsWithChildren & IKContextBaseProps & T
): { getIKClient: () => ImageKit } => {
  const contextOptions = useContext(ImageKitContext)

  const getIKClient = (): ImageKit => {
    if (contextOptions?.ikClient) {
      return contextOptions.ikClient
    }

    let { urlEndpoint }: { urlEndpoint?: string | null } = props
    urlEndpoint = urlEndpoint || contextOptions?.urlEndpoint

    if (!urlEndpoint || urlEndpoint.trim() === '') {
      throw new Error('Missing urlEndpoint during initialization')
    }

    const ikClient = new ImageKit({
      urlEndpoint: urlEndpoint,
      // @ts-expect-error: fix later
      sdkVersion: '',
    })

    return ikClient
  }

  return { getIKClient }
}

export default useImageKitComponent
