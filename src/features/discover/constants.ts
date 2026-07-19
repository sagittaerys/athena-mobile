import { Dimensions } from 'react-native'
import { Spacing } from '@/shared/constants/spacing'

const { width } = Dimensions.get('window')
export const DISCOVER_PADDING = Spacing.xl
export const DISCOVER_COLUMN_GAP = Spacing.md
export const CARD_WIDTH = (width - DISCOVER_PADDING * 2 - DISCOVER_COLUMN_GAP) / 2