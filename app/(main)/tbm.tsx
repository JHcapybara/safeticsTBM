import { LinearGradient } from 'expo-linear-gradient';
import { Href, Link, useRouter } from 'expo-router';
import {
  ArrowLeft,
  ChevronRight,
  ClipboardList,
  Menu,
  Users,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CenteredColumn } from '@/components/CenteredColumn';
import { scrollViewAndroidProps } from '@/constants/scrollViewAndroid';
import { useDrawer } from '@/contexts/DrawerContext';
import { useLang } from '@/contexts/LangContext';
import { isTbmScheduledToday, MOCK_TBMS, TbmItem, TbmStatus } from '@/constants/tbm';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

/** TBM-01 */

function getDayLabel(iso: string) {
  const d = new Date(iso);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`;
}

function getHHMM(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

function useStatusLabel(): Record<TbmStatus, string> {
  const { s } = useLang();
  return {
    completed: s.status.completed,
    incomplete: s.status.incomplete,
    scheduled: s.status.scheduled,
  };
}

const STATUS_COLORS: Record<TbmStatus, { bg: string; text: string; dot: string }> = {
  completed: { bg: 'rgba(34,197,94,0.1)', text: '#15803d', dot: '#22c55e' },
  incomplete: { bg: 'rgba(229,72,77,0.1)', text: '#b91c1c', dot: '#e5484d' },
  scheduled: { bg: 'rgba(62,99,221,0.1)', text: '#1d4ed8', dot: '#3e63dd' },
};

type FilterTab = 'all' | TbmStatus;

// ─── Today Hero Card ────────────────────────────────────────────────────────

function TodayHeroCard({ item }: { item: TbmItem }) {
  const { s } = useLang();
  const pendingItems =
    item.checklist.filter((c) => !c.done).length + item.riskFactors.length + item.safetyMeasures.length;

  return (
    <Link href={`/tbm/session/${item.id}` as Href} asChild>
      <Pressable
        className="w-full overflow-hidden active:opacity-95"
        style={{
          borderRadius: 20,
          shadowColor: '#002ec9',
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.13,
          shadowRadius: 28,
          elevation: 6,
        }}
        accessibilityRole="button"
        accessibilityLabel="오늘의 TBM 상세 보기">
        <LinearGradient
          colors={['rgba(62,99,221,0.96)', 'rgba(0,46,201,0.92)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 20, gap: 16 }}>
          {/* 배경 장식 */}
          <View className="pointer-events-none absolute -right-10 -top-10 h-44 w-44 rounded-full bg-white/10" />
          <View className="pointer-events-none absolute -bottom-8 -left-10 h-36 w-36 rounded-full bg-white/8" />

          {/* 상단 행: TODAY 뱃지 + 시간 */}
          <View className="flex-row items-center justify-between">
            <View
              className="items-center justify-center rounded-full px-3 py-1"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 11, lineHeight: 13, letterSpacing: 1, color: '#ffffff' }}>
                {s.tbm.todayBadge}
              </Text>
            </View>
            <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 13, lineHeight: 16, color: 'rgba(255,255,255,0.7)', letterSpacing: -0.2 }}>
              {getDayLabel(item.scheduledAt)} {getHHMM(item.scheduledAt)}
            </Text>
          </View>

          {/* 제목 + 담당자 */}
          <View style={{ gap: 6 }}>
            <Text
              style={{ fontFamily: 'Pretendard-Bold', fontSize: 22, letterSpacing: -0.6, color: '#ffffff', lineHeight: 28 }}
              numberOfLines={2}>
              {item.title}
            </Text>
            <View className="flex-row items-center gap-1.5">
              <Users color="rgba(255,255,255,0.6)" size={13} strokeWidth={2} />
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, lineHeight: 16, color: 'rgba(255,255,255,0.7)', letterSpacing: -0.2 }}>
                책임자 {item.supervisor} · 참석 {item.attendeeCount}명
              </Text>
            </View>
          </View>

          {/* CTA 버튼 (기존 — 주석 보존)
          <View
            className="flex-row items-center justify-between rounded-2xl px-5"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
            <View style={{ gap: 2 }}>
              <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 16, lineHeight: 19, color: '#ffffff', letterSpacing: -0.35 }}>
                {s.tbm.startButton}
              </Text>
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, lineHeight: 14, color: 'rgba(255,255,255,0.65)', letterSpacing: -0.2 }}>
                확인할 사항 {pendingItems}개 남음
              </Text>
            </View>
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <ChevronRight color="#ffffff" size={20} strokeWidth={2.5} />
            </View>
          </View>
          */}

          {/* CTA 버튼 (신규 v1 — 주석 보존)
          <View style={{ gap: 8 }}>
            <View className="flex-row items-center" style={{ gap: 5 }}>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.45)' }} />
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, lineHeight: 15, color: 'rgba(255,255,255,0.55)', letterSpacing: -0.1 }}>
                확인할 사항 {pendingItems}개 남음
              </Text>
            </View>
            <View style={{ borderRadius: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.18, shadowRadius: 10, elevation: 6 }}>
              <View className="flex-row items-center justify-between rounded-2xl px-5" style={{ backgroundColor: '#ffffff', paddingVertical: 16 }}>
                <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 17, lineHeight: 20, color: '#1e3a8a', letterSpacing: -0.4 }}>
                  {s.tbm.startButton}
                </Text>
                <View className="h-9 w-9 items-center justify-center rounded-full" style={{ backgroundColor: '#3e63dd' }}>
                  <ChevronRight color="#ffffff" size={18} strokeWidth={2.8} />
                </View>
              </View>
            </View>
          </View>
          */}

          {/* CTA 버튼 (신규 v2 — 주석 보존)
          <View style={{ gap: 10 }}>
            <View className="flex-row items-center justify-center" style={{ gap: 5 }}>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' }} />
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, lineHeight: 16, color: 'rgba(255,255,255,0.55)', letterSpacing: -0.1 }}>
                확인할 사항 {pendingItems}개 남음
              </Text>
              <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.4)' }} />
            </View>
            <View style={{ borderRadius: 18, shadowColor: '#d97706', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.55, shadowRadius: 14, elevation: 10 }}>
              <LinearGradient colors={['#fde68a', '#fbbf24', '#f59e0b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
                style={{ borderRadius: 18, paddingVertical: 18, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)' }}>
                <View style={{ gap: 3 }}>
                  <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 19, lineHeight: 23, color: '#78350f', letterSpacing: -0.5 }}>{s.tbm.startButton}</Text>
                  <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, lineHeight: 15, color: 'rgba(120,53,15,0.65)', letterSpacing: -0.1 }}>지금 바로 시작하세요</Text>
                </View>
                <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: 'rgba(120,53,15,0.15)', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(120,53,15,0.20)' }}>
                  <ChevronRight color="#92400e" size={22} strokeWidth={2.8} />
                </View>
              </LinearGradient>
            </View>
          </View>
          */}

          {/* CTA 버튼 (신규 v3) */}
          <View style={{ gap: 10 }}>
            {/* 남은 항목 수 */}
            <View className="flex-row items-center justify-center" style={{ gap: 6 }}>
              <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.18)' }} />
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, lineHeight: 15, color: 'rgba(255,255,255,0.45)', letterSpacing: 0.2 }}>
                확인할 사항 {pendingItems}개
              </Text>
              <View style={{ flex: 1, height: 1, backgroundColor: 'rgba(255,255,255,0.18)' }} />
            </View>

            {/* 흰색 글로우 버튼 */}
            <View
              style={{
                borderRadius: 20,
                shadowColor: '#ffffff',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.35,
                shadowRadius: 20,
                elevation: 12,
              }}>
              <LinearGradient
                colors={['#ffffff', '#e8eeff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  borderRadius: 20,
                  paddingVertical: 20,
                  paddingHorizontal: 24,
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                <View style={{ gap: 4 }}>
                  <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 20, lineHeight: 24, color: '#1e3a8a', letterSpacing: -0.6 }}>
                    {s.tbm.startButton}
                  </Text>
                  <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, lineHeight: 15, color: 'rgba(30,58,138,0.50)', letterSpacing: -0.1 }}>
                    지금 바로 시작하세요
                  </Text>
                </View>
                <View
                  style={{
                    width: 44, height: 44,
                    borderRadius: 22,
                    shadowColor: '#3e63dd',
                    shadowOffset: { width: 0, height: 0 },
                    shadowOpacity: 1,
                    shadowRadius: 80,
                    elevation: 30,
                  }}>
                  <LinearGradient
                    colors={['#3e63dd', '#1e40af']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={{
                      width: 44, height: 44,
                      borderRadius: 22,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                    <ChevronRight color="#ffffff" size={22} strokeWidth={2.8} />
                  </LinearGradient>
                </View>
              </LinearGradient>
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Link>
  );
}

// ─── No Today Card ───────────────────────────────────────────────────────────

function NoTodayCard() {
  const { s } = useLang();
  return (
    <View
      className="w-full overflow-hidden"
      style={{
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(0,0,47,0.1)',
        backgroundColor: '#ffffff',
        shadowColor: '#002ec9',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.07,
        shadowRadius: 20,
        elevation: 3,
      }}>
      <LinearGradient
        colors={['rgba(62,99,221,0.06)', '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ padding: 24, alignItems: 'center', gap: 10 }}>
        <View
          className="h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: 'rgba(62,99,221,0.1)' }}>
          <ClipboardList color="#3e63dd" size={28} strokeWidth={2} />
        </View>
        <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 17, lineHeight: 20, letterSpacing: -0.4, color: '#1c2024' }}>
          {s.tbm.noTodayTitle}
        </Text>
        <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 14, color: 'rgba(0,7,20,0.5)', letterSpacing: -0.2, textAlign: 'center', lineHeight: 21 }}>
          {s.tbm.noTodayDesc}
        </Text>
      </LinearGradient>
    </View>
  );
}

// ─── Filter Tabs (건수 뱃지 통합, StatsRow 대체) ─────────────────────────────

const TAB_ACCENT: Record<FilterTab, { activeText: string; countBg: string; countText: string }> = {
  all:        { activeText: '#1d4ed8', countBg: 'rgba(62,99,221,0.12)',  countText: '#3e63dd' },
  completed:  { activeText: '#15803d', countBg: 'rgba(34,197,94,0.14)',  countText: '#15803d' },
  incomplete: { activeText: '#b91c1c', countBg: 'rgba(229,72,77,0.13)',  countText: '#dc2626' },
  scheduled:  { activeText: '#1d4ed8', countBg: 'rgba(62,99,221,0.12)',  countText: '#3e63dd' },
};

function FilterTabs({
  active,
  onChange,
  counts,
}: {
  active: FilterTab;
  onChange: (k: FilterTab) => void;
  counts: Record<FilterTab, number>;
}) {
  const { s } = useLang();
  const TABS: { key: FilterTab; label: string }[] = [
    { key: 'all',        label: s.status.all },
    { key: 'completed',  label: s.status.completed },
    { key: 'incomplete', label: s.status.incomplete },
    { key: 'scheduled',  label: s.status.scheduled },
  ];

  return (
    <View
      className="flex-row rounded-2xl p-1"
      style={{ backgroundColor: 'rgba(0,0,47,0.05)', borderWidth: 1, borderColor: 'rgba(0,0,47,0.06)' }}>
      {TABS.map(({ key, label }) => {
        const isActive = active === key;
        const accent = TAB_ACCENT[key];
        return (
          <Pressable
            key={key}
            onPress={() => onChange(key)}
            className="flex-1 items-center rounded-xl py-2.5 active:opacity-80"
            style={{
              backgroundColor: isActive ? '#ffffff' : 'transparent',
              ...(isActive
                ? {
                    shadowColor: '#002ec9',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 6,
                    elevation: 2,
                  }
                : null),
            }}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}>
            {/* 건수 뱃지 */}
            <View
              className="mb-1 items-center justify-center rounded-full px-2 py-0.5"
              style={{ backgroundColor: isActive ? accent.countBg : 'transparent', minWidth: 28 }}>
              <Text
                style={{
                  fontFamily: 'Pretendard-Bold',
                  fontSize: 16,
                  lineHeight: 20,
                  letterSpacing: -0.4,
                  color: isActive ? accent.countText : 'rgba(0,7,20,0.35)',
                }}>
                {counts[key]}
              </Text>
            </View>
            {/* 탭 레이블 */}
            <Text
              style={{
                fontFamily: isActive ? 'Pretendard-SemiBold' : 'Pretendard-Regular',
                fontSize: 11,
                lineHeight: 14,
                letterSpacing: -0.1,
                color: isActive ? accent.activeText : 'rgba(0,7,20,0.4)',
              }}>
              {label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

// ─── Past TBM Row Card ───────────────────────────────────────────────────────

function PastTbmCard({ item }: { item: TbmItem }) {
  const STATUS_LABEL = useStatusLabel();
  const sc = STATUS_COLORS[item.status];

  return (
    <Link href={`/tbm/${item.id}` as Href} asChild>
      <Pressable
        className="w-full overflow-hidden rounded-2xl border bg-white active:bg-slate-50/80"
        style={{
          borderColor: 'rgba(0,0,47,0.08)',
          shadowColor: '#002ec9',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.05,
          shadowRadius: 12,
          elevation: 2,
        }}
        accessibilityRole="button">
        {/* 우측 상단 상태 뱃지 — 절대 위치 */}
        <View
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            borderRadius: 999,
            paddingHorizontal: 10,
            paddingVertical: 4,
            backgroundColor: sc.bg,
            zIndex: 1,
          }}>
          <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: sc.dot }} />
          <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 12, lineHeight: 14, color: sc.text, letterSpacing: -0.2 }}>
            {STATUS_LABEL[item.status]}
          </Text>
        </View>

        {/* 콘텐츠 좌측 + 화살표 우측 수직 중앙 */}
        <View className="flex-row items-center p-4" style={{ gap: 12 }}>
          {/* 좌측: 텍스트 영역 */}
          <View style={{ flex: 1, gap: 6 }}>
            {/* 날짜 */}
            <View className="flex-row items-center gap-2">
              <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 15, lineHeight: 18, color: '#1c2024', letterSpacing: -0.3 }}>
                {getDayLabel(item.scheduledAt)}
              </Text>
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, lineHeight: 16, color: 'rgba(0,7,20,0.4)', letterSpacing: -0.2 }}>
                {getHHMM(item.scheduledAt)}
              </Text>
            </View>

            {/* 제목 */}
            <Text
              style={{ fontFamily: 'Pretendard-Bold', fontSize: 17, letterSpacing: -0.4, color: '#1c2024', lineHeight: 24 }}
              numberOfLines={1}>
              {item.title}
            </Text>

            {/* 메타 */}
            <View className="flex-row items-center gap-1">
              <Users color="#94a3b8" size={12} strokeWidth={2} />
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, lineHeight: 14, color: '#64748b', letterSpacing: -0.15 }}>
                책임자 {item.supervisor} · 참석 {item.attendeeCount}명
              </Text>
            </View>
          </View>

          {/* 우측: 화살표 수직 중앙 */}
          <ChevronRight color="#cbd5e1" size={20} strokeWidth={2} />
        </View>
      </Pressable>
    </Link>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function TbmListScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { openDrawer } = useDrawer();
  const { s } = useLang();
  const { pagePaddingX, contentColumnMaxWidth, headerTitleFontSize } = useResponsiveLayout();
  const [filter, setFilter] = useState<FilterTab>('all');

  const headerBlockH = 40 + 8;
  const scrollPadTop = insets.top + headerBlockH + 24;

  const todayTbm = useMemo(() => MOCK_TBMS.find((t) => isTbmScheduledToday(t.scheduledAt)), []);
  const pastTbms = useMemo(
    () =>
      MOCK_TBMS.filter(
        (t) => !isTbmScheduledToday(t.scheduledAt) || t.appearsInHistoryList === true,
      ).sort(
        (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
      ),
    [],
  );

  const tabCounts = useMemo<Record<FilterTab, number>>(
    () => ({
      all:        pastTbms.length,
      completed:  pastTbms.filter((t) => t.status === 'completed').length,
      incomplete: pastTbms.filter((t) => t.status === 'incomplete').length,
      scheduled:  pastTbms.filter((t) => t.status === 'scheduled').length,
    }),
    [pastTbms],
  );

  const filteredPast = useMemo(
    () => (filter === 'all' ? pastTbms : pastTbms.filter((t) => t.status === filter)),
    [pastTbms, filter],
  );

  return (
    <View className="flex-1 bg-[#fbfdff]">
      {/* ── Sticky Header ── */}
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
                lineHeight: headerTitleFontSize + 4,
                letterSpacing: -0.5,
                color: '#ffffff',
              }}>
              Tool Box Meeting
            </Text>
          </View>
          <Pressable
            onPress={openDrawer}
            className="h-10 w-10 items-center justify-center rounded-md bg-[#3e63dd] active:opacity-80"
            accessibilityLabel="메뉴 열기">
            <Menu color="#ffffff" size={18} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      {/* ── Scrollable Content ── */}
      <ScrollView
        {...scrollViewAndroidProps}
        className="flex-1"
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: scrollPadTop,
          paddingBottom: Math.max(insets.bottom, 8) + 24,
          paddingHorizontal: pagePaddingX,
        }}
        contentContainerClassName="gap-6"
        showsVerticalScrollIndicator={false}>
        <CenteredColumn maxWidth={contentColumnMaxWidth}>
          {/* ── 오늘의 TBM 섹션 ── */}
          <View style={{ gap: 10 }}>
            <View className="flex-row items-center gap-2">
              <View className="h-3.5 w-1 rounded-full bg-[#3e63dd]" />
              <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 12, letterSpacing: 0.6, color: '#3e63dd' }}>
                {s.tbm.todayBadge}
              </Text>
            </View>
            {todayTbm ? <TodayHeroCard item={todayTbm} /> : <NoTodayCard />}
          </View>

          {/* ── 섹션 구분선 ── */}
          <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.07)', marginVertical: 4 }} />

          {/* ── 이전 기록 섹션 ── */}
          <View style={{ gap: 14 }}>
            {/* 섹션 헤더 */}
            <View className="flex-row items-center gap-2">
              <View className="h-3.5 w-1 rounded-full bg-[#64748b]" />
              <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 12, letterSpacing: 0.6, color: '#64748b' }}>
                {s.tbm.previousRecords}
              </Text>
            </View>

            {/* 필터 탭 (건수 통합) */}
            <FilterTabs active={filter} onChange={setFilter} counts={tabCounts} />

            {/* 리스트 */}
            {filteredPast.length > 0 ? (
              <View style={{ gap: 10 }}>
                {filteredPast.map((item) => (
                  <PastTbmCard key={item.id} item={item} />
                ))}
              </View>
            ) : (
              <View
                className="items-center rounded-2xl py-12"
                style={{ backgroundColor: 'rgba(0,0,47,0.03)', borderWidth: 1, borderColor: 'rgba(0,0,47,0.07)' }}>
                <ClipboardList color="#94a3b8" size={32} strokeWidth={1.5} />
                <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 14, lineHeight: 17, color: '#94a3b8', marginTop: 10, letterSpacing: -0.2 }}>
                  {s.tbm.noRecordsForStatus}
                </Text>
              </View>
            )}
          </View>
        </CenteredColumn>
      </ScrollView>
    </View>
  );
}
