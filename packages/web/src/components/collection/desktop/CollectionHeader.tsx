import { ChangeEvent, useCallback, useState } from 'react'

import { useGetCurrentUserId } from '@audius/common/api'
import {
  AccessConditions,
  AccessPermissions,
  CoverArtSizes,
  ID,
  ModalSource,
  Variant,
  isContentUSDCPurchaseGated
} from '@audius/common/models'
import { FeatureFlags } from '@audius/common/services'
import {
  CollectionsPageType,
  PurchaseableContentType,
  useEditPlaylistModal
} from '@audius/common/store'
import { Nullable } from '@audius/common/utils'
import {
  Text,
  IconVisibilityHidden,
  IconPencil,
  Flex,
  TextInput,
  TextInputSize,
  IconSearch,
  IconCart,
  useTheme,
  IconComponent,
  MusicBadge
} from '@audius/harmony'
import cn from 'classnames'

import { UserLink } from 'components/link'
import Skeleton from 'components/skeleton/Skeleton'
import { GatedContentSection } from 'components/track/GatedContentSection'
import { UserGeneratedText } from 'components/user-generated-text'
import { useFlag } from 'hooks/useRemoteConfig'

import { CollectionMetadataList } from '../CollectionMetadataList'
import { RepostsFavoritesStats } from '../components/RepostsFavoritesStats'

import { Artwork } from './Artwork'
import { CollectionActionButtons } from './CollectionActionButtons'
import styles from './CollectionHeader.module.css'

const messages = {
  filterPlaylist: 'Search in playlist...',
  filterAlbum: 'Search in album...',
  premiumLabel: 'premium',
  hiddenPlaylistLabel: 'hidden playlist',
  by: 'By ',
  hidden: 'Hidden'
}

type CollectionHeaderProps = {
  isStreamGated: Nullable<boolean>
  isPlayable: boolean
  isPublished: boolean
  tracksLoading: boolean
  loading: boolean
  playing: boolean
  previewing: boolean
  isOwner: boolean
  isAlbum: boolean
  access: Nullable<AccessPermissions>
  collectionId: ID
  ownerId: Nullable<ID>
  type: CollectionsPageType | 'Playlist' | 'Audio NFT Playlist'
  title: string
  coverArtSizes: Nullable<CoverArtSizes>
  artistName: string
  description: string
  artistHandle: string
  releaseDate: string | number // either format should be utc time
  lastModifiedDate?: string | number // either format should be utc time
  numTracks: number
  duration: number
  variant: Nullable<Variant>
  gradient?: string
  icon: IconComponent
  imageOverride?: string
  userId: Nullable<ID>
  reposts: number
  saves: number
  streamConditions: Nullable<AccessConditions>
  onClickReposts?: () => void
  onClickFavorites?: () => void
  onPlay: () => void
  onPreview: () => void
  onFilterChange?: (e: ChangeEvent<HTMLInputElement>) => void
}

