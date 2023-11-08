import type {
  BackgroundColors,
  BorderColors,
  CornerRadiusOptions,
  ShadowOptions
} from 'foundations'

export type PaperProps = {
  /**
   * Background Color
   * @default white
   */
  backgroundColor?: Exclude<BackgroundColors, 'default'>

  /**
   * Border type. If not provided, no border will be used.
   * @default default
   */
  border?: BorderColors

  /**
   * Border Radius
   * @default m
   */
  borderRadius?: CornerRadiusOptions

  /**
   * Elevation Shadow
   * @default mid
   */
  shadow?: Exclude<ShadowOptions, 'drop'>
}