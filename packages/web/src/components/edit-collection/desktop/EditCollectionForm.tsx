import { useFeatureFlag } from '@audius/common/hooks'
import {
  AlbumSchema,
  CollectionValues,
  PlaylistSchema
} from '@audius/common/schemas'
import { FeatureFlags } from '@audius/common/services'
import { Flex, Text } from '@audius/harmony'
import { Form, Formik } from 'formik'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import { AccessAndSaleField } from 'components/edit/fields/AccessAndSaleField'
import { CollectionTrackFieldArray } from 'components/edit/fields/CollectionTrackFieldArray'
import { ReleaseDateFieldLegacy } from 'components/edit/fields/ReleaseDateFieldLegacy'
import { SelectGenreField } from 'components/edit/fields/SelectGenreField'
import { SelectMoodField } from 'components/edit/fields/SelectMoodField'
import { StemsAndDownloadsCollectionField } from 'components/edit/fields/StemsAndDownloadsCollectionsField'
import { VisibilityField } from 'components/edit/fields/visibility/VisibilityField'
import {
  ArtworkField,
  TagField,
  TextAreaField,
  TextField
} from 'components/form-fields'
import { Tile } from 'components/tile'
import { AnchoredSubmitRow } from 'pages/upload-page/components/AnchoredSubmitRow'

import styles from './EditCollectionForm.module.css'

const messages = {
  name: 'Name',
  description: 'Description',
  trackDetails: {
    title: 'Track Details',
    description:
      'Set defaults for all tracks in this collection. You can edit your track details after upload.'
  },
  completeButton: 'Complete Upload'
}

type EditCollectionFormProps = {
  initialValues: CollectionValues
  onSubmit: (values: CollectionValues) => void
  isAlbum: boolean
}

export const EditCollectionForm = (props: EditCollectionFormProps) => {
  const { initialValues, onSubmit, isAlbum } = props
  const { isEnabled: isPremiumAlbumsEnabled } = useFeatureFlag(
    FeatureFlags.PREMIUM_ALBUMS_ENABLED
  )
  const { isEnabled: isUSDCUploadEnabled } = useFeatureFlag(
    FeatureFlags.USDC_PURCHASES_UPLOAD
  )
  const showPremiumAlbums = isPremiumAlbumsEnabled && isUSDCUploadEnabled

  const { isEnabled: isHiddenPaidScheduledEnabled } = useFeatureFlag(
    FeatureFlags.HIDDEN_PAID_SCHEDULED
  )

  const collectionTypeName = isAlbum ? 'Album' : 'Playlist'
  const validationSchema = isAlbum ? AlbumSchema : PlaylistSchema

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={toFormikValidationSchema(validationSchema)}
    >
      <Form className={styles.root}>
        <Tile className={styles.collectionFields} elevation='mid'>
          <div className={styles.row}>
            <ArtworkField
              name='artwork'
              className={styles.artwork}
              size='small'
            />
            <div className={styles.collectionInfo}>
              <TextField
                name='playlist_name'
                label={`${collectionTypeName} ${messages.name}`}
                maxLength={64}
                required
              />
              <TextAreaField
                name='description'
                aria-label={`${collectionTypeName} ${messages.description}`}
                placeholder={`${collectionTypeName} ${messages.description}`}
                maxLength={1000}
                showMaxLength
                className={styles.description}
                grows
              />
            </div>
          </div>
          {isHiddenPaidScheduledEnabled ? (
            <VisibilityField entityType={isAlbum ? 'album' : 'playlist'} />
          ) : (
            <ReleaseDateFieldLegacy />
          )}
          {isAlbum && showPremiumAlbums ? (
            <Flex w='100%' css={{ flexGrow: 1 }}>
              <AccessAndSaleField isAlbum isUpload />
            </Flex>
          ) : null}
          <div className={styles.trackDetails}>
            <Text variant='label'>{messages.trackDetails.title}</Text>
            <Text variant='body'>{messages.trackDetails.description}</Text>
            <div className={styles.row}>
              <SelectGenreField name='trackDetails.genre' />
              <SelectMoodField name='trackDetails.mood' />
            </div>
            <TagField name='trackDetails.tags' />
            {isAlbum && <StemsAndDownloadsCollectionField />}
          </div>
        </Tile>
        <CollectionTrackFieldArray />
        <AnchoredSubmitRow />
      </Form>
    </Formik>
  )
}
