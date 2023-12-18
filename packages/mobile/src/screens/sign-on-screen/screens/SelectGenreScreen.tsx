import { memo, useCallback, useEffect, useState } from 'react'

import {
  GENRES,
  convertGenreLabelToValue,
  selectGenresPageMessages as messages,
  selectGenresSchema
} from '@audius/common'
import { setField } from 'common/store/pages/signon/actions'
import { Formik, useField } from 'formik'
import { ScrollView, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { toFormikValidationSchema } from 'zod-formik-adapter'

import { Flex, SelectablePill } from '@audius/harmony-native'
import { useNavigation } from 'app/hooks/useNavigation'

import { ReadOnlyAccountHeader } from '../components/AccountHeader'
import { Heading, Page, PageFooter, gutterSize } from '../components/layout'
import type { SignUpScreenParamList } from '../types'

const genres = GENRES.map((genre) => ({
  value: genre,
  label: convertGenreLabelToValue(genre)
}))

type Genre = typeof GENRES[number]
type SelectGenreValues = { genres: typeof GENRES }

const initialValues: SelectGenreValues = { genres: [] }

/* Memoized SelectablePill to fix a performance issue.
 * The code below is arranged so that the pills don't need to re-render,
 * And the memoization here is just forcing it to never re-render. */
const MemoSelectablePill = memo(SelectablePill, () => true)

const SelectGenreFieldArray = () => {
  // Storing values as state alongside Formik purely because setState provides access to the previous values
  const [formValues, setFormValues] = useState<SelectGenreValues['genres']>(
    initialValues.genres
  )
  const [, , { setValue }] = useField('genres')

  // Update formik state to match our React state
  useEffect(() => {
    setValue(formValues)
  }, [formValues, setValue])

  // memoized handle press just handles the React state change
  const handlePress = useCallback((genreValue: Genre) => {
    setFormValues((prevValues) => {
      const newValues = [...prevValues]
      const valueIndex = newValues.indexOf(genreValue)
      if (valueIndex > -1) {
        newValues.splice(valueIndex, 1)
      } else {
        newValues.push(genreValue)
      }
      return newValues
    })
  }, [])

  return (
    <ScrollView testID='genreScrollView'>
      <Flex gap='s' direction='row' wrap='wrap'>
        {genres.map((genre) => (
          <MemoSelectablePill
            label={genre.label}
            onPress={() => {
              handlePress(genre.value)
            }}
            size='large'
            key={genre.value}
          />
        ))}
      </Flex>
    </ScrollView>
  )
}

export const SelectGenreScreen = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation<SignUpScreenParamList>()

  const handleSubmit = useCallback(
    (values: SelectGenreValues) => {
      const genres = values.genres
      dispatch(setField('genres', genres))
      navigation.navigate('SelectArtists')
    },
    [dispatch, navigation]
  )

  return (
    <Formik
      initialValues={initialValues}
      onSubmit={handleSubmit}
      validateOnBlur
      validateOnChange
      validationSchema={toFormikValidationSchema(selectGenresSchema)}
    >
      {({ handleSubmit: triggerSubmit, dirty, isValid }) => (
        <View>
          <Page noGutter>
            <ReadOnlyAccountHeader />
            <Flex ph={gutterSize} gap='2xl'>
              <Heading
                heading={messages.header}
                description={messages.description}
              />
              <SelectGenreFieldArray />
            </Flex>
            <PageFooter
              buttonProps={{ disabled: !(dirty && isValid) }}
              onSubmit={triggerSubmit}
            />
          </Page>
        </View>
      )}
    </Formik>
  )
}