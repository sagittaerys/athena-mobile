import { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native'
import { router } from 'expo-router'
import { useColorScheme } from 'react-native'
import { Image } from 'expo-image'
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated'
import { useAuthStore } from '@/features/auth/store/authStore'
import { Colors, Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'
import { AuthInput } from '@/features/auth/components/AuthInput'

const { width, height } = Dimensions.get('window')

const TOP_BOOK = 'https://www.gutenberg.org/cache/epub/1232/pg1232.cover.medium.jpg'
const BOTTOM_BOOK = 'https://www.gutenberg.org/cache/epub/1342/pg1342.cover.medium.jpg'

export default function RegisterScreen() {
  const colorScheme = useColorScheme()
  const theme: Theme = Colors[colorScheme === 'dark' ? 'dark' : 'light']
  const { register, isLoading, error, clearError } = useAuthStore()

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleRegister = async () => {
    if (!email || !username || !password) return
    try {
      await register({
        email: email.trim().toLowerCase(),
        username: username.trim(),
        password,
      })
      router.replace('/(auth)/voice-setup')
    } catch {}
  }

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* book covers */}
      <Animated.View
        entering={FadeInDown.delay(100).springify()}
        style={styles.topBookContainer}
      >
        <Image
          source={{ uri: TOP_BOOK }}
          style={styles.topBook}
          contentFit="cover"
        />
        <View style={[styles.bookOverlay, { backgroundColor: theme.background }]} />
      </Animated.View>

      <Animated.View
        entering={FadeInUp.delay(100).springify()}
        style={styles.bottomBookContainer}
      >
        <Image
          source={{ uri: BOTTOM_BOOK }}
          style={styles.bottomBook}
          contentFit="cover"
        />
        <View style={[styles.bookOverlayBottom, { backgroundColor: theme.background }]} />
      </Animated.View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={16} style={styles.backButton}>
            <Text style={[styles.backText, { color: theme.textTertiary }]}>← Back</Text>
          </Pressable>
          <Text style={[styles.title, { color: theme.text }]}>Create your{'\n'}account.</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            Your voice is next.
          </Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.form}>
          {error && (
            <View style={[styles.errorBanner, { backgroundColor: '#FF3B3015' }]}>
              <Text style={styles.errorText}>{error}</Text>
              <Pressable onPress={clearError} hitSlop={8}>
                <Text style={styles.errorDismiss}>✕</Text>
              </Pressable>
            </View>
          )}

          <AuthInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            theme={theme}
          />

          <AuthInput
            label="Username"
            value={username}
            onChangeText={setUsername}
            placeholder="yourname"
            autoCapitalize="none"
            theme={theme}
          />

          <AuthInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Min. 8 characters"
            secureTextEntry
            theme={theme}
          />

          <Pressable
            style={[
              styles.primaryButton,
              { backgroundColor: theme.text },
              isLoading && { opacity: 0.6 },
            ]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            <Text style={[styles.primaryButtonText, { color: theme.background }]}>
              {isLoading ? 'Creating account...' : 'Create account'}
            </Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={[styles.footerText, { color: theme.textSecondary }]}>
              Already have an account?{' '}
            </Text>
            <Pressable onPress={() => router.replace('/(auth)/login')}>
              <Text style={[styles.footerLink, { color: theme.text }]}>Sign in</Text>
            </Pressable>
          </View>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBookContainer: {
    position: 'absolute',
    top: -20,
    right: -24,
    zIndex: 0,
  },
  topBook: {
    width: width * 0.38,
    height: height * 0.26,
    borderRadius: Radius.md,
    transform: [{ rotate: '8deg' }],
  },
  bookOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '40%',
    opacity: 0.95,
  },
  bottomBookContainer: {
    position: 'absolute',
    bottom: -20,
    left: -24,
    zIndex: 0,
  },
  bottomBook: {
    width: width * 0.32,
    height: height * 0.22,
    borderRadius: Radius.md,
    transform: [{ rotate: '-6deg' }],
  },
  bookOverlayBottom: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '40%',
    opacity: 0.95,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.xxxl,
    zIndex: 1,
  },
  header: { gap: Spacing.sm, marginBottom: Spacing.xxxl },
  backButton: { marginBottom: Spacing.xl },
  backText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  title: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.display,
    lineHeight: FontSize.display * 1.1,
  },
  subtitle: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    marginTop: Spacing.sm,
  },
  form: { gap: Spacing.lg },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: Radius.md,
  },
  errorText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: '#FF3B30',
    flex: 1,
  },
  errorDismiss: {
    color: '#FF3B30',
    fontSize: FontSize.sm,
    marginLeft: Spacing.sm,
  },
  primaryButton: {
    height: 56,
    borderRadius: Radius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
  },
  primaryButtonText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
  },
  footerLink: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
  },
})
