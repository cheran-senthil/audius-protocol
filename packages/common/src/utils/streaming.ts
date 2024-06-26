import { AccessSignature, ID, OptionalId, Track } from '~/models'
import { AudiusBackend, QueryParams } from '~/services/index'

import { Nullable } from './typeUtils'

const PREVIEW_LENGTH_SECONDS = 30

export async function generateUserSignature(
  audiusBackendInstance: AudiusBackend
) {
  const data = `Gated content user signature at ${Date.now()}`
  const signature = await audiusBackendInstance.getSignature(data)
  return { data, signature }
}

export async function getQueryParams({
  audiusBackendInstance,
  nftAccessSignature,
  userId
}: {
  audiusBackendInstance: AudiusBackend
  nftAccessSignature?: Nullable<AccessSignature>
  userId?: Nullable<ID>
}) {
  const { data, signature } = await generateUserSignature(audiusBackendInstance)
  const queryParams: QueryParams = {}
  if (userId) {
    queryParams.user_id = OptionalId.parse(userId)
  }
  queryParams.user_data = data
  queryParams.user_signature = signature
  if (nftAccessSignature) {
    queryParams.nft_access_signature = JSON.stringify(nftAccessSignature)
  }
  return queryParams
}

export function getTrackPreviewDuration(track: Track) {
  const previewStartSeconds = track.preview_start_seconds || 0
  return Math.min(track.duration - previewStartSeconds, PREVIEW_LENGTH_SECONDS)
}
