import { LinearGradient } from 'expo-linear-gradient';
import { AlertTriangle, ChevronRight, Hand, Siren } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { useLang } from '@/contexts/LangContext';

type Props = {
  variant: 'hazard' | 'sos' | 'stop';
  onPress?: () => void;
  /** 태블릿 등에서 캐러셀 카드 폭 (기본 200) */
  cardWidth?: number;
};

/** 카드 폭 — 가로 스크롤·캐러셀 스냅과 동일 */
export const EMERGENCY_CAROUSEL_CARD_WIDTH = 200;
export const EMERGENCY_CAROUSEL_GAP = 16;

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

function cardMetrics(cardWidth: number) {
  const scale = cardWidth / EMERGENCY_CAROUSEL_CARD_WIDTH;
  const fs = (n: number) => Math.round(n * Math.min(1.1, scale));
  return {
    width: cardWidth,
    minHeight: Math.round(176 * scale),
    padding: Math.round(16 * scale),
    fs,
  };
}

/** 세로 ScrollView 안 가로 캐러셀 높이가 AOS에서 과소 측정되지 않도록 — 기본 폭 기준 */
export const EMERGENCY_CAROUSEL_CARD_MIN_HEIGHT = Math.round(176);

const TITLE_COLOR = '#1c2024';
const BODY_COLOR = '#64748b';
const CTA_TEXT = '#3e63dd';

/**
 * 위험원 보고 / 긴급 SOS / 작업 중지 — 화이트·파스텔 톤
 */
