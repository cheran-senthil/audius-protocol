import { useCallback } from 'react'

import { welcomeModalMessages } from '@audius/common/messages'
import { settingsPageActions } from '@audius/common/store'
import { fillString } from '@audius/common/utils'
import { setWelcomeModalShown } from '@audius/web/src/common/store/pages/signon/actions'
import { getNameField } from '@audius/web/src/common/store/pages/signon/selectors'
import { css } from '@emotion/native'
import { useDispatch, useSelector } from 'react-redux'
import { useEffectOnce } from 'react-use'

import {
  Button,
  Flex,
  IconArrowRight,
  IconCloudUpload,
  Text
} from '@audius/harmony-native'
import { NativeDrawer } from 'app/components/drawer'
import { useDrawer } from 'app/hooks/useDrawer'
import { useNavigation } from 'app/hooks/useNavigation'

import {
  ReadOnlyCoverPhotoBanner,
  ReadOnlyProfilePicture
} from './AccountHeader'

const { requestPushNotificationPermissions } = settingsPageActions

export const WelcomeDrawer = () => {
  const { value: displayName } = useSelector(getNameField)
  const navigation = useNavigation()
  const { onClose: closeDrawer } = useDrawer('Welcome')
  const dispatch = useDispatch()

  useEffectOnce(() => {
    dispatch(setWelcomeModalShown(true))
  })

  const openNotificationsDrawer = useCallback(() => {
    dispatch(requestPushNotificationPermissions())
  }, [dispatch])

  const handleClose = useCallback(() => {
    closeDrawer()
    openNotificationsDrawer()
  }, [closeDrawer, openNotificationsDrawer])

  return (
    <NativeDrawer drawerName='Welcome' onClose={openNotificationsDrawer}>
      <Flex w='100%' h={96} style={css({ zIndex: 1 })}>
        <ReadOnlyCoverPhotoBanner />
        <Flex
          w='100%'
          alignItems='center'
          style={css({
            position: 'absolute',
            top: 40,
            zIndex: 2
          })}
        >
          <ReadOnlyProfilePicture />
        </Flex>
      </Flex>

      <Flex direction='column' p='xl' pt='3xl' gap='xl'>
        <Flex direction='column' alignItems='center' gap='l'>
          <Text
            variant='label'
            size='xl'
            strength='strong'
            id='welcome-title'
            color='accent'
            textAlign='center'
          >
            {fillString(
              welcomeModalMessages.welcome,
              displayName ? `, ${displayName}` : ''
            )}
          </Text>
          <Text variant='body' size='l'>
            {welcomeModalMessages.youreIn}
          </Text>
        </Flex>
        <Flex direction='column' gap='s'>
          <Button iconRight={IconArrowRight} onPress={handleClose} fullWidth>
            {welcomeModalMessages.startListening}
          </Button>
          <Button
            iconRight={IconCloudUpload}
            variant='tertiary'
            onPress={() => {
              handleClose()
              navigation.navigate('HomeStack', {
                screen: 'App',
                params: { screen: 'Upload' }
              })
            }}
            fullWidth
          >
            {welcomeModalMessages.upload}
          </Button>
        </Flex>
      </Flex>
    </NativeDrawer>
  )
}
