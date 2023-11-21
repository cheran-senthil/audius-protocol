import { useEffect } from 'react'

import {
  Box,
  Flex,
  IconCloseAlt,
  Paper,
  Text,
  TextLink,
  useTheme
} from '@audius/harmony'
import { Link, Route, Switch } from 'react-router-dom'
import { useToggle } from 'react-use'

import djBackground from 'assets/img/2-DJ-4-3.jpg'
import djPortrait from 'assets/img/DJportrait.jpg'
import BackgroundWaves from 'components/background-animations/BackgroundWaves'
import { useMedia } from 'hooks/useMedia'
import { SignInPage } from 'pages/sign-in-page/SignInPage'
import { AudiusValues } from 'pages/sign-on-page/AudiusValues'
import SignUpPage from 'pages/sign-up-page'
import { SIGN_IN_PAGE, SIGN_UP_PAGE, TRENDING_PAGE } from 'utils/route'

const messages = {
  newToAudius: 'New to Audius?',
  createAccount: 'Create an Account'
}

export const SignOnPage = () => {
  const { isMobile } = useMedia()
  const [isExpanded] = useToggle(false)
  const [isLoaded, setIsLoaded] = useToggle(false)
  const { spacing, motion } = useTheme()

  useEffect(() => {
    setIsLoaded(true)
  }, [setIsLoaded])

  const routes = (
    <Switch>
      <Route path={SIGN_IN_PAGE}>
        <SignInPage />
      </Route>
      <Route path={SIGN_UP_PAGE}>
        <SignUpPage />
      </Route>
    </Switch>
  )

  if (isMobile) {
    return (
      <Flex direction='column' w='100%'>
        <Flex
          borderBottomLeftRadius={!isExpanded ? '2xl' : undefined}
          borderBottomRightRadius={!isExpanded ? '2xl' : undefined}
          css={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            backgroundColor: 'white',
            zIndex: 1,
            transition: `${motion.calm} 0.5s`,
            transform: isLoaded ? 'translateY(0px)' : 'translateY(-100%)'
          }}
        >
          <Link
            to={TRENDING_PAGE}
            css={{ position: 'absolute', left: spacing.l, top: spacing.l }}
          >
            <IconCloseAlt color='default' />
          </Link>
          {routes}
        </Flex>
        <Flex
          direction='column'
          alignItems='center'
          pb='2xl'
          css={{
            paddingTop: 520,
            flexGrow: 1,
            backgroundImage: `radial-gradient(77.16% 77.16% at 50% 51.81%, rgba(91, 35, 225, 0.80) 0%, rgba(113, 41, 230, 0.64) 67.96%, rgba(162, 47, 235, 0.50) 100%), url(${djPortrait})`,
            backgroundColor: 'lightgray',
            backgroundSize: 'cover',
            backgroundPosition: 'bottom'
          }}
        >
          <Switch>
            <Route path={SIGN_UP_PAGE}>
              <AudiusValues css={{ margin: 'auto' }} />
            </Route>
            <Route path={SIGN_IN_PAGE}>
              <Text
                variant='title'
                strength='weak'
                color='staticWhite'
                css={{
                  marginTop: 'auto',
                  opacity: isLoaded ? 1 : 0,
                  transition: `opacity ${motion.expressive} 1s`
                }}
              >
                {messages.newToAudius}{' '}
                <TextLink variant='inverted' showUnderline asChild>
                  <Link to={SIGN_UP_PAGE}>{messages.createAccount}</Link>
                </TextLink>
              </Text>
            </Route>
          </Switch>
        </Flex>
      </Flex>
    )
  }

  return (
    <Flex w='100%' p='unit20'>
      <Link
        to={TRENDING_PAGE}
        css={{
          zIndex: 1,
          position: 'absolute',
          left: spacing['2xl'],
          top: spacing['2xl']
        }}
      >
        <IconCloseAlt color='staticWhite' />
      </Link>
      <BackgroundWaves zIndex={0} />
      <Paper w='100%'>
        <Box
          w={isExpanded ? '100%' : 480}
          h='100%'
          css={{
            position: 'absolute',
            top: 0,
            left: 0,
            background: 'white',
            zIndex: 1,
            transition: `width ${motion.expressive}`
          }}
        >
          {routes}
        </Box>
        <Flex
          alignItems='center'
          justifyContent='center'
          css={{
            marginLeft: 480,
            flexGrow: 1,
            backgroundImage: `radial-gradient(77.16% 77.16% at 50% 51.81%, rgba(91, 35, 225, 0.80) 0%, rgba(113, 41, 230, 0.64) 67.96%, rgba(162, 47, 235, 0.50) 100%), url(${djBackground})`,
            backgroundColor: 'lightgray',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <AudiusValues />
        </Flex>
      </Paper>
    </Flex>
  )
}
