import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { BookOpen, Check } from 'lucide-react-native'
import { Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'
import { CARD_WIDTH } from '@/features/discover/constants'
import type { Book } from '@/shared/types/book'

const PLACEHOLDER_COLORS = ['#C9B99A', '#A8B5C2', '#B5C4A8', '#C4A8B5', '#A8C4C0']

interface DiscoverBookCardProps {
  item: Book
  index: number
  onPress: () => void
  isInLibrary: boolean
  theme: Theme
}

export function DiscoverBookCard({ item, index, onPress, isInLibrary, theme }: DiscoverBookCardProps) {
  const placeholderColor = PLACEHOLDER_COLORS[index % PLACEHOLDER_COLORS.length]

  return (
    <Animated.View entering={FadeInDown.delay(index * 40).springify()}>
      <Pressable style={styles.card} onPress={onPress}>
        <View>
          {item.cover_url ? (
            <Image
              source={{ uri: item.cover_url }}
              style={[styles.cover, { backgroundColor: theme.backgroundSecondary }]}
              contentFit="cover"
            />
          ) : (
            <View style={[styles.cover, styles.placeholderCover, { backgroundColor: placeholderColor + '33' }]}>
              <BookOpen size={32} color={theme.textTertiary} />
            </View>
          )}
          {isInLibrary && (
            <View style={[styles.badge, { backgroundColor: theme.text }]}>
              <Check size={12} color={theme.background} />
            </View>
          )}
        </View>
        <View style={styles.info}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={2}>{item.title}</Text>
          <Text style={[styles.author, { color: theme.textTertiary }]} numberOfLines={1}>{item.author}</Text>
        </View>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: { width: CARD_WIDTH, gap: Spacing.sm },
  cover: { width: CARD_WIDTH, height: CARD_WIDTH * 1.5, borderRadius: Radius.md },
  placeholderCover: { alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute', top: Spacing.sm, right: Spacing.sm,
    width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center',
  },
  info: { gap: 3 },
  title: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, lineHeight: FontSize.sm * 1.4 },
  author: { fontFamily: FontFamily.regular, fontSize: FontSize.xs },
})