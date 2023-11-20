import { useDispatch } from 'react-redux'

import { configureMetaMask } from 'common/store/pages/signon/actions'
import MetaMaskModal from 'pages/sign-on/components/desktop/MetaMaskModal'

const META_MASK_SETUP_URL =
  'https://help.audius.co/help/Configuring-MetaMask-For-Use-With-Audius-2d446'

type ConnectedMetaMaskModalProps = {
  open: boolean
  onBack: () => void
  onSuccess: () => void
}

const ConnectedMetaMaskModal = ({
  open,
  onBack,
  onSuccess
}: ConnectedMetaMaskModalProps) => {
  const dispatch = useDispatch()

  const handleClickReadConfig = () => {
    const win = window.open(META_MASK_SETUP_URL, '_blank')
    if (win) win.focus()
  }

  const handleConfigureWithMetamask = () => {
    dispatch(configureMetaMask())
    onSuccess()
  }

  return (
    <MetaMaskModal
      open={open}
      onClickReadConfig={handleClickReadConfig}
      onClickBack={onBack}
      onClickContinue={handleConfigureWithMetamask}
    />
  )
}

export default ConnectedMetaMaskModal