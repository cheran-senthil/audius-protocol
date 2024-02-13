import {
  DownloadFile,
  TrackDownload as TrackDownloadBase,
  type DownloadTrackArgs
} from '@audius/common/services'
import { tracksSocialActions } from '@audius/common/store'
import { downloadZip } from 'client-zip'

import { audiusBackendInstance } from './audius-backend/audius-backend-instance'
import { dedupFilenames } from '@audius/common/utils'

const { downloadFinished } = tracksSocialActions

function isMobileSafari() {
  if (!navigator) return false
  return (
    navigator.userAgent.match(/(iPod|iPhone|iPad)/) &&
    navigator.userAgent.match(/AppleWebKit/)
  )
}

function browserDownload({ url, filename }: DownloadFile) {
  if (document) {
    const link = document.createElement('a')
    link.href = url
    // taget=_blank does not work on ios safari and will cause the download to be
    // unresponsive.
    if (!isMobileSafari()) {
      link.target = '_blank'
    }
    link.download = filename ?? ''
    link.click()
    link.remove()
  } else {
    throw new Error('No document found')
  }
}

class TrackDownload extends TrackDownloadBase {
  async downloadTracks({
    files,
    rootDirectoryName,
    abortSignal
  }: DownloadTrackArgs) {
    dedupFilenames(files)
    const responsePromises = files.map(
      async ({ url }) => await window.fetch(url, { signal: abortSignal })
    )
    try {
      const responses = await Promise.all(responsePromises)
      if (!responses.every((response) => response.ok)) {
        throw new Error('Download unsuccessful')
      }
      const filename = rootDirectoryName ?? files[0].filename
      let url
      if (files.length === 1) {
        url = responses[0].url
      } else {
        if (!rootDirectoryName)
          throw new Error(
            'rootDirectory must be supplied when downloading multiple files'
          )
        const blob = await downloadZip(
          responses.map((r, i) => {
            return {
              name: rootDirectoryName + '/' + files[i].filename,
              input: r
            }
          })
        ).blob()
        url = URL.createObjectURL(blob)
      }
      browserDownload({ url, filename })
      window.store.dispatch(downloadFinished())
    } catch (e) {
      if ((e as Error).name === 'AbortError') {
        console.info('Download aborted by the user')
      } else {
        throw e
      }
    }
  }
}

export const trackDownload = new TrackDownload({
  audiusBackend: audiusBackendInstance
})
