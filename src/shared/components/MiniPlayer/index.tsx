import { Pressable, View, Text, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import { useColorScheme } from 'react-native'
import { Image } from 'expo-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated'
import { Play, Pause, X, BookOpen } from 'lucide-react-native'
import { usePlayerStore } from '@/features/player/store/playerStore'
import { useLibraryStore } from '@/features/library/store/libraryStore'
import { Colors, Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'

export function MiniPlayer() {
  const colorScheme = useColorScheme()
  const theme: Theme = Colors[colorScheme === 'dark' ? 'dark' : 'light']
  const insets = useSafeAreaInsets()

  const { isVisible, isPlaying, libraryItemId, setPlaying } = usePlayerStore()
  const { items } = useLibraryStore()

  if (!isVisible || !libraryItemId) return null

  const currentBook = items.find(item => item.id === libraryItemId)
  if (!currentBook) return null

  const tabBarHeight = 80 + (insets.bottom || 0)

  return (
    <Animated.View
      entering={FadeInDown.springify()}
      exiting={FadeOutDown.springify()}
      style={[styles.wrapper, { bottom: tabBarHeight + Spacing.sm }]}
    >
      <Pressable onPress={() => router.push('/player')}>
        <BlurView
          intensity={90}
          tint={colorScheme === 'dark' ? 'dark' : 'light'}
          style={[
            styles.container,
            {
              borderColor: theme.border,
              backgroundColor: theme.tabBar,
            },
          ]}
        >
          {currentBook.cover_url ? (
            <Image source={{ uri: currentBook.cover_url }} style={styles.cover} contentFit="cover" />
          ) : (
            <View style={[styles.cover, styles.placeholderCover, { backgroundColor: theme.backgroundSecondary }]}>
              <BookOpen size={20} color={theme.textTertiary} />
            </View>
          )}

          <View style={styles.info}>
            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
              {currentBook.title}
            </Text>
            <Text style={[styles.author, { color: theme.textSecondary }]} numberOfLines={1}>
              {currentBook.author}
            </Text>
          </View>

          <View style={styles.controls}>
            <Pressable
              style={styles.controlButton}
              hitSlop={8}
              onPress={() => setPlaying(!isPlaying)}
            >
              {isPlaying ? (
                <Pause size={18} color={theme.text} fill={theme.text} />
              ) : (
                <Play size={18} color={theme.text} fill={theme.text} />
              )}
            </Pressable>

            <Pressable
              style={styles.controlButton}
              hitSlop={8}
              onPress={() => {
                const { reset } = usePlayerStore.getState()
                reset()
              }}
            >
              <X size={18} color={theme.textTertiary} />
            </Pressable>
          </View>
        </BlurView>
      </Pressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    left: Spacing.lg,
    right: Spacing.lg,
    zIndex: 100,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    overflow: 'hidden',
    paddingRight: Spacing.md,
    gap: Spacing.md,
  },
  cover: {
    width: 52,
    height: 52,
  },
  placeholderCover: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
  author: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  controlButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
})