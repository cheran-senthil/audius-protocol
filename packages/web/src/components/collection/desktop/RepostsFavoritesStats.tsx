import { useCallback, MouseEvent } from 'react'

import { formatCount, pluralize } from '@audius/common/utils'
import {
  Flex,
  IconHeart as IconFavorite,
  IconRepost,
  PlainButton
} from '@audius/harmony'

type RepostFavoritesStatsProps = {
  isUnlisted: boolean
  repostCount: number
  saveCount: number
  onClickReposts?: () => void
  onClickFavorites?: () => void
  className?: string
}

const messages = {
  reposts: 'Repost',
  favorites: 'Favorite'
}

// NOTE: this is a newer version of the other RepostsFavoritesStats component;
// unclear if designers want to deprecate the old one just yet so this is a standalone component for CollectionHeader
export const RepostFavoritesStats = ({
  isUnlisted,
  repostCount,
  saveCount,
  onClickReposts,
  onClickFavorites
}: RepostFavoritesStatsProps) => {
  const handleOnClickReposts = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onClickReposts?.()
    },
    [onClickReposts]
  )
  const handleOnClickFavorites = useCallback(
    (e: MouseEvent) => {
      e.preventDefault()
      e.stopPropagation()
      onClickFavorites?.()
    },
    [onClickFavorites]
  )

  if (isUnlisted) return null
  return !!repostCount || !!saveCount ? (
    <Flex alignItems='center'>
      {!!repostCount && (
        <PlainButton
          size='large'
          variant='subdued'
          iconLeft={IconRepost}
          onClick={handleOnClickReposts}
        >
          <span>{formatCount(repostCount)}</span>
          {pluralize(messages.reposts, repostCount)}
        </PlainButton>
      )}
      {!!saveCount && (
        <PlainButton
          size='large'
          variant='subdued'
          iconLeft={IconFavorite}
          onClick={handleOnClickFavorites}
        >
          <span>{formatCount(saveCount)}</span>
          {pluralize(messages.favorites, saveCount)}
        </PlainButton>
      )}
    </Flex>
  ) : null
}