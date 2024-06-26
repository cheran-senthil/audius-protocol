import { useEffect } from 'react'

import { useProxySelector } from '@audius/common/hooks'
import { Status } from '@audius/common/models'
import { explorePageSelectors, explorePageActions } from '@audius/common/store'
import { useDispatch, useSelector } from 'react-redux'

import { UserList } from 'app/components/user-list'

import { TabInfo } from '../components/TabInfo'
const { getExploreArtists, getExploreStatus, getArtistsStatus } =
  explorePageSelectors

const { fetchProfiles } = explorePageActions

const messages = {
  infoHeader: 'Featured Artists'
}

export const ArtistsTab = () => {
  const artists = useProxySelector(getExploreArtists, [])
  const exploreStatus = useSelector(getExploreStatus)
  const artistsStatus = useSelector(getArtistsStatus)
  const dispatch = useDispatch()

  useEffect(() => {
    if (exploreStatus === Status.SUCCESS) {
      dispatch(fetchProfiles())
    }
  }, [exploreStatus, dispatch])

  return (
    <UserList
      isLoading={
        exploreStatus === Status.LOADING || artistsStatus !== Status.SUCCESS
      }
      ListHeaderComponent={<TabInfo header={messages.infoHeader} />}
      profiles={artists}
    />
  )
}
