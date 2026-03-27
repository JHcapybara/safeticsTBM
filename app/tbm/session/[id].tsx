import { LinearGradient } from 'expo-linear-gradient';
import { Href, Link, useLocalSearchParams, useRouter } from 'expo-router';
import { AlertTriangle, ArrowLeft, ChevronRight, CloudSun, Droplets, RefreshCw, ShieldCheck, Wind } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CenteredColumn } from '@/components/CenteredColumn';
import { SITE_LOCATION_CITY } from '@/constants/site';
import { getTbmById } from '@/constants/tbm';
import { useLang } from '@/contexts/LangContext';
import { useCurrentWeather } from '@/hooks/useCurrentWeather';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

/** TBM-02 — Today's TBM 요약 페이지 */

function formatDateKR(iso: string) {
  const d = new Date(iso);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`;
}

type BadgeVariant = 'green' | 'blue' | 'red' | 'yellow' | 'gray';

const BADGE_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  green: { bg: 'rgba(0,164,51,0.10)', text: 'rgba(0,113,63,0.87)' },
  blue: { bg: 'rgba(0,71,241,0.09)', text: 'rgba(0,43,183,0.84)' },
  red: { bg: 'rgba(243,0,13,0.08)', text: 'rgba(196,0,6,0.83)' },
  yellow: { bg: 'rgba(255,222,0,0.24)', text: '#ab6400' },
  gray: { bg: 'rgba(0,0,51,0.06)', text: 'rgba(0,7,20,0.62)' },
};

function Badge({ label, variant }: { label: string; variant: BadgeVariant }) {
  const s = BADGE_STYLES[variant];
  return (
    <View className="items-center justify-center rounded-lg" style={{ backgroundColor: s.bg, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 16, lineHeight: 20, letterSpacing: -0.25, color: s.text }}>
        {label}
      </Text>
    </View>
  );
}


export default function TbmSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { s } = useLang();
  const { weather, weatherLoading, refreshWeather } = useCurrentWeather();
  const { pagePaddingX, contentColumnMaxWidth, headerTitleFontSize } = useResponsiveLayout();

  const tbm = id ? getTbmById(String(id)) : undefined;

  const headerBlockH = 40 + 8;
  const contentPadTop = insets.top + headerBlockH + 16;
  const bottomBarH = 98;

  if (!tbm) {
    return (
      <View className="flex-1 items-center justify-center bg-[#fbfdff]">
        <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 16, color: '#64748b' }}>{s.tbm.notFound}</Text>
        <Pressable onPress={() => router.back()} className="mt-4 rounded-xl bg-[#3e63dd] px-6 py-3">
          <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 16, color: '#ffffff' }}>{s.common.goBack}</Text>
        </Pressable>
      </View>
    );
  }

  const cautionDone = tbm.cautionItems.every((i) => i.done);
  const ppeDone = tbm.ppeItems.every((i) => i.done);
  const totalItems = tbm.cautionItems.length + tbm.ppeItems.length;
  const doneItems = (cautionDone ? tbm.cautionItems.length : 0) + (ppeDone ? tbm.ppeItems.length : 0);

  const checklistCategories = [
    {
      id: 'caution',
      label: s.checklist.cautions,
      count: tbm.cautionItems.length,
      icon: AlertTriangle,
      iconColor: '#d97706',
      iconBg: 'rgba(217,119,6,0.10)',
      done: tbm.status === 'completed' || cautionDone,
    },
    {
      id: 'ppe',
      label: s.checklist.ppe,
      count: tbm.ppeItems.length,
      icon: ShieldCheck,
      iconColor: '#0d9488',
      iconBg: 'rgba(13,148,136,0.10)',
      done: tbm.status === 'completed' || ppeDone,
    },
  ];

  return (
    <View className="flex-1 bg-[#fbfdff]">
      {/* Header */}
      <View
        className="absolute left-0 right-0 top-0 z-10"
        style={{
          paddingHorizontal: pagePaddingX,
          paddingTop: insets.top + 14,
          paddingBottom: 8,
          backgroundColor: 'rgba(0, 46, 201, 0.88)',
        }}>
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-md bg-[#3e63dd] active:opacity-80"
            accessibilityLabel="뒤로가기">
            <ArrowLeft color="#ffffff" size={18} strokeWidth={2} />
          </Pressable>
          <View className="flex-1 items-center justify-center">
            <Text
              style={{
                fontFamily: 'Pretendard-Bold',
                fontSize: headerTitleFontSize,
                letterSpacing: -0.5,
                color: '#ffffff',
              }}>
              {s.tbm.sessionTitle}
            </Text>
          </View>
          <View className="h-10 w-10" />
        </View>
      </View>

      {/* Content */}
      <View
        style={{
          flex: 1,
          paddingTop: contentPadTop,
          paddingBottom: bottomBarH + Math.max(insets.bottom, 16) + 8,
          paddingHorizontal: pagePaddingX,
        }}>
        <CenteredColumn maxWidth={contentColumnMaxWidth} style={{ flex: 1, gap: 12 }}>
          {/* 기본 정보 — 다크 배너형 */}
          <View
            className="w-full overflow-hidden rounded-2xl"
            style={{
              shadowColor: '#001080',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.22,
              shadowRadius: 18,
              elevation: 5,
            }}>
            <LinearGradient
              colors={['#1e3a8a', '#3e63dd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingHorizontal: 16, paddingVertical: 16, gap: 14 }}>
              {/* 상단: 섹션 레이블 + 날짜 */}
              <View className="flex-row items-center justify-between">
                <View
                  className="flex-row items-center rounded-lg"
                  style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 10, paddingVertical: 4, gap: 5 }}>
                  <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 12, letterSpacing: 1.2, color: 'rgba(255,255,255,0.75)' }}>
                    TODAY'S TBM
                  </Text>
                </View>
                <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 14, lineHeight: 18, color: 'rgba(255,255,255,0.65)' }}>
                  {formatDateKR(tbm.scheduledAt)}
                </Text>
              </View>

              {/* 중간: 책임자 이름 크게 */}
              <View style={{ gap: 2 }}>
                <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, lineHeight: 17, letterSpacing: -0.1, color: 'rgba(255,255,255,0.6)' }}>
                  {s.tbm.workManager}
                </Text>
                <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 26, lineHeight: 32, letterSpacing: -0.8, color: '#ffffff' }}>
                  {tbm.supervisor}
                </Text>
              </View>

              {/* 하단: 구분선 + 현장/참석 */}
              <View style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.18)' }} />
              <View className="flex-row items-center justify-between">
                <View style={{ gap: 2 }}>
                  <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                    현장
                  </Text>
                  <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 16, lineHeight: 20, color: '#ffffff' }}>
                    {tbm.siteName}
                  </Text>
                </View>
                <View style={{ width: 1, height: 32, backgroundColor: 'rgba(255,255,255,0.2)' }} />
                <View style={{ gap: 2, alignItems: 'flex-end' }}>
                  <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>
                    참석 인원
                  </Text>
                  <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 16, lineHeight: 20, color: '#ffffff' }}>
                    {tbm.attendeeCount}명
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </View>

          {/* 체크리스트 (특별 공지 제거) */}
          <View
            className="w-full overflow-hidden rounded-2xl border"
            style={{
              borderColor: 'rgba(0,0,47,0.08)',
              backgroundColor: '#ffffff',
              shadowColor: '#002ec9',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.05,
              shadowRadius: 14,
              elevation: 2,
              padding: 14,
              gap: 10,
            }}>
            <View className="flex-row items-center justify-between">
              <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 16, lineHeight: 20, color: 'rgba(0,7,20,0.45)' }}>
                {s.tbm.checklist}
              </Text>
            </View>

            {/* 현장 날씨 — 1행 인라인 */}
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1 }}>
                <CloudSun color="rgba(0,7,20,0.38)" size={14} strokeWidth={1.8} />
                <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, color: 'rgba(0,7,20,0.40)' }}>온도</Text>
                <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, letterSpacing: -0.2, color: 'rgba(0,7,20,0.72)' }}>
                  {weather ? `${Math.round(weather.tempC)}°C` : '--°C'}
                </Text>
              </View>
              <View style={{ width: 1, height: 14, backgroundColor: 'rgba(0,0,0,0.10)', marginHorizontal: 4 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' }}>
                <Droplets color="rgba(0,7,20,0.38)" size={14} strokeWidth={1.8} />
                <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, color: 'rgba(0,7,20,0.40)' }}>습도</Text>
                <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, letterSpacing: -0.2, color: 'rgba(0,7,20,0.72)' }}>
                  {weather ? `${Math.round(weather.humidity)}%` : '--%'}
                </Text>
              </View>
              <View style={{ width: 1, height: 14, backgroundColor: 'rgba(0,0,0,0.10)', marginHorizontal: 4 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, justifyContent: 'flex-end' }}>
                <Wind color="rgba(0,7,20,0.38)" size={14} strokeWidth={1.8} />
                <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, color: 'rgba(0,7,20,0.40)' }}>풍량</Text>
                <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, letterSpacing: -0.2, color: 'rgba(0,7,20,0.72)' }}>
                  {weather ? `${Math.round(weather.windKmh)}km/h` : '--'}
                </Text>
              </View>
              <Pressable
                onPress={() => void refreshWeather()}
                disabled={weatherLoading}
                accessibilityRole="button"
                accessibilityLabel={s.weather.refreshA11y}
                hitSlop={10}
                style={{
                  opacity: weatherLoading ? 0.35 : 1,
                  marginLeft: 8,
                  padding: 4,
                }}>
                <RefreshCw color="rgba(0,7,20,0.30)" size={12} strokeWidth={2} />
              </Pressable>
            </View>

            <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.07)' }} />

            {checklistCategories.map((cat, idx) => {
              const Icon = cat.icon;
              return (
                <View key={cat.id}>
                  {idx > 0 && <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.06)', marginVertical: 6 }} />}
                  <View className="flex-row items-center" style={{ gap: 10, paddingVertical: 2 }}>
                    <View className="items-center justify-center rounded-lg" style={{ width: 34, height: 34, backgroundColor: cat.iconBg }}>
                      <Icon color={cat.iconColor} size={18} strokeWidth={2} />
                    </View>
                    <Text
                      className="flex-1"
                      style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 20, lineHeight: 24, letterSpacing: -0.35, color: 'rgba(0,7,20,0.8)' }}
                      numberOfLines={1}>
                      {cat.label}
                    </Text>
                    <View className="flex-row items-center" style={{ gap: 8 }}>
                      <Badge
                        label={`${cat.count} 건`}
                        variant={cat.done ? 'green' : cat.id === 'caution' ? 'yellow' : 'blue'}
                      />
                    </View>
                  </View>
                </View>
              );
            })}

            <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.1)', marginVertical: 2 }} />

            <View className="flex-row items-center justify-between">
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 16, lineHeight: 20, color: 'rgba(0,7,20,0.55)' }}>
                {s.tbm.totalSummary}
              </Text>
              <Badge label={`${doneItems} / ${totalItems} 건`} variant="gray" />
            </View>
          </View>
        </CenteredColumn>
      </View>

      {/* 하단 고정 시작하기 버튼 */}
      <View
        className="absolute bottom-0 left-0 right-0"
        style={{
          backgroundColor: '#ffffff',
          paddingHorizontal: pagePaddingX,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 16) + 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -12 },
          shadowOpacity: 0.08,
          shadowRadius: 24,
          elevation: 12,
        }}>
        <Link href={`/tbm/checklist/${tbm.id}` as Href} asChild>
          <Pressable
            className="h-12 w-full flex-row items-center justify-center gap-2 rounded-lg bg-[#3e63dd] active:opacity-90"
            accessibilityRole="button"
            accessibilityLabel={s.tbm.startButton}>
            <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 18, letterSpacing: -0.45, color: '#ffffff', lineHeight: 29 }}>
              {s.tbm.startSession}
            </Text>
            <ChevronRight color="#ffffff" size={20} strokeWidth={2.5} />
          </Pressable>
        </Link>
      </View>
    </View>
  );
}

