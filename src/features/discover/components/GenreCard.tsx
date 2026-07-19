import { View, Text, Pressable, StyleSheet } from 'react-native'
import { Image } from 'expo-image'
import { BookOpen } from 'lucide-react-native'
import { Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'
import { CARD_WIDTH } from '@/features/discover/constants'

interface GenreCardProps {
  genre: string
  coverUrl: string | null | undefined
  onPress: () => void
  theme: Theme
}

export function GenreCard({ genre, coverUrl, onPress, theme }: GenreCardProps) {
  return (
    <Pressable
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
      onPress={onPress}
    >
      {coverUrl ? (
        <Image source={{ uri: coverUrl }} style={styles.thumb} contentFit="cover" />
      ) : (
        <View style={[styles.thumb, styles.thumbPlaceholder, { backgroundColor: theme.backgroundSecondary }]}>
          <BookOpen size={20} color={theme.textTertiary} />
        </View>
      )}
      <Text style={[styles.label, { color: theme.text }]} numberOfLines={1}>{genre}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: Radius.lg,
    borderWidth: 0.5,
  },
  thumb: { width: 48, height: 48, borderRadius: Radius.md },
  thumbPlaceholder: { alignItems: 'center', justifyContent: 'center' },
  label: { flex: 1, fontFamily: FontFamily.medium, fontSize: FontSize.sm },
})