export function EmergencyActionCard({ variant, onPress, cardWidth = EMERGENCY_CAROUSEL_CARD_WIDTH }: Props) {
  const { s } = useLang();
  const m = cardMetrics(cardWidth);

  if (variant === 'hazard') {
    return (
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityLabel={s.emergency.hazard.title}
        className="border border-[rgba(0,0,47,0.08)] active:opacity-95"
        style={[{ width: m.width, borderRadius: CARD_RADIUS }, HOME_CARD_SHADOW]}>
        <View className="overflow-hidden" style={{ borderRadius: CARD_RADIUS }}>
          <LinearGradient
            colors={['#fffbeb', '#fef3c7', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ minHeight: m.minHeight, padding: m.padding, justifyContent: 'space-between' }}>
            <View className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-amber-200/35" />
            <View className="pointer-events-none absolute -bottom-4 -left-8 h-24 w-24 rounded-full bg-orange-200/25" />

            <View>
              <View className="mb-3 flex-row items-center justify-between">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-amber-100">
                  <AlertTriangle color="#d97706" size={Math.min(26, Math.round(22 * (m.width / 200)))} strokeWidth={2.2} />
                </View>
                <View className="rounded-full bg-white/90 px-2.5 py-1" style={{ borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.35)' }}>
                  <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: m.fs(10), lineHeight: m.fs(12), letterSpacing: 0.8, color: '#b45309' }}>
                    {s.emergency.hazard.badge}
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  fontFamily: 'Pretendard-Bold',
                  fontSize: m.fs(20),
                  lineHeight: m.fs(24),
                  letterSpacing: -0.5,
                  color: TITLE_COLOR,
                }}>
                {s.emergency.hazard.title}
              </Text>
              <Text
                style={{
                  fontFamily: 'Pretendard-Regular',
                  fontSize: m.fs(13),
                  lineHeight: m.fs(19),
                  color: BODY_COLOR,
                  marginTop: 6,
                  letterSpacing: -0.2,
                }}>
                {s.emergency.hazard.desc}
              </Text>
            </View>

            <View
              className="flex-row items-center justify-center gap-1 rounded-xl py-2.5"
              style={{ backgroundColor: 'rgba(254, 243, 199, 0.55)', borderWidth: 1, borderColor: 'rgba(251, 191, 36, 0.2)' }}>
              <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: m.fs(13), lineHeight: m.fs(16), color: CTA_TEXT }}>{s.emergency.hazard.cta}</Text>
              <ChevronRight color="#3e63dd" size={Math.min(22, Math.round(18 * (m.width / 200)))} strokeWidth={2.5} />
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
        accessibilityLabel={s.emergency.sos.title}
        className="border border-[rgba(0,0,47,0.08)] active:opacity-95"
        style={[{ width: m.width, borderRadius: CARD_RADIUS }, HOME_CARD_SHADOW]}>
        <View className="overflow-hidden" style={{ borderRadius: CARD_RADIUS }}>
          <LinearGradient
            colors={['#fff1f2', '#ffe4e6', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ minHeight: m.minHeight, padding: m.padding, justifyContent: 'space-between' }}>
            <View className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-rose-200/35" />
            <View className="pointer-events-none absolute -bottom-4 -left-8 h-24 w-24 rounded-full bg-pink-200/25" />

            <View>
              <View className="mb-3 flex-row items-center justify-between">
                <View className="h-11 w-11 items-center justify-center rounded-2xl bg-rose-100">
                  <Siren color="#e11d48" size={Math.min(26, Math.round(22 * (m.width / 200)))} strokeWidth={2.2} />
                </View>
                <View className="rounded-full bg-white/90 px-2.5 py-1" style={{ borderWidth: 1, borderColor: 'rgba(251, 113, 133, 0.35)' }}>
                  <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: m.fs(10), lineHeight: m.fs(12), letterSpacing: 0.8, color: '#be123c' }}>
                    {s.emergency.sos.badge}
                  </Text>
                </View>
              </View>

              <Text
                style={{
                  fontFamily: 'Pretendard-Bold',
                  fontSize: m.fs(22),
                  lineHeight: m.fs(26),
                  letterSpacing: -0.6,
                  color: TITLE_COLOR,
                }}>
                {s.emergency.sos.title}
              </Text>
              <Text
                style={{
                  fontFamily: 'Pretendard-Regular',
                  fontSize: m.fs(13),
                  lineHeight: m.fs(19),
                  color: BODY_COLOR,
                  marginTop: 6,
                  letterSpacing: -0.2,
                }}>
                {s.emergency.sos.desc}
              </Text>
            </View>

            <View
              className="flex-row items-center justify-center gap-1 rounded-xl py-2.5"
              style={{ backgroundColor: 'rgba(255, 228, 230, 0.55)', borderWidth: 1, borderColor: 'rgba(251, 113, 133, 0.2)' }}>
              <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: m.fs(13), lineHeight: m.fs(16), color: CTA_TEXT }}>{s.emergency.sos.cta}</Text>
              <ChevronRight color="#3e63dd" size={Math.min(22, Math.round(18 * (m.width / 200)))} strokeWidth={2.5} />
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
      accessibilityLabel={s.emergency.stop.title}
      className="border border-[rgba(0,0,47,0.08)] active:opacity-95"
      style={[{ width: m.width, borderRadius: CARD_RADIUS }, HOME_CARD_SHADOW]}>
      <View className="overflow-hidden" style={{ borderRadius: CARD_RADIUS }}>
        <LinearGradient
          colors={['#f8fafc', '#e8eef7', '#ffffff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ minHeight: m.minHeight, padding: m.padding, justifyContent: 'space-between' }}>
          <View className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-slate-200/40" />
          <View className="pointer-events-none absolute -bottom-4 -left-8 h-24 w-24 rounded-full bg-[#3e63dd]/10" />

          <View>
            <View className="mb-3 flex-row items-center justify-between">
              <View className="h-11 w-11 items-center justify-center rounded-2xl bg-slate-200/70">
                <Hand color="#475569" size={Math.min(26, Math.round(22 * (m.width / 200)))} strokeWidth={2.2} />
              </View>
              <View className="rounded-full bg-white/90 px-2.5 py-1" style={{ borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.35)' }}>
                <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: m.fs(10), lineHeight: m.fs(12), letterSpacing: 0.8, color: '#475569' }}>
                  {s.emergency.stop.badge}
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontFamily: 'Pretendard-Bold',
                fontSize: m.fs(22),
                lineHeight: m.fs(26),
                letterSpacing: -0.6,
                color: TITLE_COLOR,
              }}>
              {s.emergency.stop.title}
            </Text>
            <Text
              style={{
                fontFamily: 'Pretendard-Regular',
                fontSize: m.fs(13),
                lineHeight: m.fs(19),
                color: BODY_COLOR,
                marginTop: 6,
                letterSpacing: -0.2,
              }}>
              {s.emergency.stop.desc}
            </Text>
          </View>

          <View
            className="flex-row items-center justify-center gap-1 rounded-xl py-2.5"
            style={{ backgroundColor: 'rgba(226, 232, 240, 0.45)', borderWidth: 1, borderColor: 'rgba(148, 163, 184, 0.22)' }}>
            <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: m.fs(13), lineHeight: m.fs(16), color: CTA_TEXT }}>{s.emergency.stop.cta}</Text>
            <ChevronRight color="#3e63dd" size={Math.min(22, Math.round(18 * (m.width / 200)))} strokeWidth={2.5} />
          </View>
        </LinearGradient>
      </View>
    </Pressable>
  );
}
