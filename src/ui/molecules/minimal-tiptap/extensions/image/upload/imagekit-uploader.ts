import ImageKit from 'imagekit-javascript'
import { getIkAuthParams } from '@/query/imagekit/ik-service'
import { createUploader, type UploadDeps } from './upload-task'

const fetchAuth: UploadDeps['fetchAuth'] = async () => {
  const { data } = await getIkAuthParams()
  const { token, signature, expire } = data.ikAuthParams
  return {
    token,
    signature,
    expire,
    publicKey: data.publicKey,
    urlEndpoint: data.endpoint,
    folder: data.folder,
  }
}

const transport: UploadDeps['transport'] = (file, auth, onProgress) =>
  new Promise((resolve, reject) => {
    const client = new ImageKit({
      urlEndpoint: auth.urlEndpoint,
      publicKey: auth.publicKey,
    })
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable) {
        onProgress((event.loaded / event.total) * 100)
      }
    })
    client.upload(
      {
        file,
        fileName: file.name,
        useUniqueFileName: true,
        folder: auth.folder,
        isPrivateFile: false,
        token: auth.token,
        signature: auth.signature,
        expire: auth.expire,
        xhr,
      },
      (error, result) => {
        if (error || !result) {
          reject(error ?? new Error('Upload failed'))
          return
        }
        resolve({
          url: result.url,
          width: result.width ?? null,
          height: result.height ?? null,
        })
      },
      { publicKey: auth.publicKey }
    )
  })

export const imageKitUploader = createUploader({ fetchAuth, transport })
