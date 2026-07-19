import { useState, useRef, useCallback, useEffect } from 'react'
import { TextInput, Pressable, ActivityIndicator, StyleSheet } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming, interpolateColor } from 'react-native-reanimated'
import { Search, X } from 'lucide-react-native'
import { Theme } from '@/shared/constants/colors'
import { Spacing, Radius } from '@/shared/constants/spacing'
import { FontFamily, FontSize } from '@/shared/constants/typography'

const DEBOUNCE_MS = 500
const MIN_CHARS = 3

interface SearchBarProps {
  initialValue?: string
  onDebouncedChange: (text: string) => void
  theme: Theme
}

export function SearchBar({ initialValue = '', onDebouncedChange, theme }: SearchBarProps) {
  const [text, setText] = useState(initialValue)
  const [isPending, setIsPending] = useState(false)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const focusProgress = useSharedValue(0)

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const handleChange = useCallback((value: string) => {
    setText(value)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)

    if (value.length === 0) {
      setIsPending(false)
      onDebouncedChange('')
      return
    }

    if (value.length < MIN_CHARS) {
      setIsPending(false)
      return
    }

    setIsPending(true)
    timeoutRef.current = setTimeout(() => {
      setIsPending(false)
      onDebouncedChange(value)
    }, DEBOUNCE_MS)
  }, [onDebouncedChange])

  const handleClear = useCallback(() => {
    setText('')
    setIsPending(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    onDebouncedChange('')
  }, [onDebouncedChange])

  const animatedContainerStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focusProgress.value, [0, 1], [theme.border, theme.text]),
    shadowOpacity: focusProgress.value * 0.18,
  }))

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: theme.backgroundSecondary, shadowColor: theme.text },
        animatedContainerStyle,
      ]}
    >
      <Search size={16} color={theme.textTertiary} />
      <TextInput
        style={[styles.input, { color: theme.text }]}
        placeholder="Search books, authors..."
        placeholderTextColor={theme.textTertiary}
        value={text}
        onChangeText={handleChange}
        onFocus={() => { focusProgress.value = withTiming(1, { duration: 200 }) }}
        onBlur={() => { focusProgress.value = withTiming(0, { duration: 200 }) }}
        returnKeyType="search"
        autoCorrect={false}
      />
      {isPending ? (
        <ActivityIndicator size="small" color={theme.textTertiary} />
      ) : text.length > 0 ? (
        <Pressable onPress={handleClear} hitSlop={8}>
          <X size={16} color={theme.textTertiary} />
        </Pressable>
      ) : null}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: Radius.full,
    borderWidth: 1.5,
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    elevation: 0,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    height: '100%',
  },
})