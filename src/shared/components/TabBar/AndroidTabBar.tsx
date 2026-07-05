import { useEffect } from 'react'
import { View, Text, Pressable, StyleSheet } from 'react-native'
import { BottomTabBarProps } from "expo-router/js-tabs"
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { Library, Compass, CircleUserRound, LucideIcon } from 'lucide-react-native'
import { Colors, Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'

const TABS: { name: string; label: string; Icon: LucideIcon }[] = [
  { name: 'index', label: 'Library', Icon: Library },
  { name: 'discover', label: 'Discover', Icon: Compass },
  { name: 'me', label: 'Me', Icon: CircleUserRound },
]

interface AndroidTabBarProps extends BottomTabBarProps {
  theme: Theme
}

export function AndroidTabBar({ state, descriptors, navigation, theme }: AndroidTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.wrapper, { paddingBottom: insets.bottom || Spacing.lg }]}>
      <BlurView
        intensity={80}
        tint={theme === Colors.dark ? 'dark' : 'light'}
        style={[
          styles.container,
          {
            borderColor: theme.tabBarBorder,
            backgroundColor: theme.tabBar,
          },
        ]}
      >
        {state.routes.map((route, index) => {
          const isFocused = state.index === index
          const tab = TABS[index]

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }

          return (
            <TabItem
              key={route.key}
              label={tab.label}
              Icon={tab.Icon}
              isFocused={isFocused}
              onPress={onPress}
              theme={theme}
            />
          )
        })}
      </BlurView>
    </View>
  )
}

function TabItem({
  label,
  Icon,
  isFocused,
  onPress,
  theme,
}: {
  label: string
  Icon: LucideIcon
  isFocused: boolean
  onPress: () => void
  theme: Theme
}) {
  const scale = useSharedValue(1)
  const dotOpacity = useSharedValue(isFocused ? 1 : 0)

  const animatedIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))

  const animatedDotStyle = useAnimatedStyle(() => ({
    opacity: dotOpacity.value,
    transform: [
      {
        scaleX: interpolate(dotOpacity.value, [0, 1], [0, 1], Extrapolation.CLAMP),
      },
    ],
  }))

  const handlePress = () => {
    scale.value = withSpring(0.85, { damping: 10, stiffness: 300 }, () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 })
    })
    onPress()
  }


  useEffect(() => {
    dotOpacity.value = withSpring(isFocused ? 1 : 0, { damping: 15, stiffness: 200 })
  }, [isFocused, dotOpacity])

  return (
    <Pressable onPress={handlePress} style={styles.tabItem} hitSlop={8}>
      <Animated.View style={animatedIconStyle}>
        <Icon
          size={22}
          color={isFocused ? theme.tabBarActive : theme.tabBarInactive}
          strokeWidth={isFocused ? 2.5 : 2}
        />
      </Animated.View>

      <Text
        style={[
          styles.label,
          {
            color: isFocused ? theme.tabBarActive : theme.tabBarInactive,
            fontFamily: isFocused ? FontFamily.medium : FontFamily.regular,
          },
        ]}
      >
        {label}
      </Text>

      <Animated.View
        style={[styles.activeDot, { backgroundColor: theme.tabBarActive }, animatedDotStyle]}
      />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: Spacing.lg,
  },
  container: {
    flexDirection: 'row',
    borderRadius: Radius.xl,
    borderWidth: 0.5,
    overflow: 'hidden',
    paddingVertical: Spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    gap: 3,
    position: 'relative',
  },
  label: {
    fontSize: FontSize.xs,
  },
  activeDot: {
    position: 'absolute',
    bottom: -2,
    width: 4,
    height: 4,
    borderRadius: Radius.full,
  },
})