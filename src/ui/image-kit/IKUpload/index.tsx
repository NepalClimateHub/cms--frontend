import React, { forwardRef, useContext, useEffect, useState } from 'react'
import { Button } from '@/ui/shadcn/button'
import { Input } from '@/ui/shadcn/input'
import { UploadCloud } from 'lucide-react'
import { ImageKitContext } from '../IKContext'
import { IKContextBaseProps } from '../IKContext/props'
import useImageKitComponent from '../ImageKitComponent'
import { IKUploadProps, OverrideValues } from './props'

type IKUploadState = {
  xhr?: XMLHttpRequest
}

type CustomIKUploadProps = {
  label: string
  description: string
  isUploading: boolean
  inputId?: string
}

const IKUpload = forwardRef<
  HTMLInputElement,
  IKUploadProps & IKContextBaseProps & CustomIKUploadProps
>((props, ref) => {
  const [state, setState] = useState<IKUploadState>({})
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const contextOptions = useContext(ImageKitContext)
  const { getIKClient } = useImageKitComponent({ ...props })

  useEffect(() => {
    const abort = () => {
      if (state.xhr) {
        state.xhr.abort()
      }
    }
    if (ref && typeof ref === 'object' && 'current' in ref) {
      const refObject = ref as React.MutableRefObject<
        HTMLInputElement & { abort: () => void }
      >
      if (refObject.current) {
        refObject.current.abort = abort
      }
    }
  }, [state.xhr, ref])

  const {
    publicKey,
    urlEndpoint,
    authenticator,
    fileName,
    useUniqueFileName,
    tags,
    folder,
    isPrivateFile,
    customCoordinates,
    responseFields,
    onError,
    onSuccess,
    onUploadStart,
    onUploadProgress,
    validateFile,
    webhookUrl,
    overwriteFile,
    overwriteAITags,
    overwriteTags,
    overwriteCustomMetadata,
    extensions,
    customMetadata,
    transformation,
    checks,
    overrideParameters,
    label,
    description,
    isUploading,
    disabled,
    inputId = 'file-upload',
    ...restProps
  } = props

  const uploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const publicKey = props.publicKey || contextOptions.publicKey
    const authenticator = props.authenticator || contextOptions.authenticator
    const urlEndpoint = props.urlEndpoint || contextOptions.urlEndpoint

    if (!publicKey || publicKey.trim() === '') {
      if (onError && typeof onError === 'function') {
        onError({
          message: 'Missing publicKey',
        })
      }
      return
    }

    if (!authenticator) {
      if (onError && typeof onError === 'function') {
        onError({
          message: 'The authenticator function is not provided.',
        })
      }
      return
    }

    if (typeof authenticator !== 'function') {
      if (onError && typeof onError === 'function') {
        onError({
          message: 'The provided authenticator is not a function.',
        })
      }
      return
    }

    if (!urlEndpoint || urlEndpoint.trim() === '') {
      if (onError && typeof onError === 'function') {
        onError({
          message: 'Missing urlEndpoint',
        })
      }
      return
    }

    const ikClient = getIKClient()

    const file = e.target.files?.[0]
    if (!file) {
      return
    }

    if (props.validateFile && !props.validateFile(file)) {
      return
    }

    if (props.onUploadStart && typeof props.onUploadStart === 'function') {
      props.onUploadStart(e)
    }

    let overrideValues: OverrideValues = {}

    if (
      props.overrideParameters &&
      typeof props.overrideParameters === 'function'
    ) {
      overrideValues = props.overrideParameters(file) || {}
    }

    const xhr = new XMLHttpRequest()
    const progressCb = (e: ProgressEvent<XMLHttpRequestEventTarget>) => {
      if (
        props.onUploadProgress &&
        typeof props.onUploadProgress === 'function'
      ) {
        props.onUploadProgress(e)
      }
    }

    xhr.upload.addEventListener('progress', progressCb)

    const params = {
      file: file,
      fileName: overrideValues.fileName || fileName || file.name,
      useUniqueFileName: overrideValues.useUniqueFileName || useUniqueFileName,
      tags: overrideValues.tags || tags,
      folder: overrideValues.folder || folder,
      isPrivateFile: overrideValues.isPrivateFile || isPrivateFile,
      customCoordinates: overrideValues.customCoordinates || customCoordinates,
      responseFields,
      extensions: overrideValues.extensions || extensions,
      webhookUrl: overrideValues.webhookUrl || webhookUrl,
      overwriteFile: overrideValues.overwriteFile || overwriteFile,
      overwriteAITags: overrideValues.overwriteAITags || overwriteAITags,
      overwriteTags: overrideValues.overwriteTags || overwriteTags,
      overwriteCustomMetadata:
        overrideValues.overwriteCustomMetadata || overwriteCustomMetadata,
      customMetadata: overrideValues.customMetadata || customMetadata,
      signature: '',
      expire: 0,
      token: '',
      xhr,
      transformation: overrideValues.transformation || transformation,
      checks: overrideValues.checks || checks,
    }

    const authPromise = authenticator()

    if (!(authPromise instanceof Promise)) {
      if (onError && typeof onError === 'function') {
        onError({
          message:
            'The authenticator function is expected to return a Promise instance.',
        })
      }
      return
    }

    authPromise
      .then(({ signature, token, expire }) => {
        params['signature'] = signature
        params['expire'] = expire
        params['token'] = token
        ikClient.upload(
          params,
          (err: Error | null, result: any | null) => {
            if (err) {
              if (onError && typeof onError === 'function') {
                onError(err)
              }
            } else {
              if (onSuccess && typeof onSuccess === 'function') {
                onSuccess(result)
              }
            }
            xhr.upload.removeEventListener('progress', progressCb)
            setState({ xhr })
          },
          {
            publicKey,
          }
        )
      })
      .catch((data) => {
        let error
        if (data instanceof Array) {
          error = data[0]
        } else {
          error = data
        }

        if (onError && typeof onError === 'function') {
          onError({
            message: String(error),
          })
        }
        return
      })
  }

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setUploadedFileName(file.name)
    }

    if (props.onChange && typeof props.onChange === 'function') {
      props.onChange(e)
    }
    uploadFile(e)
  }

  return (
    <div className='flex flex-col gap-3'>
      <div className='flex flex-col gap-1'>
        <div className='text-lg font-semibold text-gray-600'>{label}</div>

        <div className='text-sm text-gray-500'>{description}</div>
      </div>

      <div className='flex items-center gap-3'>
        <Button
          type='button'
          loading={isUploading}
          disabled={disabled || isUploading}
          variant='outline'
          className='relative flex items-center gap-2 px-4 py-2'
        >
          <UploadCloud className='h-5 w-5 text-gray-600' />
          <label htmlFor={inputId} className='cursor-pointer'>
            {fileName ? 'Change File' : 'Choose File'}
          </label>
        </Button>

        {fileName && (
          <span className='max-w-[200px] truncate text-sm text-gray-500'>
            {uploadedFileName}
          </span>
        )}

        <Input
          {...restProps}
          disabled={isUploading || disabled}
          ref={ref}
          type='file'
          onChange={onFileChange}
          id={inputId}
          className='hidden'
        />
      </div>
    </div>
  )
})

export default IKUpload
