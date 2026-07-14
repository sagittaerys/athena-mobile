import { useCallback, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Switch,
  Alert,
  useColorScheme,
} from 'react-native'
import { router } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { ChevronRight, Check, Clock, X } from 'lucide-react-native'
import { useAuthStore } from '@/features/auth/store/authStore'
import { usePlayerStore } from '@/features/player/store/playerStore'
import { MiniPlayer } from '@/shared/components/MiniPlayer'
import { Colors, Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'

function SettingsRow({
  label,
  value,
  icon,
  onPress,
  destructive = false,
  rightElement,
  theme,
}: {
  label: string
  value?: string
  icon?: React.ReactNode
  onPress?: () => void
  destructive?: boolean
  rightElement?: React.ReactNode
  theme: Theme
}) {
  return (
    <Pressable
      style={[styles.row, { borderBottomColor: theme.border }]}
      onPress={onPress}
      disabled={!onPress && !rightElement}
    >
      <Text
        style={[
          styles.rowLabel,
          { color: destructive ? '#FF3B30' : theme.text },
        ]}
      >
        {label}
      </Text>
      <View style={styles.rowRight}>
        {icon}
        {value && (
          <Text style={[styles.rowValue, { color: theme.textTertiary }]}>
            {value}
          </Text>
        )}
        {rightElement}
        {onPress && !rightElement && <ChevronRight size={16} color={theme.textTertiary} />}
      </View>
    </Pressable>
  )
}

function Section({
  title,
  children,
  theme,
}: {
  title: string
  children: React.ReactNode
  theme: Theme
}) {
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: theme.textTertiary }]}>{title}</Text>
      <View style={[styles.sectionCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {children}
      </View>
    </View>
  )
}

function Avatar({ username, theme }: { username: string; theme: Theme }) {
  const initials = username.slice(0, 2).toUpperCase()
  return (
    <View style={[styles.avatar, { backgroundColor: theme.backgroundSecondary }]}>
      <Text style={[styles.avatarText, { color: theme.text }]}>{initials}</Text>
    </View>
  )
}

export default function MeScreen() {
  const colorScheme = useColorScheme()
  const theme: Theme = Colors[colorScheme === 'dark' ? 'dark' : 'light']
  const insets = useSafeAreaInsets()

  const { user, voiceProfile, logout } = useAuthStore()
  const { isVisible: playerVisible } = usePlayerStore()
  const [isDark, setIsDark] = useState(colorScheme === 'dark')

  const handleLogout = useCallback(() => {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign out',
        style: 'destructive',
        onPress: async () => {
          await logout()
          router.replace('/(auth)/welcome')
        },
      },
    ])
  }, [logout])

  const handleRerecordVoice = useCallback(() => {
    Alert.alert(
      'Re-record voice',
      'This will replace your current voice profile. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Continue',
          onPress: () => router.push('/(auth)/voice-setup'),
        },
      ]
    )
  }, [])

  const voiceStatusText =
    voiceProfile?.status === 'ready' ? 'Ready' :
    voiceProfile?.status === 'pending' ? 'Processing' :
    voiceProfile?.status === 'failed' ? 'Failed' :
    'Not set up'

  const voiceStatusIcon =
    voiceProfile?.status === 'ready' ? <Check size={16} color="#34C759" /> :
    voiceProfile?.status === 'pending' ? <Clock size={16} color={theme.textTertiary} /> :
    voiceProfile?.status === 'failed' ? <X size={16} color="#FF3B30" /> :
    null

  const bottomPadding = 80 + (playerVisible ? 72 : 0) + (insets.bottom || 0)

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.springify()} style={styles.profileHeader}>
          <Avatar username={user?.username ?? 'A'} theme={theme} />
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { color: theme.text }]}>
              {user?.username ?? 'Reader'}
            </Text>
            <Text style={[styles.profileEmail, { color: theme.textSecondary }]}>
              {user?.email}
            </Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(80).springify()}>
          <Section title="VOICE" theme={theme}>
            <SettingsRow
              label="Voice profile"
              value={voiceStatusText}
              icon={voiceStatusIcon}
              onPress={handleRerecordVoice}
              theme={theme}
            />
            {voiceProfile?.status === 'ready' && (
              <SettingsRow
                label="Re-record voice"
                onPress={handleRerecordVoice}
                theme={theme}
              />
            )}
          </Section>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(120).springify()}>
          <Section title="ACCOUNT" theme={theme}>
            <SettingsRow label="Username" value={user?.username} theme={theme} />
            <SettingsRow label="Email" value={user?.email} theme={theme} />
            <SettingsRow label="Change password" onPress={() => {}} theme={theme} />
          </Section>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(160).springify()}>
          <Section title="APPEARANCE" theme={theme}>
            <SettingsRow
              label="Dark mode"
              theme={theme}
              rightElement={
                <Switch
                  value={isDark}
                  onValueChange={setIsDark}
                  trackColor={{ false: theme.border, true: theme.text }}
                  thumbColor={theme.background}
                />
              }
            />
          </Section>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(200).springify()}>
          <Section title="ABOUT" theme={theme}>
            <SettingsRow label="Version" value="1.0.0" theme={theme} />
            <SettingsRow
              label="Open source"
              value="github.com/sagittaerys"
              onPress={() => {}}
              theme={theme}
            />
            <SettingsRow label="Acknowledgements" onPress={() => {}} theme={theme} />
          </Section>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(240).springify()}>
          <Section title="" theme={theme}>
            <SettingsRow label="Sign out" onPress={handleLogout} destructive theme={theme} />
          </Section>
        </Animated.View>
      </ScrollView>

      <MiniPlayer />
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: {
    paddingHorizontal: Spacing.xl,
    paddingTop: 60,
    gap: Spacing.xl,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
  },
  profileInfo: { gap: 4 },
  profileName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xl,
  },
  profileEmail: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  section: { gap: Spacing.sm },
  sectionTitle: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    letterSpacing: 0.8,
    marginLeft: Spacing.sm,
  },
  sectionCard: {
    borderRadius: Radius.lg,
    borderWidth: 0.5,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
  },
  rowLabel: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
  },
  rowRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  rowValue: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
})