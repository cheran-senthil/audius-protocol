import type { StringWei } from '@audius/common/models'
import { stringWeiToBN, formatWei } from '@audius/common/utils'
import { View } from 'react-native'

import { IconTipping } from '@audius/harmony-native'
import { AudioText, Text } from 'app/components/core'
import { makeStyles } from 'app/styles'
import { useThemeColors } from 'app/utils/theme'

const useStyles = makeStyles(({ spacing, typography }) => ({
  root: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing(1)
  },
  amount: {
    marginLeft: spacing(1.5),
    marginRight: spacing(1),
    fontSize: typography.fontSize.small
  },
  audioText: {
    fontSize: typography.fontSize.small
  }
}))

type TipProps = {
  amount: StringWei
}

export const Tip = (props: TipProps) => {
  const { amount } = props
  const styles = useStyles()
  const { neutralLight4 } = useThemeColors()

  return (
    <View style={styles.root}>
      <IconTipping fill={neutralLight4} height={15} width={15} />
      <Text style={styles.amount} color='neutralLight4' weight='bold'>
        {formatWei(stringWeiToBN(amount))}
      </Text>
      <AudioText style={styles.audioText} color='neutralLight4' />
    </View>
  )
}
