import { View, Text, Pressable, StyleSheet } from 'react-native'
import { ChevronLeft } from 'lucide-react-native'
import { SearchBar } from './SearchBar'
import { Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing } from '@/shared/constants/spacing'

interface DiscoverHeaderProps {
  title: string
  showBack?: boolean
  onBack?: () => void
  searchValue: string
  onSearchChange: (text: string) => void
  theme: Theme
}

export function DiscoverHeader({
  title, showBack, onBack, searchValue, onSearchChange, theme,
}: DiscoverHeaderProps) {
  return (
    <View style={styles.header}>
      {showBack ? (
        <Pressable onPress={onBack} hitSlop={12} style={styles.backRow}>
          <ChevronLeft size={29} color={theme.text} />
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
        </Pressable>
      ) : (
        <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
      )}
      <SearchBar initialValue={searchValue} onDebouncedChange={onSearchChange} theme={theme} />
    </View>
  )
}

const styles = StyleSheet.create({
  header: { gap: Spacing.lg, marginBottom: Spacing.xl },
  backRow: { flexDirection: 'row', alignItems: 'center', gap: 2 },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xxl,
  },
})