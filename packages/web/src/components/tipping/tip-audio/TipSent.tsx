import { useCallback } from 'react'

import { Name } from '@audius/common/models'
import { deriveUserBankAddress } from '@audius/common/services'
import { accountSelectors, tippingSelectors } from '@audius/common/store'
import { formatNumberCommas } from '@audius/common/utils'
import { IconTwitter, IconCheck, Button } from '@audius/harmony'
import cn from 'classnames'

import { useSelector } from 'common/hooks/useSelector'
import { useRecord, make } from 'common/store/analytics/actions'
import { audiusBackendInstance } from 'services/audius-backend/audius-backend-instance'
import { env } from 'services/env'
import { openTwitterLink } from 'utils/tweet'

import { ProfileInfo } from '../../profile-info/ProfileInfo'

import styles from './TipAudio.module.css'
const { getSendTipData } = tippingSelectors
const getAccountUser = accountSelectors.getAccountUser

const messages = {
  sending: 'SENDING',
  sentSuccessfully: 'SENT SUCCESSFULLY',
  supportOnTwitter: 'Share your support on Twitter!',
  shareToTwitter: 'Share to Twitter',
  twitterCopyPrefix: 'I just tipped ',
  twitterCopySuffix: ' $AUDIO on @audius #Audius #AUDIOTip'
}

export const TipSent = () => {
  const record = useRecord()
  const account = useSelector(getAccountUser)
  const sendTipData = useSelector(getSendTipData)
  const { user: recipient, amount: sendAmount, source } = sendTipData

  const handleShareClick = useCallback(async () => {
    const formattedSendAmount = formatNumberCommas(sendAmount)
    if (account && recipient) {
      let recipientAndAmount = `${recipient.name} ${formattedSendAmount}`
      if (recipient.twitter_handle) {
        recipientAndAmount = `@${recipient.twitter_handle} ${formattedSendAmount}`
      }
      const message = `${messages.twitterCopyPrefix}${recipientAndAmount}${messages.twitterCopySuffix}`
      openTwitterLink(`${env.AUDIUS_URL}/${recipient.handle}`, message)

      const [senderWallet, recipientWallet] = await Promise.all([
        deriveUserBankAddress(audiusBackendInstance, {
          ethAddress: account.erc_wallet
        }),
        deriveUserBankAddress(audiusBackendInstance, {
          ethAddress: recipient.erc_wallet
        })
      ])

      record(
        make(Name.TIP_AUDIO_TWITTER_SHARE, {
          senderWallet,
          recipientWallet,
          senderHandle: account.handle,
          recipientHandle: recipient.handle,
          amount: sendAmount,
          device: 'web',
          source
        })
      )
    }
  }, [account, recipient, record, sendAmount, source])

  const renderSentAudio = () => (
    <div className={styles.modalContentHeader}>
      <div className={cn(styles.flexCenter, styles.modalContentHeaderTitle)}>
        <span className={styles.sentSuccessfullyIcon}>
          <IconCheck />
        </span>
        {messages.sentSuccessfully}
      </div>
      <div className={cn(styles.flexCenter, styles.modalContentHeaderSubtitle)}>
        <span className={styles.sendAmount}>{sendAmount}</span>
        $AUDIO
      </div>
    </div>
  )

  return recipient ? (
    <div className={styles.container}>
      {renderSentAudio()}
      <ProfileInfo
        user={recipient}
        className={styles.confirmReceiver}
        imgClassName={styles.smallDynamicPhoto}
      />
      <div className={cn(styles.flexCenter, styles.support)}>
        {messages.supportOnTwitter}
      </div>
      <div className={styles.flexCenter}>
        <Button
          variant='primary'
          color='blue'
          onClick={handleShareClick}
          iconLeft={IconTwitter}
        >
          {messages.shareToTwitter}
        </Button>
      </div>
    </div>
  ) : null
}
