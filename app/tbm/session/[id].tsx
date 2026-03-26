import { LinearGradient } from 'expo-linear-gradient';
import { Href, Link, useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  Bell,
  CheckCircle2,
  ChevronRight,
  CloudSun,
  RefreshCw,
  ShieldCheck,
  Wind,
  XCircle,
} from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SITE_LOCATION_CITY } from '@/constants/site';
import { getTbmById } from '@/constants/tbm';
import { useLang } from '@/contexts/LangContext';
import { useCurrentWeather } from '@/hooks/useCurrentWeather';

/** TBM-02 — Today's TBM 개요 화면 (Figma node 71:1962) */

function formatDateKR(iso: string) {
  const d = new Date(iso);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`;
}

type BadgeVariant = 'green' | 'blue' | 'purple' | 'red' | 'yellow' | 'sky' | 'gray';

const BADGE_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  green:  { bg: 'rgba(0,164,51,0.10)',  text: 'rgba(0,113,63,0.87)' },
  blue:   { bg: 'rgba(0,71,241,0.07)',  text: 'rgba(0,43,183,0.77)' },
  purple: { bg: 'rgba(142,0,241,0.07)', text: 'rgba(82,0,154,0.73)' },
  red:    { bg: 'rgba(243,0,13,0.08)',  text: 'rgba(196,0,6,0.83)'  },
  yellow: { bg: 'rgba(255,222,0,0.24)', text: '#ab6400'              },
  sky:    { bg: 'rgba(0,179,238,0.12)', text: '#00749e'              },
  gray:   { bg: 'rgba(0,0,51,0.06)',    text: 'rgba(0,7,20,0.62)'   },
};

function Badge({ label, variant }: { label: string; variant: BadgeVariant }) {
  const s = BADGE_STYLES[variant];
  return (
    <View
      className="items-center justify-center rounded overflow-hidden"
      style={{ backgroundColor: s.bg, paddingHorizontal: 7, paddingVertical: 3 }}>
      <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 12, letterSpacing: -0.3, color: s.text, lineHeight: 18 }}>
        {label}
      </Text>
    </View>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function TbmSessionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { s } = useLang();
  const { weather, weatherLoading, refreshWeather } = useCurrentWeather();

  const tbm = id ? getTbmById(String(id)) : undefined;

  const headerBlockH = 40 + 8;
  const scrollPadTop = insets.top + headerBlockH + 24;
  const bottomBarH = 98;

  if (!tbm) {
    return (
      <View className="flex-1 items-center justify-center bg-[#fbfdff]">
        <Text style={{ fontFamily: 'Pretendard-Regular', color: '#64748b' }}>{s.tbm.notFound}</Text>
        <Pressable onPress={() => router.back()} className="mt-4 rounded-xl bg-[#3e63dd] px-6 py-3">
          <Text style={{ fontFamily: 'Pretendard-SemiBold', color: '#ffffff' }}>{s.common.goBack}</Text>
        </Pressable>
      </View>
    );
  }

  const cautionDone = tbm.cautionItems.every((i) => i.done);
  const ppeDone = tbm.ppeItems.every((i) => i.done);
  const totalItems = tbm.cautionItems.length + tbm.ppeItems.length + (tbm.specialNotice ? 1 : 0);
  const doneItems = (cautionDone ? tbm.cautionItems.length : 0) + (ppeDone ? tbm.ppeItems.length : 0);
  const overallPct = totalItems > 0 ? doneItems / totalItems : 0;

  const checklistCategories = [
    {
      id: 'caution',
      label: s.checklist.cautions,
      count: tbm.cautionItems.length,
      icon: AlertTriangle,
      iconColor: '#d97706',
      iconBg: 'rgba(217,119,6,0.10)',
      badge: {
        label: `${tbm.cautionItems.length} 건`,
        variant: (tbm.status === 'completed' || cautionDone ? 'green' : 'yellow') as BadgeVariant,
      },
      done: tbm.status === 'completed' || cautionDone,
    },
    {
      id: 'ppe',
      label: s.checklist.ppe,
      count: tbm.ppeItems.length,
      icon: ShieldCheck,
      iconColor: '#0d9488',
      iconBg: 'rgba(13,148,136,0.10)',
      badge: {
        label: `${tbm.ppeItems.length} 건`,
        variant: (tbm.status === 'completed' || ppeDone ? 'green' : 'blue') as BadgeVariant,
      },
      done: tbm.status === 'completed' || ppeDone,
    },
    {
      id: 'notice',
      label: s.checklist.specialNotice,
      count: 1,
      icon: Bell,
      iconColor: '#3e63dd',
      iconBg: 'rgba(62,99,221,0.10)',
      badge: { label: '1 건', variant: (tbm.status === 'completed' ? 'green' : 'sky') as BadgeVariant },
      done: tbm.status === 'completed',
    },
  ];

  return (
    <View className="flex-1 bg-[#fbfdff]">
      {/* ── Sticky Header ── */}
      <View
        className="absolute left-0 right-0 top-0 z-10 px-4"
        style={{
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
            <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 20, letterSpacing: -0.5, color: '#ffffff' }}>
              {s.tbm.sessionTitle}
            </Text>
          </View>
          <View className="h-10 w-10" />
        </View>
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        className="flex-1"
        style={{ paddingTop: scrollPadTop }}
        contentContainerStyle={{
          paddingBottom: bottomBarH + Math.max(insets.bottom, 16) + 8,
          paddingHorizontal: 16,
          gap: 10,
        }}
        showsVerticalScrollIndicator={false}>

        {/* ── 기본 정보 ── */}
        <View
          className="w-full overflow-hidden rounded-2xl border"
          style={{
            borderColor: 'rgba(0,0,47,0.1)',
            shadowColor: '#002ec9',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.08,
            shadowRadius: 20,
            elevation: 3,
          }}>
          <LinearGradient
            colors={['rgba(62,99,221,0.07)', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 16, gap: 10 }}>
            {/* 헤더 행 */}
            <View className="flex-row items-center justify-between">
              <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 13, lineHeight: 16, letterSpacing: -0.3, color: 'rgba(0,7,20,0.45)' }}>
                {s.tbm.basicInfo}
              </Text>
              <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 13, lineHeight: 16, letterSpacing: -0.3, color: '#1c2024' }}>
                {formatDateKR(tbm.scheduledAt)}
              </Text>
            </View>

            <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.08)' }} />

            {/* 담당자 정보 */}
            <View className="flex-row items-center" style={{ gap: 12 }}>
              {/* 아바타 */}
              <View
                className="items-center justify-center overflow-hidden rounded-xl"
                style={{ width: 44, height: 44, backgroundColor: '#3e63dd' }}>
                <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 18, lineHeight: 22, color: '#ffffff' }}>
                  {tbm.supervisor.charAt(0)}
                </Text>
              </View>

              {/* 이름 + 역할 */}
              <View style={{ gap: 3, flex: 1 }}>
                <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 15, lineHeight: 18, letterSpacing: -0.35, color: '#1c2024' }}>
                  {tbm.supervisor}
                </Text>
                <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, lineHeight: 16, letterSpacing: -0.25, color: 'rgba(0,7,20,0.55)' }}>
                  {s.tbm.workManager} · {tbm.attendeeCount}명 참석
                </Text>
              </View>

              {/* 세로 구분선 */}
              <View style={{ width: 1, alignSelf: 'stretch', backgroundColor: 'rgba(0,0,47,0.1)' }} />

              {/* 관리 감독자 */}
              <View className="items-end" style={{ gap: 4 }}>
                <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, lineHeight: 14, letterSpacing: -0.2, color: 'rgba(0,7,20,0.5)' }}>
                  {s.tbm.supervisingManager}
                </Text>
                <Badge label={s.tbm.tbmManager} variant="green" />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── 현장 날씨 ── */}
        <View
          className="w-full overflow-hidden rounded-2xl border"
          style={{
            borderColor: 'rgba(0,0,47,0.08)',
            shadowColor: '#002ec9',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 16,
            elevation: 2,
          }}>
          <LinearGradient
            colors={['#f4f7ff', '#ffffff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ padding: 16, gap: 12 }}>
            <View className="flex-row items-center justify-between">
              <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 13, lineHeight: 16, letterSpacing: -0.3, color: 'rgba(0,7,20,0.45)' }}>
                {s.weather.title}
              </Text>
              <View className="flex-row items-center gap-1.5">
                <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 11, lineHeight: 13, letterSpacing: -0.2, color: 'rgba(0,7,20,0.35)' }}>
                  {(weather?.locationLabel ?? SITE_LOCATION_CITY)} · {s.weather.realtime}
                </Text>
                <Pressable
                  onPress={() => void refreshWeather()}
                  disabled={weatherLoading}
                  accessibilityRole="button"
                  accessibilityLabel={s.weather.refreshA11y}
                  hitSlop={8}
                  className="rounded-md border border-[rgba(0,0,47,0.08)] bg-white/90 p-1.5 active:opacity-70"
                  style={{ opacity: weatherLoading ? 0.5 : 1 }}>
                  <RefreshCw color="#3e63dd" size={16} strokeWidth={2} />
                </Pressable>
              </View>
            </View>

            <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.06)' }} />

            <View className="flex-row" style={{ gap: 8 }}>
              {/* 기온 카드 */}
              <View
                className="flex-1 flex-row items-center overflow-hidden rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1, borderColor: 'rgba(0,0,47,0.06)', padding: 12, gap: 10 }}>
                <View className="items-center justify-center rounded-xl" style={{ width: 44, height: 44, backgroundColor: '#e0e1e6' }}>
                  <CloudSun color="#475569" size={22} strokeWidth={2} />
                </View>
                <View style={{ gap: 2 }}>
                  <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 22, letterSpacing: -0.6, color: '#1c2024', lineHeight: 28 }}>
                    {weather ? `${Math.round(weather.tempC)}°C` : '--°C'}
                  </Text>
                  <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, lineHeight: 16, letterSpacing: -0.2, color: 'rgba(0,7,20,0.55)' }}>
                    {weather ? weather.conditionLabel : weatherLoading ? s.weather.loading : s.weather.unavailable}
                  </Text>
                </View>
              </View>

              {/* 풍속 카드 */}
              <View
                className="flex-1 flex-row items-center overflow-hidden rounded-xl"
                style={{ backgroundColor: 'rgba(255,255,255,0.9)', borderWidth: 1, borderColor: 'rgba(0,0,47,0.06)', padding: 12, gap: 10 }}>
                <View className="items-center justify-center rounded-xl" style={{ width: 44, height: 44, backgroundColor: '#8b8d98' }}>
                  <Wind color="#ffffff" size={22} strokeWidth={2} />
                </View>
                <View style={{ gap: 2 }}>
                  <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 22, letterSpacing: -0.6, color: '#1c2024', lineHeight: 28 }}>
                    {weather ? `${Math.round(weather.windKmh)}km/h` : '--km/h'}
                  </Text>
                  <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, lineHeight: 16, letterSpacing: -0.2, color: 'rgba(0,7,20,0.55)' }}>
                    {weather ? `${s.weather.humidity} ${Math.round(weather.humidity)}%` : s.weather.loading}
                  </Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* ── 체크리스트 ── */}
        <View
          className="w-full overflow-hidden rounded-2xl border"
          style={{
            borderColor: 'rgba(0,0,47,0.08)',
            backgroundColor: '#ffffff',
            shadowColor: '#002ec9',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.05,
            shadowRadius: 16,
            elevation: 2,
            padding: 16,
            gap: 12,
          }}>
          {/* 섹션 헤더 */}
          <View className="flex-row items-center justify-between">
              <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 13, lineHeight: 16, letterSpacing: -0.3, color: 'rgba(0,7,20,0.45)' }}>
                {s.tbm.checklist}
              </Text>
            <View
              className="overflow-hidden rounded-full"
              style={{ backgroundColor: 'rgba(0,0,51,0.05)', paddingHorizontal: 8, paddingVertical: 3 }}>
              <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 12, lineHeight: 14, letterSpacing: -0.25, color: 'rgba(0,7,20,0.5)' }}>
                {doneItems} / {totalItems} 완료
              </Text>
            </View>
          </View>

          {/* 진행률 바 */}
          <View className="h-1.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(0,0,47,0.07)' }}>
            <View
              className="h-full rounded-full"
              style={{
                width: `${overallPct * 100}%`,
                backgroundColor: overallPct >= 1 ? '#22c55e' : '#3e63dd',
              }}
            />
          </View>

          <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.07)' }} />

          {/* 카테고리 행 */}
          {checklistCategories.map((cat, idx) => {
            const Icon = cat.icon;
            return (
              <View key={cat.id}>
                {idx > 0 && <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.06)', marginVertical: 4 }} />}
                <View className="flex-row items-center" style={{ gap: 10, paddingVertical: 2 }}>
                  {/* 아이콘 */}
                  <View
                    className="items-center justify-center rounded-lg"
                    style={{ width: 32, height: 32, backgroundColor: cat.iconBg }}>
                    <Icon color={cat.iconColor} size={16} strokeWidth={2} />
                  </View>
                  {/* 레이블 */}
                  <Text
                    className="flex-1"
                    style={{ fontFamily: 'Pretendard-Regular', fontSize: 14, lineHeight: 17, letterSpacing: -0.35, color: 'rgba(0,7,20,0.7)' }}
                    numberOfLines={1}>
                    {cat.label}
                  </Text>
                  {/* 배지 + 상태 아이콘 */}
                  <View className="flex-row items-center" style={{ gap: 8 }}>
                    <Badge label={cat.badge.label} variant={cat.badge.variant} />
                    {cat.done
                      ? <CheckCircle2 color="#22c55e" size={16} strokeWidth={2} />
                      : <XCircle color="#e5484d" size={16} strokeWidth={2} />
                    }
                  </View>
                </View>
              </View>
            );
          })}

          <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.1)', marginVertical: 2 }} />

          {/* 전체 합계 */}
          <View className="flex-row items-center justify-between">
            <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 14, lineHeight: 17, letterSpacing: -0.35, color: 'rgba(0,7,20,0.55)' }}>
              {s.tbm.totalSummary}
            </Text>
            <View className="flex-row items-center" style={{ gap: 8 }}>
              <Badge label={`${doneItems} / ${totalItems} 건`} variant="gray" />
              <Text style={{
                fontFamily: 'Pretendard-SemiBold',
                fontSize: 13,
                lineHeight: 16,
                letterSpacing: -0.3,
                color: overallPct >= 1 ? '#15803d' : tbm.status === 'incomplete' ? '#b91c1c' : '#3e63dd',
              }}>
                {overallPct >= 1 ? s.status.completed : tbm.status === 'incomplete' ? s.status.incomplete : s.common.inProgress}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* ── 하단 고정 시작하기 버튼 ── */}
      <View
        className="absolute bottom-0 left-0 right-0"
        style={{
          backgroundColor: '#ffffff',
          paddingHorizontal: 16,
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
