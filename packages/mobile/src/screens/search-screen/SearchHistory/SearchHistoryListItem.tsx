import { useCallback } from 'react'

import { fetchSearch } from '@audius/web/src/common/store/search-bar/actions'
import { View } from 'react-native'
import { TouchableHighlight } from 'react-native-gesture-handler'
import { useDispatch } from 'react-redux'

import { IconArrowRight } from '@audius/harmony-native'
import { Text } from 'app/components/core'
import { useNavigation } from 'app/hooks/useNavigation'
import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

const useStyles = makeStyles(({ spacing }) => ({
  itemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: spacing(3),
    height: spacing(10)
  },
  itemTextContainer: {
    flex: 1
  }
}))

type SearchHistoryListItemProps = {
  text: string
}

export const SearchHistoryListItem = (props: SearchHistoryListItemProps) => {
  const { text } = props
  const styles = useStyles()
  const navigation = useNavigation()
  const { neutralLight8 } = useThemeColors()
  const dispatch = useDispatch()

  const handlePress = useCallback(() => {
    if (text.startsWith('#')) {
      navigation.push('TagSearch', { query: text })
    } else {
      dispatch(fetchSearch(text))
    }
  }, [dispatch, text, navigation])

  return (
    <TouchableHighlight
      underlayColor={neutralLight8}
      activeOpacity={0.8}
      onPress={handlePress}
    >
      <View style={styles.itemContainer}>
        <View style={styles.itemTextContainer}>
          <Text numberOfLines={1} variant='body1'>
            {text}
          </Text>
        </View>
        <IconArrowRight size='s' color='subdued' />
      </View>
    </TouchableHighlight>
  )
}
