import { useCallback, useContext, useState } from 'react'

import { useFeatureFlag } from '@audius/common/hooks'
import { TrackMetadataFormSchema } from '@audius/common/schemas'
import { FeatureFlags } from '@audius/common/services'
import {
  IconCaretLeft,
  IconCaretRight,
  Text,
  PlainButton
} from '@audius/harmony'
import cn from 'classnames'
import { Form, Formik, FormikProps, useField } from 'formik'
import { useUnmount } from 'react-use'
import { z } from 'zod'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import { MenuFormCallbackStatus } from 'components/data-entry/ContextualMenu'
import { AccessAndSaleField } from 'components/edit/fields/AccessAndSaleField'
import { AttributionField } from 'components/edit/fields/AttributionField'
import { MultiTrackSidebar } from 'components/edit/fields/MultiTrackSidebar'
import { ReleaseDateField } from 'components/edit/fields/ReleaseDateField'
import { RemixSettingsField } from 'components/edit/fields/RemixSettingsField'
import { StemsAndDownloadsField } from 'components/edit/fields/StemsAndDownloadsField'
import { TrackMetadataFields } from 'components/edit/fields/TrackMetadataFields'
import { VisibilityField } from 'components/edit/fields/visibility/VisibilityField'
import layoutStyles from 'components/layout/layout.module.css'
import { NavigationPrompt } from 'components/navigation-prompt/NavigationPrompt'
import { EditFormScrollContext } from 'pages/edit-page/EditTrackPage'
import { AnchoredSubmitRowEdit } from 'pages/edit-page/components/AnchoredSubmitRowEdit'
import { AnchoredSubmitRow } from 'pages/upload-page/components/AnchoredSubmitRow'

import styles from './EditTrackForm.module.css'
import { PreviewButton } from './components/PreviewButton'
import { TrackEditFormValues } from './types'

const messages = {
  multiTrackCount: (index: number, total: number) =>
    `TRACK ${index} of ${total}`,
  prev: 'Prev',
  next: 'Next Track',
  preview: 'Preview',
  navigationPrompt: {
    title: 'Discard upload?',
    body: "Are you sure you want to leave this page?\nAny changes you've made will be lost.",
    cancel: 'Cancel',
    proceed: 'Discard'
  }
}

type EditTrackFormProps = {
  initialValues: TrackEditFormValues
  onSubmit: (values: TrackEditFormValues) => void
  hideContainer?: boolean
}

const EditFormValidationSchema = z.object({
  trackMetadatas: z.array(TrackMetadataFormSchema)
})

export const EditTrackForm = (props: EditTrackFormProps) => {
  const { initialValues, onSubmit, hideContainer } = props

  return (
    <Formik<TrackEditFormValues>
      initialValues={initialValues}
      onSubmit={onSubmit}
      validationSchema={toFormikValidationSchema(EditFormValidationSchema)}
    >
      {(props) => <TrackEditForm {...props} hideContainer={hideContainer} />}
    </Formik>
  )
}

const TrackEditForm = (
  props: FormikProps<TrackEditFormValues> & { hideContainer?: boolean }
) => {
  const { values, dirty, isSubmitting, hideContainer = false } = props
  const isMultiTrack = values.trackMetadatas.length > 1
  const isUpload = values.trackMetadatas[0].track_id === undefined
  const trackIdx = values.trackMetadatasIndex
  const [, , { setValue: setIndex }] = useField('trackMetadatasIndex')
  useUnmount(() => {
    setIndex(0)
  })
  const [forceOpenAccessAndSale, setForceOpenAccessAndSale] = useState(false)

  const { isEnabled: isHiddenPaidScheduledEnabled } = useFeatureFlag(
    FeatureFlags.HIDDEN_PAID_SCHEDULED
  )

  return (
    <Form>
      <NavigationPrompt
        when={dirty && !isSubmitting}
        messages={messages.navigationPrompt}
      />
      <div className={cn(layoutStyles.row, layoutStyles.gap2)}>
        <div
          className={cn(
            { [styles.formContainer]: !hideContainer },
            layoutStyles.col
          )}
        >
          {isMultiTrack ? <MultiTrackHeader /> : null}
          <div
            className={cn(
              { [styles.trackEditForm]: !hideContainer },
              layoutStyles.col,
              layoutStyles.gap4
            )}
          >
            <TrackMetadataFields />
            <div className={cn(layoutStyles.col, layoutStyles.gap4)}>
              {isHiddenPaidScheduledEnabled ? (
                <VisibilityField entityType='track' />
              ) : (
                <ReleaseDateField />
              )}
              <AccessAndSaleField
                isUpload={isUpload}
                forceOpen={forceOpenAccessAndSale}
                setForceOpen={setForceOpenAccessAndSale}
              />
              <AttributionField />
              <StemsAndDownloadsField
                isUpload={isUpload}
                closeMenuCallback={(data) => {
                  if (data === MenuFormCallbackStatus.OPEN_ACCESS_AND_SALE) {
                    setForceOpenAccessAndSale(true)
                  }
                }}
              />
              <RemixSettingsField />
            </div>
            <PreviewButton
              // Since edit form is a single component, render a different preview for each track
              key={trackIdx}
              className={styles.previewButton}
              index={trackIdx}
            />
          </div>
          {isMultiTrack ? <MultiTrackFooter /> : null}
        </div>
        {isMultiTrack ? <MultiTrackSidebar /> : null}
      </div>
      {isUpload ? (
        !isMultiTrack ? (
          <AnchoredSubmitRow />
        ) : null
      ) : (
        <AnchoredSubmitRowEdit />
      )}
    </Form>
  )
}

const MultiTrackHeader = () => {
  const [{ value: index }] = useField('trackMetadatasIndex')
  const [{ value: trackMetadatas }] = useField('trackMetadatas')

  return (
    <div className={styles.multiTrackHeader}>
      <Text variant='title' size='xs'>
        {messages.multiTrackCount(index + 1, trackMetadatas.length)}
      </Text>
    </div>
  )
}

const MultiTrackFooter = () => {
  const scrollToTop = useContext(EditFormScrollContext)
  const [{ value: index }, , { setValue: setIndex }] = useField(
    'trackMetadatasIndex'
  )
  const [{ value: trackMetadatas }] = useField('trackMetadatas')

  const goPrev = useCallback(() => {
    setIndex(Math.max(index - 1, 0))
    scrollToTop()
  }, [index, scrollToTop, setIndex])
  const goNext = useCallback(() => {
    setIndex(Math.min(index + 1, trackMetadatas.length - 1))
    scrollToTop()
  }, [index, scrollToTop, setIndex, trackMetadatas.length])

  const prevDisabled = index === 0
  const nextDisabled = index === trackMetadatas.length - 1
  return (
    <div className={cn(styles.multiTrackFooter, layoutStyles.row)}>
      <PlainButton
        iconLeft={IconCaretLeft}
        onClick={goPrev}
        disabled={prevDisabled}
        type='button'
      >
        {messages.prev}
      </PlainButton>
      <PlainButton
        iconRight={IconCaretRight}
        onClick={goNext}
        disabled={nextDisabled}
        type='button'
      >
        {messages.next}
      </PlainButton>
    </div>
  )
}