export const CollectionHeader = (props: CollectionHeaderProps) => {
  const {
    access,
    collectionId,
    ownerId,
    type,
    title,
    coverArtSizes,
    description,
    isOwner,
    isPlayable,
    isPublished,
    tracksLoading,
    loading,
    playing,
    previewing,
    onPlay,
    onPreview,
    variant,
    gradient,
    icon,
    imageOverride,
    userId,
    onFilterChange,
    reposts,
    saves,
    onClickReposts,
    onClickFavorites,
    isStreamGated,
    streamConditions
  } = props

  const { isEnabled: isPremiumAlbumsEnabled } = useFlag(
    FeatureFlags.PREMIUM_ALBUMS_ENABLED
  )
  const { data: currentUserId } = useGetCurrentUserId({})
  const [artworkLoading, setIsArtworkLoading] = useState(true)
  const [filterText, setFilterText] = useState('')
  const { spacing } = useTheme()

  const hasStreamAccess = access?.stream

  const handleFilterChange = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const newFilterText = e.target.value
      setFilterText(newFilterText)
      onFilterChange?.(e)
    },
    [onFilterChange]
  )

  const handleLoadArtwork = useCallback(() => {
    setIsArtworkLoading(false)
  }, [])

  const { onOpen } = useEditPlaylistModal()

  const handleClickEditTitle = useCallback(() => {
    onOpen({ collectionId, initialFocusedField: 'name' })
  }, [onOpen, collectionId])

  const renderStatsRow = (isLoading: boolean) => {
    if (isLoading) return <Skeleton height='20px' width='120px' />
    return (
      <RepostsFavoritesStats
        isUnlisted={false}
        repostCount={reposts}
        saveCount={saves}
        onClickReposts={onClickReposts}
        onClickFavorites={onClickFavorites}
      />
    )
  }

  const isLoading = loading || artworkLoading

  const isPremium =
    isStreamGated && isContentUSDCPurchaseGated(streamConditions)

  const topSection = (
    <Flex gap='xl' p='l' backgroundColor='white'>
      <Artwork
        collectionId={collectionId}
        coverArtSizes={coverArtSizes}
        callback={handleLoadArtwork}
        gradient={gradient}
        icon={icon}
        imageOverride={imageOverride}
        isOwner={isOwner}
      />
      <Flex
        direction='column'
        justifyContent='space-between'
        css={{ minWidth: 400 }}
      >
        <Flex direction='column' gap='xl'>
          {isLoading ? (
            <Skeleton height='24px' width='200px' />
          ) : (
            <Flex gap='s' mt='s' alignItems='center'>
              {isPremium ? <IconCart size='s' color='subdued' /> : null}
              <Text
                variant='label'
                color='subdued'
                css={{ letterSpacing: '2px' }}
              >
                {isPremium ? `${messages.premiumLabel} ` : ''}
                {type === 'playlist' && !isPublished
                  ? messages.hiddenPlaylistLabel
                  : type}
              </Text>
            </Flex>
          )}
          <Flex direction='column' gap='s'>
            <Flex
              as={isOwner ? 'button' : 'span'}
              css={{ background: 0, border: 0, padding: 0, margin: 0 }}
              gap='s'
              alignItems='center'
              className={cn({
                [styles.editableTitle]: isOwner
              })}
              onClick={isOwner ? handleClickEditTitle : undefined}
            >
              {isLoading ? (
                <Skeleton height='48px' width='300px' />
              ) : (
                <>
                  <Text
                    variant='heading'
                    size='xl'
                    className={cn(styles.titleHeader)}
                    textAlign='left'
                  >
                    {title}
                  </Text>

                  {!isLoading && isOwner ? (
                    <IconPencil className={styles.editIcon} color='subdued' />
                  ) : null}
                </>
              )}
            </Flex>
            {isLoading ? (
              <Skeleton height='24px' width='150px' />
            ) : userId !== null ? (
              <Text variant='title' strength='weak' tag='h2' textAlign='left'>
                <Text color='subdued'>{messages.by}</Text>
                <UserLink userId={userId} popover variant='visible' />
              </Text>
            ) : null}
          </Flex>
          <div>{renderStatsRow(isLoading)}</div>
        </Flex>

        {isLoading ? (
          <Skeleton height='64px' width='100%' />
        ) : (
          <CollectionActionButtons
            variant={variant}
            userId={userId}
            collectionId={collectionId}
            isPlayable={isPlayable}
            isPlaying={playing}
            isPreviewing={previewing}
            isPremium={isPremium}
            isOwner={isOwner}
            tracksLoading={tracksLoading}
            onPlay={onPlay}
            onPreview={onPreview}
          />
        )}
      </Flex>
      <Flex
        w='240px'
        gap='s'
        justifyContent='flex-end'
        css={{ position: 'absolute', right: spacing.l, top: spacing.l }}
      >
        {!isPublished ? (
          <MusicBadge icon={IconVisibilityHidden}>{messages.hidden}</MusicBadge>
        ) : onFilterChange ? (
          <TextInput
            label={
              type === 'album' ? messages.filterAlbum : messages.filterPlaylist
            }
            placeholder={
              type === 'album' ? messages.filterAlbum : messages.filterPlaylist
            }
            startIcon={IconSearch}
            onChange={handleFilterChange}
            value={filterText}
            size={TextInputSize.SMALL}
            className={styles.searchInput}
          />
        ) : null}
      </Flex>
    </Flex>
  )

  const descriptionSection = (
    <Flex
      gap='xl'
      direction='column'
      p='xl'
      backgroundColor='surface1'
      borderTop='strong'
      borderBottom='strong'
    >
      {isPremiumAlbumsEnabled && isStreamGated && streamConditions ? (
        <GatedContentSection
          isLoading={isLoading}
          contentId={collectionId}
          contentType={PurchaseableContentType.ALBUM}
          streamConditions={streamConditions}
          hasStreamAccess={hasStreamAccess}
          isOwner={ownerId === currentUserId}
          ownerId={ownerId}
          source={ModalSource.CollectionDetails}
        />
      ) : null}

      {isLoading ? (
        <Skeleton height='40px' width='100%' />
      ) : (
        <Flex gap='l' direction='column'>
          {description ? (
            <UserGeneratedText
              size='s'
              linkSource='collection page'
              css={{ textAlign: 'left' }}
            >
              {description}
            </UserGeneratedText>
          ) : null}
          <CollectionMetadataList collectionId={collectionId} />
        </Flex>
      )}
    </Flex>
  )
  return (
    <Flex direction='column' h='100%'>
      {topSection}
      {descriptionSection}
    </Flex>
  )
}
