import { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  TextInputProps,
} from 'react-native'
import { Theme } from '@/shared/constants/colors'
import { FontFamily, FontSize } from '@/shared/constants/typography'
import { Spacing, Radius } from '@/shared/constants/spacing'

interface AuthInputProps extends TextInputProps {
  label: string
  theme: Theme
}

export function AuthInput({ label, theme, secureTextEntry, ...props }: AuthInputProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [isVisible, setIsVisible] = useState(false)

  return (
    <View style={styles.wrapper}>
      <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
      <View
        style={[
          styles.inputContainer,
          {
            backgroundColor: theme.surface,
            borderColor: isFocused ? theme.text : theme.border,
          },
        ]}
      >
        <TextInput
          style={[styles.input, { color: theme.text }]}
          placeholderTextColor={theme.textTertiary}
          secureTextEntry={secureTextEntry && !isVisible}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          autoCorrect={false}
          {...props}
        />
        {secureTextEntry && (
          <Pressable
            onPress={() => setIsVisible(v => !v)}
            hitSlop={8}
            style={styles.eyeButton}
          >
            <Text style={[styles.eyeIcon, { color: theme.textTertiary }]}>
              {isVisible ? '👁' : '👁‍🗨'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: { gap: Spacing.xs },
  label: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    marginLeft: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.lg,
  },
  input: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.md,
    height: '100%',
  },
  eyeButton: { marginLeft: Spacing.sm },
  eyeIcon: { fontSize: 16 },
})