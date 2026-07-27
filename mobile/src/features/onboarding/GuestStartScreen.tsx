import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radii, spacing, typography } from '../../design/tokens';

type GuestStartScreenProps = {
  isStarting: boolean;
  onGuestStart: () => void;
};

export function GuestStartScreen({
  isStarting,
  onGuestStart,
}: GuestStartScreenProps) {
  return (
    <SafeAreaView
      edges={['top', 'right', 'bottom', 'left']}
      style={styles.safeArea}
    >
      <View style={styles.container}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>TODAY MENU</Text>
        </View>

        <View style={styles.copy}>
          <Text accessibilityRole="header" style={styles.title}>
            오늘 뭐 먹지?
          </Text>
          <Text style={styles.description}>
            몇 가지 질문에 답하면 지금 상황에 어울리는 메뉴 세 가지를 추천해
            드려요.
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardEyebrow}>GUEST MODE</Text>
          <Text style={styles.cardTitle}>가입 없이 바로 시작해요</Text>
          <Text style={styles.cardDescription}>
            추천 결과를 고르고, 먹은 메뉴를 기록하는 MVP 흐름을 사용할 수
            있어요.
          </Text>
        </View>

        <View style={styles.actions}>
          <Pressable
            accessibilityRole="button"
            accessibilityState={{ busy: isStarting, disabled: isStarting }}
            disabled={isStarting}
            onPress={onGuestStart}
            style={({ pressed }) => [
              styles.primaryButton,
              pressed && styles.primaryButtonPressed,
              isStarting && styles.primaryButtonDisabled,
            ]}
          >
            <Text style={styles.primaryButtonText}>
              {isStarting ? '준비 중…' : '게스트로 시작하기'}
            </Text>
          </Pressable>
          <Text style={styles.caption}>
            시작하면 서비스 이용을 위한 임시 Guest 세션이 생성됩니다.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xxl,
  },
  badge: {
    alignSelf: 'flex-start',
    borderColor: colors.primary,
    borderRadius: radii.pill,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
  },
  badgeText: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 1.4,
  },
  copy: {
    gap: spacing.md,
  },
  title: {
    color: colors.textPrimary,
    fontSize: typography.display,
    fontWeight: '800',
    letterSpacing: -1.5,
  },
  description: {
    color: colors.textSecondary,
    fontSize: typography.body,
    lineHeight: 26,
    maxWidth: 320,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: radii.xl,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl,
  },
  cardEyebrow: {
    color: colors.accent,
    fontSize: typography.caption,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  cardTitle: {
    color: colors.textPrimary,
    fontSize: typography.heading,
    fontWeight: '700',
  },
  cardDescription: {
    color: colors.textSecondary,
    fontSize: typography.bodySmall,
    lineHeight: 22,
  },
  actions: {
    gap: spacing.md,
  },
  primaryButton: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: radii.lg,
    minHeight: 56,
    justifyContent: 'center',
    paddingHorizontal: spacing.lg,
  },
  primaryButtonPressed: {
    backgroundColor: colors.primaryPressed,
  },
  primaryButtonDisabled: {
    opacity: 0.65,
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontSize: typography.button,
    fontWeight: '700',
  },
  caption: {
    color: colors.textMuted,
    fontSize: typography.caption,
    lineHeight: 18,
    textAlign: 'center',
  },
});
