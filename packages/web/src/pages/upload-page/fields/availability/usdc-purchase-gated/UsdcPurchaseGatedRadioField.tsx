import {
  FeatureFlags,
  PremiumConditions,
  TrackAvailabilityType,
  isPremiumContentUSDCPurchaseGated
} from '@audius/common'
import { IconCart, IconStars } from '@audius/stems'

import { ExternalLink } from 'components/link'
import { ModalRadioItem } from 'components/modal-radio/ModalRadioItem'
import { useFlag } from 'hooks/useRemoteConfig'

import { UsdcPurchaseFields } from './UsdcPurchaseFields'
import styles from './UsdcPurchaseGatedRadioField.module.css'

const WAITLIST_TYPEFORM = 'https://example.com'

const messages = {
  usdcPurchase: 'Premium (Pay-to-Unlock)',
  usdcPurchaseSubtitle:
    'Unlockable by purchase, these tracks are visible to everyone but only playable by users who have paid for access.',
  waitlist:
    'Start selling your music on Audius today! Limited access beta now available.',
  join: 'Join the Waitlist',
  comingSoon: 'Coming Soon'
}

type UsdcPurchaseGatedRadioFieldProps = {
  isUpload?: boolean
  initialPremiumConditions?: PremiumConditions
  isInitiallyUnlisted?: boolean
}

export const UsdcPurchaseGatedRadioField = (
  props: UsdcPurchaseGatedRadioFieldProps
) => {
  const { isUpload, initialPremiumConditions, isInitiallyUnlisted } = props

  const { isEnabled: isUsdcUploadEnabled } = useFlag(
    FeatureFlags.USDC_PURCHASES_UPLOAD
  )

  const noUsdcPurchase =
    !isUpload &&
    !isPremiumContentUSDCPurchaseGated(initialPremiumConditions) &&
    !isInitiallyUnlisted

  const disabled = noUsdcPurchase || !isUsdcUploadEnabled

  const helpContent = (
    <div className={styles.helpContent}>
      <div>{messages.waitlist}</div>
      <ExternalLink
        className={styles.link}
        to={WAITLIST_TYPEFORM}
        target='_blank'
        ignoreWarning
      >
        {messages.join}
      </ExternalLink>
    </div>
  )

  return (
    <ModalRadioItem
      icon={<IconCart />}
      label={messages.usdcPurchase}
      description={messages.usdcPurchaseSubtitle}
      value={TrackAvailabilityType.USDC_PURCHASE}
      disabled={disabled}
      hintIcon={<IconStars />}
      hintContent={disabled ? helpContent : undefined}
      tag={messages.comingSoon}
      checkedContent={<UsdcPurchaseFields disabled={disabled} />}
    />
  )
}