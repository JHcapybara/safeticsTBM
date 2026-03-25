import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, ChevronRight, Hand, Siren } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

type Props = {
  variant: 'hazard' | 'sos' | 'stop';
  onPress?: () => void;
};

/** 카드 폭 — 가로 스크롤·캐러셀 스냅과 동일 */
export const EMERGENCY_CAROUSEL_CARD_WIDTH = 200;
export const EMERGENCY_CAROUSEL_GAP = 16;

const CARD_W = EMERGENCY_CAROUSEL_CARD_WIDTH;

/** rounded-2xl — TbmTodayCard·홈 카드와 동일 반경 */
const CARD_RADIUS = 16;

/** 홈 날씨/TBM 카드와 동일한 브랜드 블루 소프트 섀도우 */
const HOME_CARD_SHADOW = {
  shadowColor: '#002ec9',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.07,
  shadowRadius: 20,
  elevation: 4,
} as const;

const CARD_INNER = {
  minHeight: 176,
  padding: 16,
  justifyContent: 'space-between' as const,
};

const TITLE_COLOR = '#1c2024';
const BODY_COLOR = '#64748b';
const CTA_TEXT = '#3e63dd';

/**
 * 위험원 보고 / 긴급 SOS / 작업 중지 — 화이트·파스텔 톤
 */
export function EmergencyActionCard({ variant, onPress }: Props) {
  if (variant === 'hazard') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="위험원 보고"
        className="border border-[rgba(0,0,47,0.08)] active:opacity-95"
        style={[{ width: CARD_W, borderRadius: CARD_RADIUS }, HOME_CARD_SHADOW]}>
        <View className="overflow-hidden" style={{ borderRadius: CARD_RADIUS }}>
          <LinearGradient
            colors={['#fffbeb', '#fef3c7', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={CARD_INNER}>
            <View className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-200/35" />
            <View className="pointer-events-none absolute -bottom-4 -left-8 h-24 w-24 rounded-full bg-orange-200/25" />

            <View>
              <View className="mb-3 flex-row items-center justify-between">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-amber-100">
                  <AlertTriangle color="#d97706" size={22} strokeWidth={2.2} />
                </View>
                <View className="rounded-full bg-white/90 px-2.5 py-1" style={{ borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.35)' }}>
                  <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 10, letterSpacing: 0.8, color: '#b45309' }}>
                    RISK
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  fontFamily: 'Pretendard-Bold',
                  fontSize: 20,
                  letterSpacing: -0.5,
                  color: TITLE_COLOR,
                }}>
                위험원 보고
              </Text>
              <Text
                style={{
                  fontFamily: 'Pretendard-Regular',
                  fontSize: 13,
                  lineHeight: 19,
                  color: BODY_COLOR,
                  marginTop: 6,
                  letterSpacing: -0.2,
                }}>
                미조치 위험원이 있나요?{'\n'}관리자에게 즉시 알립니다.
              </Text>
            </View>

            <View
              className="flex-row items-center justify-center gap-1 rounded-xl py-2.5"
              style={{ backgroundColor: 'rgba(254, 243, 199, 0.55)', borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.2)' }}>
              <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 13, color: CTA_TEXT }}>탭하여 보고</Text>
              <ChevronRight color="#3e63dd" size={18} strokeWidth={2.5} />
            </View>
          </LinearGradient>
        </View>
      </Pressable>
    );
  }

  if (variant === 'sos') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel="긴급 SOS"
        className="border border-[rgba(0,0,47,0.08)] active:opacity-95"
        style={[{ width: CARD_W, borderRadius: CARD_RADIUS }, HOME_CARD_SHADOW]}>
        <View className="overflow-hidden" style={{ borderRadius: CARD_RADIUS }}>
          <LinearGradient
            colors={['#fff1f2', '#ffe4e6', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={CARD_INNER}>
            <View className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-200/35" />
            <View className="pointer-events-none absolute -bottom-4 -left-8 h-24 w-24 rounded-full bg-pink-200/25" />

            <View>
              <View className="mb-3 flex-row items-center justify-between">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-rose-100">
                  <Siren color="#e11d48" size={22} strokeWidth={2.2} />
                </View>
                <View className="rounded-full bg-white/90 px-2.5 py-1" style={{ borderWidth: 1, borderColor: 'rgba(251, 113, 133, 0.35)' }}>
                  <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 10, letterSpacing: 0.8, color: '#be123c' }}>
                    HELP
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  fontFamily: 'Pretendard-Bold',
                  fontSize: 22,
                  letterSpacing: -0.6,
                  color: TITLE_COLOR,
                }}>
                긴급 SOS
              </Text>
              <Text
                style={{
                  fontFamily: 'Pretendard-Regular',
                  fontSize: 13,
                  lineHeight: 19,
                  color: BODY_COLOR,
                  marginTop: 6,
                  letterSpacing: -0.2,
                }}>
                비상벨을 울리고{'\n'}관제에 즉시 연결됩니다.
              </Text>
            </View>

            <View
              className="flex-row items-center justify-center gap-1 rounded-xl py-2.5"
              style={{ backgroundColor: 'rgba(255, 228, 230, 0.55)', borderWidth: 1, borderColor: 'rgba(251, 113, 133, 0.2)' }}>
              <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 13, color: CTA_TEXT }}>탭하여 전송</Text>
              <ChevronRight color="#3e63dd" size={18} strokeWidth={2.5} />
            </View>
          </LinearGradient>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="작업 중지 요청"
      className="border border-[rgba(0,0,47,0.08)] active:opacity-95"
      style={[{ width: CARD_W, borderRadius: CARD_RADIUS }, HOME_CARD_SHADOW]}>
      <View className="overflow-hidden" style={{ borderRadius: CARD_RADIUS }}>
        <LinearGradient
          colors={['#f8fafc', '#e8eef7', '#ffffff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={CARD_INNER}>
          <View className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-slate-200/40" />
          <View className="pointer-events-none absolute -bottom-4 -left-8 h-24 w-24 rounded-full bg-[#3e63dd]/10" />

          <View>
            <View className="mb-3 flex-row items-center justify-between">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-slate-200/70">
                <Hand color="#475569" size={22} strokeWidth={2.2} />
              </View>
              <View className="rounded-full bg-white/90 px-2.5 py-1" style={{ borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.35)' }}>
                <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 10, letterSpacing: 0.8, color: '#475569' }}>
                  STOP
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontFamily: 'Pretendard-Bold',
                fontSize: 22,
                letterSpacing: -0.6,
                color: TITLE_COLOR,
              }}>
              작업 중지 요청
            </Text>
            <Text
              style={{
                fontFamily: 'Pretendard-Regular',
                fontSize: 13,
                lineHeight: 19,
                color: BODY_COLOR,
                marginTop: 6,
                letterSpacing: -0.2,
              }}>
              관리자에게 즉시 알림이 전달되며{'\n'}현장 작업을 중단합니다.
            </Text>
          </View>

          <View
            className="flex-row items-center justify-center gap-1 rounded-xl py-2.5"
            style={{ backgroundColor: 'rgba(226, 232, 240, 0.45)', borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.22)' }}>
            <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 13, color: CTA_TEXT }}>탭하여 요청</Text>
            <ChevronRight color="#3e63dd" size={18} strokeWidth={2.5} />
          </View>
        </LinearGradient>
      </View>
    </Pressable>
  );
}
