import { LinearGradient } from 'expo-linear-gradient';
import { Href, Link, useRouter } from 'expo-router';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Menu,
  Users,
  XCircle,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDrawer } from '@/contexts/DrawerContext';
import { MOCK_TBMS, TbmItem, TbmStatus } from '@/constants/tbm';

/** TBM-01 */

const today = new Date();

function isToday(iso: string) {
  const d = new Date(iso);
  return (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  );
}

function getDayLabel(iso: string) {
  const d = new Date(iso);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`;
}

function getHHMM(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const STATUS_LABEL: Record<TbmStatus, string> = {
  completed: '완료',
  incomplete: '미완료',
  scheduled: '예정',
};

const STATUS_COLORS: Record<TbmStatus, { bg: string; text: string; dot: string }> = {
  completed: { bg: 'rgba(34,197,94,0.1)', text: '#15803d', dot: '#22c55e' },
  incomplete: { bg: 'rgba(229,72,77,0.1)', text: '#b91c1c', dot: '#e5484d' },
  scheduled: { bg: 'rgba(62,99,221,0.1)', text: '#1d4ed8', dot: '#3e63dd' },
};

type FilterTab = 'all' | TbmStatus;

// ─── Today Hero Card ────────────────────────────────────────────────────────

function TodayHeroCard({ item }: { item: TbmItem }) {
  const done = item.checklist.filter((c) => c.done).length;
  const total = item.checklist.length;
  const pct = total > 0 ? done / total : 0;
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
              <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 11, letterSpacing: 1, color: '#ffffff' }}>
                TODAY
              </Text>
            </View>
            <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 13, color: 'rgba(255,255,255,0.7)', letterSpacing: -0.2 }}>
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
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, color: 'rgba(255,255,255,0.7)', letterSpacing: -0.2 }}>
                책임자 {item.supervisor} · 참석 {item.attendeeCount}명
              </Text>
            </View>
          </View>

          {/* 체크리스트 진행률 */}
          <View style={{ gap: 8 }}>
            <View className="flex-row items-center justify-between">
              <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 12, color: 'rgba(255,255,255,0.7)', letterSpacing: -0.2 }}>
                체크리스트 진행률
              </Text>
              <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 13, color: '#ffffff' }}>
                {done}/{total}
              </Text>
            </View>
            <View className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <View
                className="h-full rounded-full"
                style={{ width: `${pct * 100}%`, backgroundColor: pct >= 1 ? '#4ade80' : '#ffffff' }}
              />
            </View>
          </View>

          {/* CTA 버튼 */}
          <View
            className="flex-row items-center justify-between rounded-2xl px-5"
            style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingVertical: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' }}>
            <View style={{ gap: 2 }}>
              <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 16, color: '#ffffff', letterSpacing: -0.35 }}>
                TBM 시작하기
              </Text>
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, color: 'rgba(255,255,255,0.65)', letterSpacing: -0.2 }}>
                확인할 사항 {pendingItems}개 남음
              </Text>
            </View>
            <View
              className="h-10 w-10 items-center justify-center rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
              <ChevronRight color="#ffffff" size={20} strokeWidth={2.5} />
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Link>
  );
}

// ─── No Today Card ───────────────────────────────────────────────────────────

function NoTodayCard() {
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
        <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 17, letterSpacing: -0.4, color: '#1c2024' }}>
          오늘 예정된 TBM 없음
        </Text>
        <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 14, color: 'rgba(0,7,20,0.5)', letterSpacing: -0.2, textAlign: 'center', lineHeight: 21 }}>
          오늘 등록된 TBM 일정이 없습니다.{'\n'}이전 기록을 확인하거나 담당자에게 문의하세요.
        </Text>
      </LinearGradient>
    </View>
  );
}

// ─── Stats Row ───────────────────────────────────────────────────────────────

function StatsRow({ items }: { items: TbmItem[] }) {
  const total = items.length;
  const completed = items.filter((t) => t.status === 'completed').length;
  const incomplete = items.filter((t) => t.status === 'incomplete').length;
  const scheduled = items.filter((t) => t.status === 'scheduled').length;

  const chips = [
    { label: '전체', value: total, color: '#3e63dd', bg: 'rgba(62,99,221,0.08)' },
    { label: '완료', value: completed, color: '#15803d', bg: 'rgba(34,197,94,0.08)' },
    { label: '미완료', value: incomplete, color: '#b91c1c', bg: 'rgba(229,72,77,0.08)' },
    { label: '예정', value: scheduled, color: '#1d4ed8', bg: 'rgba(62,99,221,0.08)' },
  ];

  return (
    <View className="flex-row gap-2">
      {chips.map(({ label, value, color, bg }) => (
        <View
          key={label}
          className="flex-1 items-center justify-center rounded-2xl py-3"
          style={{ backgroundColor: bg }}>
          <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 18, color, letterSpacing: -0.4 }}>
            {value}
          </Text>
          <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 11, color: 'rgba(0,7,20,0.5)', marginTop: 2, letterSpacing: -0.1 }}>
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}

// ─── Filter Tabs ─────────────────────────────────────────────────────────────

const TABS: { key: FilterTab; label: string }[] = [
  { key: 'all', label: '전체' },
  { key: 'completed', label: '완료' },
  { key: 'incomplete', label: '미완료' },
  { key: 'scheduled', label: '예정' },
];

function FilterTabs({ active, onChange }: { active: FilterTab; onChange: (k: FilterTab) => void }) {
  return (
    <View className="flex-row rounded-xl p-1" style={{ backgroundColor: 'rgba(0,0,47,0.06)' }}>
      {TABS.map(({ key, label }) => (
        <Pressable
          key={key}
          onPress={() => onChange(key)}
          className="flex-1 items-center rounded-lg py-2"
          style={{ backgroundColor: active === key ? '#ffffff' : 'transparent' }}
          accessibilityRole="tab"
          accessibilityState={{ selected: active === key }}>
          <Text
            style={{
              fontFamily: active === key ? 'Pretendard-SemiBold' : 'Pretendard-Regular',
              fontSize: 13,
              letterSpacing: -0.2,
              color: active === key ? '#1c2024' : 'rgba(0,7,20,0.5)',
            }}>
            {label}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

// ─── Past TBM Row Card ───────────────────────────────────────────────────────

function PastTbmCard({ item }: { item: TbmItem }) {
  const done = item.checklist.filter((c) => c.done).length;
  const total = item.checklist.length;
  const pct = total > 0 ? done / total : 0;
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
        <View className="p-4" style={{ gap: 10 }}>
          {/* 상단 행: 날짜 + 상태 뱃지 */}
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center gap-2">
              <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 15, color: '#1c2024', letterSpacing: -0.3 }}>
                {getDayLabel(item.scheduledAt)}
              </Text>
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, color: 'rgba(0,7,20,0.4)', letterSpacing: -0.2 }}>
                {getHHMM(item.scheduledAt)}
              </Text>
            </View>
            <View
              className="flex-row items-center gap-1.5 rounded-full px-2.5 py-1"
              style={{ backgroundColor: sc.bg }}>
              <View className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: sc.dot }} />
              <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 12, color: sc.text, letterSpacing: -0.2 }}>
                {STATUS_LABEL[item.status]}
              </Text>
            </View>
          </View>

          {/* 제목 */}
          <Text
            style={{ fontFamily: 'Pretendard-Bold', fontSize: 17, letterSpacing: -0.4, color: '#1c2024', lineHeight: 24 }}
            numberOfLines={1}>
            {item.title}
          </Text>

          {/* 메타 정보 행 */}
          <View className="flex-row items-center gap-3">
            <View className="flex-1 flex-row items-center gap-1">
              <Users color="#94a3b8" size={12} strokeWidth={2} />
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, color: '#64748b', letterSpacing: -0.15 }}>
                책임자 {item.supervisor} · 참석 {item.attendeeCount}명
              </Text>
            </View>
          </View>

          {/* 하단 행: 체크리스트 진행률 + 화살표 */}
          <View className="flex-row items-center gap-3">
            <View className="flex-1 flex-row items-center gap-2">
              <View className="h-1.5 flex-1 overflow-hidden rounded-full" style={{ backgroundColor: 'rgba(0,0,47,0.07)' }}>
                <View
                  className="h-full rounded-full"
                  style={{ width: `${pct * 100}%`, backgroundColor: pct >= 1 ? '#22c55e' : '#3e63dd' }}
                />
              </View>
              <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 12, color: pct >= 1 ? '#15803d' : '#3e63dd', letterSpacing: -0.2 }}>
                {done}/{total}
              </Text>
            </View>
            <View className="flex-row items-center gap-1">
              {item.status === 'completed' ? (
                <CheckCircle2 color="#22c55e" size={16} strokeWidth={2} />
              ) : item.status === 'incomplete' ? (
                <XCircle color="#e5484d" size={16} strokeWidth={2} />
              ) : null}
              <ChevronRight color="#cbd5e1" size={18} strokeWidth={2} />
            </View>
          </View>
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
  const [filter, setFilter] = useState<FilterTab>('all');

  const headerBlockH = 40 + 8;
  const scrollPadTop = insets.top + headerBlockH + 24;

  const todayTbm = useMemo(() => MOCK_TBMS.find((t) => isToday(t.scheduledAt)), []);
  const pastTbms = useMemo(
    () =>
      MOCK_TBMS.filter((t) => !isToday(t.scheduledAt)).sort(
        (a, b) => new Date(b.scheduledAt).getTime() - new Date(a.scheduledAt).getTime(),
      ),
    [],
  );

  const filteredPast = useMemo(
    () => (filter === 'all' ? pastTbms : pastTbms.filter((t) => t.status === filter)),
    [pastTbms, filter],
  );

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
            <Text
              style={{ fontFamily: 'Pretendard-Bold', fontSize: 20, letterSpacing: -0.5, color: '#ffffff' }}>
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
        className="flex-1"
        style={{ paddingTop: scrollPadTop }}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) + 24, gap: 20, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}>

        {/* ── 오늘의 TBM ── */}
        {todayTbm ? <TodayHeroCard item={todayTbm} /> : <NoTodayCard />}

        {/* ── 통계 ── */}
        <StatsRow items={MOCK_TBMS} />

        {/* ── 이전 기록 ── */}
        <View style={{ gap: 10 }}>
          <View className="flex-row items-center justify-between">
            <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 13, letterSpacing: -0.2, color: 'rgba(0,7,20,0.45)' }}>
              이전 기록
            </Text>
            <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, color: 'rgba(0,7,20,0.35)', letterSpacing: -0.15 }}>
              {filteredPast.length}건
            </Text>
          </View>

          {/* 필터 탭 */}
          <FilterTabs active={filter} onChange={setFilter} />

          {/* 리스트 */}
          {filteredPast.length > 0 ? (
            <View style={{ gap: 8 }}>
              {filteredPast.map((item) => (
                <PastTbmCard key={item.id} item={item} />
              ))}
            </View>
          ) : (
            <View
              className="items-center rounded-2xl py-10"
              style={{ backgroundColor: 'rgba(0,0,47,0.03)', borderWidth: 1, borderColor: 'rgba(0,0,47,0.07)' }}>
              <ClipboardList color="#94a3b8" size={32} strokeWidth={1.5} />
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 14, color: '#94a3b8', marginTop: 10, letterSpacing: -0.2 }}>
                해당 상태의 TBM 기록이 없습니다
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
