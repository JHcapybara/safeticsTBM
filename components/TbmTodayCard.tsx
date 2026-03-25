import { Link } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CheckCircle2, ChevronRight, ClipboardList } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

type Props = {
  pendingCount?: number;
  dateLabel?: string;
};

/**
 * 홈 — 오늘의 Tool Box Meeting
 * 브랜드 블루 + 라운드·보더·섀도우 리듬을 날씨/긴급 카드와 통일 (NativeWind 토큰)
 */
export function TbmTodayCard({ pendingCount = 8, dateLabel = '2026.03.25' }: Props) {
  return (
    <View
      className="max-w-[480px] self-center overflow-hidden rounded-2xl border border-[rgba(0,0,47,0.08)] bg-white"
      style={{
        width: '100%',
        maxWidth: 343,
        shadowColor: '#002ec9',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.07,
        shadowRadius: 20,
        elevation: 4,
      }}>
      <LinearGradient
        colors={['rgba(62, 99, 221, 0.12)', 'rgba(255,255,255,0.98)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 14 }}>
        <View className="mb-3 flex-row items-center justify-between">
          <View className="flex-row items-center gap-3">
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl border border-[#3e63dd]/25"
              style={{
                backgroundColor: 'rgba(62, 99, 221, 0.12)',
                shadowColor: '#3e63dd',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.15,
                shadowRadius: 6,
                elevation: 2,
              }}>
              <CheckCircle2 color="#3e63dd" size={24} strokeWidth={2.2} />
            </View>
            <View>
              <Text
                style={{
                  fontFamily: 'Pretendard-Medium',
                  fontSize: 11,
                  letterSpacing: 0.5,
                  color: '#64748b',
                }}>
                TODAY
              </Text>
              <Text
                style={{
                  fontFamily: 'Pretendard-Bold',
                  fontSize: 13,
                  letterSpacing: -0.2,
                  color: '#0f172a',
                  marginTop: 2,
                }}>
                {dateLabel}
              </Text>
            </View>
          </View>
          <View className="rounded-full bg-amber-100 px-2.5 py-1">
            <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 11, color: '#b45309' }}>
              확인 {pendingCount}건
            </Text>
          </View>
        </View>

        <View className="flex-row items-start gap-3">
          <ClipboardList color="#94a3b8" size={18} strokeWidth={2} style={{ marginTop: 3 }} />
          <View className="min-w-0 flex-1">
            <Text
              style={{
                fontFamily: 'Pretendard-Bold',
                fontSize: 20,
                letterSpacing: -0.45,
                color: '#0f172a',
              }}>
              Tool Box Meeting
            </Text>
            <Text
              style={{
                fontFamily: 'Pretendard-Regular',
                fontSize: 14,
                lineHeight: 21,
                color: 'rgba(0, 7, 20, 0.58)',
                marginTop: 6,
                letterSpacing: -0.2,
              }}>
              금일 TBM 체크리스트와 서명을 완료해 주세요.
            </Text>
          </View>
        </View>
      </LinearGradient>

      <View className="border-t border-[rgba(0,0,47,0.06)] bg-white px-4 pb-4 pt-3">
        <Link href="/tbm" asChild>
          <Pressable
            className="h-12 w-full flex-row items-center justify-center gap-2 rounded-xl bg-[#3e63dd] active:opacity-90"
            style={{
              shadowColor: '#3e63dd',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.28,
              shadowRadius: 8,
              elevation: 4,
            }}>
            <Text
              style={{
                fontFamily: 'Pretendard-SemiBold',
                fontSize: 16,
                letterSpacing: -0.35,
                color: '#ffffff',
              }}>
              TBM 시작하기
            </Text>
            <ChevronRight color="#ffffff" size={20} strokeWidth={2.5} />
          </Pressable>
        </Link>
      </View>
    </View>
  );
}
