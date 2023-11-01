import { useCallback, MouseEvent, ComponentPropsWithoutRef } from 'react'

import cn from 'classnames'

import { Text, TextProps } from '../typography'

import styles from './Link.module.css'

type LinkProps = TextProps &
  ComponentPropsWithoutRef<'a'> & {
    stopPropagation?: boolean
  }

export const Link = (props: LinkProps) => {
  const {
    className,
    onClick,
    stopPropagation = true,
    children,
    ...other
  } = props

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      onClick?.(e)
      if (stopPropagation) {
        e.stopPropagation()
      }
    },
    [onClick, stopPropagation]
  )

  return (
    // @ts-ignore TODO figure out refs for text
    <Text className={cn(styles.root, className)} {...other} asChild>
      <a onClick={handleClick}>{children}</a>
    </Text>
  )
}