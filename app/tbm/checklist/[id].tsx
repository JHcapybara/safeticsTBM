import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  FileText,
  PenLine,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react-native';
import { useRef, useState } from 'react';
import { PanResponder, Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { getTbmById, TbmSurveyItem } from '@/constants/tbm';

/** TBM-03 — 항목별 확인 워크스루 (Figma node 72:259788) */

type WalkCategory = 'caution' | 'ppe' | 'notice';

type WalkItem =
  | { category: 'caution' | 'ppe'; item: TbmSurveyItem; indexInCat: number; catTotal: number }
  | { category: 'notice'; text: string };

const CATEGORY_META: Record<
  WalkCategory,
  { label: string; color: string; bg: string; icon: typeof AlertTriangle }
> = {
  caution: { label: '주의사항',            color: '#d97706', bg: 'rgba(217,119,6,0.09)',  icon: AlertTriangle },
  ppe:     { label: '개인안전보호구(PPE)', color: '#0d9488', bg: 'rgba(13,148,136,0.09)', icon: ShieldCheck   },
  notice:  { label: '오늘의 특별 공지',   color: '#3e63dd', bg: 'rgba(62,99,221,0.09)',  icon: FileText      },
};

type Point = { x: number; y: number };

function formatDateKR(iso: string) {
  const d = new Date(iso);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`;
}

function pointsToPath(points: Point[]): string {
  if (points.length < 2) return '';
  return points.reduce(
    (acc, pt, i) => acc + (i === 0 ? `M${pt.x},${pt.y}` : ` L${pt.x},${pt.y}`),
    '',
  );
}

// ─── 기본 정보 미니 카드 ─────────────────────────────────────────────────────

function BasicInfoMini({ supervisor, date }: { supervisor: string; date: string }) {
  return (
    <View
      className="w-full overflow-hidden rounded-xl border"
      style={{
        borderColor: 'rgba(0,0,47,0.12)',
        backgroundColor: '#ffffff',
        shadowColor: '#002ec9',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
      }}>
      <View style={{ backgroundColor: '#f9f9f9', paddingHorizontal: 14, paddingVertical: 10, gap: 8 }}>
        <View className="flex-row items-center justify-between">
          <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 12, letterSpacing: -0.25, color: 'rgba(0,7,20,0.4)' }}>
            기본 정보
          </Text>
          <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 12, letterSpacing: -0.25, color: '#1c2024' }}>
            {date}
          </Text>
        </View>
        <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.08)' }} />
        <View className="flex-row items-center" style={{ gap: 10 }}>
          <View
            className="items-center justify-center overflow-hidden rounded-lg"
            style={{ width: 34, height: 34, backgroundColor: '#3e63dd' }}>
            <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 14, color: '#ffffff' }}>
              {supervisor.charAt(0)}
            </Text>
          </View>
          <View style={{ gap: 1 }}>
            <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 13, letterSpacing: -0.3, color: '#1c2024' }}>
              {supervisor}
            </Text>
            <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 11, letterSpacing: -0.2, color: 'rgba(0,7,20,0.5)' }}>
              작업 책임자
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          <View
            className="items-center justify-center rounded overflow-hidden"
            style={{ backgroundColor: 'rgba(0,164,51,0.1)', paddingHorizontal: 7, paddingVertical: 3 }}>
            <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 11, letterSpacing: -0.2, color: 'rgba(0,113,63,0.87)' }}>
              TBM 책임자
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── 서명 페이지 (Full-height) ────────────────────────────────────────────────

function SignPage({
  supervisor,
  date,
  onComplete,
}: {
  supervisor: string;
  date: string;
  onComplete: () => void;
}) {
  const [strokes, setStrokes] = useState<Point[][]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const currentStrokeRef = useRef<Point[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);

  const isSigned = strokes.length > 0;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentStrokeRef.current = [{ x: locationX, y: locationY }];
        setCurrentStroke([{ x: locationX, y: locationY }]);
      },
      onPanResponderMove: (evt) => {
        const { locationX, locationY } = evt.nativeEvent;
        currentStrokeRef.current = [...currentStrokeRef.current, { x: locationX, y: locationY }];
        setCurrentStroke([...currentStrokeRef.current]);
      },
      onPanResponderRelease: () => {
        if (currentStrokeRef.current.length > 1) {
          setStrokes((prev) => [...prev, [...currentStrokeRef.current]]);
        }
        currentStrokeRef.current = [];
        setCurrentStroke([]);
      },
    }),
  ).current;

  return (
    <View style={{ flex: 1, gap: 10 }}>
      {/* 완료 배너 */}
      <View
        className="w-full overflow-hidden rounded-xl"
        style={{
          backgroundColor: 'rgba(0,164,51,0.07)',
          borderWidth: 1,
          borderColor: 'rgba(0,164,51,0.18)',
          padding: 12,
          gap: 4,
        }}>
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <CheckCircle2 color="rgba(0,113,63,0.87)" size={16} strokeWidth={2} />
          <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 13, letterSpacing: -0.3, color: 'rgba(0,113,63,0.87)' }}>
            모든 항목 확인 완료 — 서명하여 TBM을 완료해 주세요.
          </Text>
        </View>
      </View>

      {/* 서명 카드 (flex: 1 — 남은 공간 전체) */}
      <View
        className="w-full overflow-hidden rounded-xl border"
        style={{
          flex: 1,
          borderColor: 'rgba(0,0,47,0.12)',
          backgroundColor: '#ffffff',
          shadowColor: '#002ec9',
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.07,
          shadowRadius: 20,
          elevation: 3,
          padding: 16,
          gap: 10,
        }}>
        {/* 헤더: 아이콘 + 타이틀 + 날짜(우측) */}
        <View className="flex-row items-center" style={{ gap: 10 }}>
          <View
            className="items-center justify-center rounded-xl"
            style={{ width: 36, height: 36, backgroundColor: 'rgba(62,99,221,0.1)' }}>
            <PenLine color="#3e63dd" size={17} strokeWidth={2} />
          </View>
          <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 15, letterSpacing: -0.4, color: '#1c2024', flex: 1 }}>
            참석 확인 및 서명
          </Text>
          <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, letterSpacing: -0.2, color: 'rgba(0,7,20,0.45)', textAlign: 'right' }}>
            {date}
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.08)' }} />

        {/* 책임자 행 */}
        <View className="flex-row items-center justify-between">
          <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 13, letterSpacing: -0.3, color: 'rgba(0,7,20,0.5)' }}>
            책임자
          </Text>
          <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 13, letterSpacing: -0.3, color: '#1c2024' }}>
            {supervisor}
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.08)' }} />

        {/* 서명란 레이블 + 지우기 버튼 */}
        <View className="flex-row items-center justify-between">
          <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 12, letterSpacing: -0.25, color: 'rgba(0,7,20,0.5)' }}>
            서명
          </Text>
          {isSigned && (
            <Pressable
              onPress={() => { setStrokes([]); setCurrentStroke([]); }}
              className="flex-row items-center gap-1 active:opacity-60"
              hitSlop={8}>
              <RotateCcw color="rgba(0,7,20,0.4)" size={12} strokeWidth={2} />
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 11, letterSpacing: -0.2, color: 'rgba(0,7,20,0.4)' }}>
                다시 서명
              </Text>
            </Pressable>
          )}
        </View>

        {/* 서명 캔버스 (flex: 1 — 최대 크기) */}
        <View
          {...panResponder.panHandlers}
          onLayout={(e) =>
            setCanvasSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })
          }
          style={{
            flex: 1,
            borderRadius: 12,
            borderWidth: 1.5,
            borderStyle: 'dashed',
            borderColor: isSigned ? 'rgba(62,99,221,0.35)' : 'rgba(0,0,47,0.15)',
            backgroundColor: isSigned ? 'rgba(62,99,221,0.02)' : 'rgba(0,0,47,0.015)',
            overflow: 'hidden',
          }}>
          {/* 빈 상태 플레이스홀더 */}
          {!isSigned && (
            <View
              style={{
                position: 'absolute',
                inset: 0,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                pointerEvents: 'none',
              }}>
              <PenLine color="rgba(0,0,47,0.18)" size={32} strokeWidth={1.5} />
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 14, letterSpacing: -0.3, color: 'rgba(0,7,20,0.3)' }}>
                서명하기
              </Text>
            </View>
          )}

          {/* SVG 필기 캔버스 */}
          {canvasSize.width > 0 && (
            <Svg
              width={canvasSize.width}
              height={canvasSize.height}
              style={{ position: 'absolute', top: 0, left: 0 }}>
              {strokes.map((stroke, i) => (
                <Path
                  key={i}
                  d={pointsToPath(stroke)}
                  stroke="#1c2024"
                  strokeWidth={2.2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {currentStroke.length > 1 && (
                <Path
                  d={pointsToPath(currentStroke)}
                  stroke="#1c2024"
                  strokeWidth={2.2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
          )}
        </View>

        {/* 동의 문구 */}
        <Text style={{
          fontFamily: 'Pretendard-Regular',
          fontSize: 11,
          letterSpacing: -0.15,
          color: 'rgba(0,7,20,0.32)',
          lineHeight: 17,
          textAlign: 'center',
        }}>
          본인은 위 TBM 내용을 모두 확인하였으며 안전 수칙을 준수할 것을 확인합니다.
        </Text>

        {/* 완료 버튼 */}
        <Pressable
          onPress={isSigned ? onComplete : undefined}
          className="h-12 w-full items-center justify-center rounded-xl"
          style={{ backgroundColor: isSigned ? '#3e63dd' : 'rgba(0,0,47,0.07)' }}
          accessibilityRole="button">
          <Text style={{
            fontFamily: 'Pretendard-Medium',
            fontSize: 16,
            letterSpacing: -0.4,
            color: isSigned ? '#ffffff' : 'rgba(0,7,20,0.28)',
          }}>
            {isSigned ? 'TBM 완료하기' : '서명 후 완료 가능합니다'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

// ─── 설문 항목 카드 ───────────────────────────────────────────────────────────

function SurveyItemCard({
  item,
  meta,
  indexInCat,
  catTotal,
  step,
  totalItems,
  nextLabel,
}: {
  item: TbmSurveyItem;
  meta: (typeof CATEGORY_META)[WalkCategory];
  indexInCat: number;
  catTotal: number;
  step: number;
  totalItems: number;
  nextLabel: string;
}) {
  const Icon = meta.icon;
  return (
    <View
      className="w-full overflow-hidden rounded-xl border"
      style={{
        borderColor: 'rgba(0,0,47,0.12)',
        backgroundColor: '#ffffff',
        shadowColor: '#002ec9',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.07,
        shadowRadius: 24,
        elevation: 3,
        padding: 14,
        gap: 12,
      }}>
      {/* 브레드크럼 + 진행 카운터 */}
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1 mr-3" style={{ gap: 5 }}>
          <View
            className="items-center justify-center overflow-hidden rounded"
            style={{ backgroundColor: meta.color, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 11, letterSpacing: -0.2, color: '#ffffff' }}>
              {meta.label}
            </Text>
          </View>
          <ChevronRight color="rgba(0,7,20,0.25)" size={12} strokeWidth={2} />
          <Text
            numberOfLines={1}
            style={{ fontFamily: 'Pretendard-Regular', fontSize: 11, letterSpacing: -0.2, color: 'rgba(0,7,20,0.4)', flex: 1 }}>
            {nextLabel}
          </Text>
        </View>
        <View
          className="items-center justify-center overflow-hidden rounded"
          style={{ backgroundColor: '#8b8d98', paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 11, letterSpacing: -0.2, color: '#ffffff' }}>
            {step + 1} / {totalItems}
          </Text>
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.08)' }} />

      {/* 카테고리 아이콘 + 소분류 */}
      <View className="flex-row items-center" style={{ gap: 8 }}>
        <View
          className="items-center justify-center rounded-lg"
          style={{ width: 30, height: 30, backgroundColor: meta.bg }}>
          <Icon color={meta.color} size={15} strokeWidth={2} />
        </View>
        <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 12, letterSpacing: -0.25, color: 'rgba(0,7,20,0.5)' }}>
          {meta.label} {indexInCat} / {catTotal}
        </Text>
      </View>

      {/* 위험인자 · 유해요인 태그 */}
      <View className="flex-row items-center flex-wrap" style={{ gap: 6 }}>
        <View
          className="overflow-hidden rounded"
          style={{ backgroundColor: meta.bg, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 11, letterSpacing: -0.2, color: meta.color }}>
            위험인자: {item.hazardFactor}
          </Text>
        </View>
        <View
          className="overflow-hidden rounded"
          style={{ backgroundColor: 'rgba(0,0,47,0.05)', paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 11, letterSpacing: -0.2, color: 'rgba(0,7,20,0.55)' }}>
            유해요인: {item.harmfulFactor}
          </Text>
        </View>
      </View>

      {/* 설문 내용 */}
      <View style={{ paddingVertical: 4, minHeight: 80 }}>
        <Text style={{
          fontFamily: 'Pretendard-Regular',
          fontSize: 18,
          lineHeight: 29,
          letterSpacing: -0.45,
          color: 'rgba(0,7,20,0.75)',
        }}>
          {item.question}
        </Text>
      </View>
    </View>
  );
}

// ─── 특별 공지 카드 ───────────────────────────────────────────────────────────

function NoticeCard({ text, step, totalItems }: { text: string; step: number; totalItems: number }) {
  const meta = CATEGORY_META.notice;
  const Icon = meta.icon;
  return (
    <View
      className="w-full overflow-hidden rounded-xl border"
      style={{
        borderColor: 'rgba(62,99,221,0.18)',
        backgroundColor: '#ffffff',
        shadowColor: '#002ec9',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.07,
        shadowRadius: 24,
        elevation: 3,
        padding: 14,
        gap: 12,
      }}>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center" style={{ gap: 6 }}>
          <View
            className="items-center justify-center overflow-hidden rounded"
            style={{ backgroundColor: meta.color, paddingHorizontal: 8, paddingVertical: 4 }}>
            <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 11, letterSpacing: -0.2, color: '#ffffff' }}>
              {meta.label}
            </Text>
          </View>
          <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 11, letterSpacing: -0.2, color: 'rgba(0,7,20,0.4)' }}>
            마지막 확인 항목
          </Text>
        </View>
        <View
          className="items-center justify-center overflow-hidden rounded"
          style={{ backgroundColor: '#8b8d98', paddingHorizontal: 8, paddingVertical: 4 }}>
          <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 11, letterSpacing: -0.2, color: '#ffffff' }}>
            {step + 1} / {totalItems}
          </Text>
        </View>
      </View>

      <View style={{ height: 1, backgroundColor: 'rgba(62,99,221,0.1)' }} />

      <View className="flex-row items-center" style={{ gap: 8 }}>
        <View className="items-center justify-center rounded-lg" style={{ width: 30, height: 30, backgroundColor: meta.bg }}>
          <Icon color={meta.color} size={15} strokeWidth={2} />
        </View>
        <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 12, letterSpacing: -0.25, color: 'rgba(0,7,20,0.5)' }}>
          오늘의 공지사항
        </Text>
      </View>

      <View
        className="overflow-hidden rounded-xl"
        style={{ backgroundColor: 'rgba(62,99,221,0.04)', borderWidth: 1, borderColor: 'rgba(62,99,221,0.1)', padding: 14 }}>
        <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 16, lineHeight: 27, letterSpacing: -0.4, color: 'rgba(0,7,20,0.75)' }}>
          {text}
        </Text>
      </View>
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function TbmChecklistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState(0);

  const tbm = id ? getTbmById(String(id)) : undefined;

  const headerH = insets.top + 40 + 8 + 14;
  const scrollPadTop = headerH + 12;
  const bottomBarH = insets.bottom + 64 + 12 + 8;

  if (!tbm) {
    return (
      <View className="flex-1 items-center justify-center bg-[#fbfdff]">
        <Text style={{ fontFamily: 'Pretendard-Regular', color: '#64748b' }}>TBM을 찾을 수 없습니다.</Text>
      </View>
    );
  }

  const allItems: WalkItem[] = [
    ...tbm.cautionItems.map((item, i) => ({
      category: 'caution' as const,
      item,
      indexInCat: i + 1,
      catTotal: tbm.cautionItems.length,
    })),
    ...tbm.ppeItems.map((item, i) => ({
      category: 'ppe' as const,
      item,
      indexInCat: i + 1,
      catTotal: tbm.ppeItems.length,
    })),
    ...(tbm.specialNotice ? [{ category: 'notice' as const, text: tbm.specialNotice }] : []),
  ];

  const isSignPage = step >= allItems.length;
  const currentWalkItem = isSignPage ? null : allItems[step];

  const nextItem = !isSignPage && step + 1 < allItems.length ? allItems[step + 1] : null;
  const nextLabel = (() => {
    if (!nextItem) return '서명';
    if (nextItem.category === 'notice') return '오늘의 특별 공지';
    if (!currentWalkItem || currentWalkItem.category !== nextItem.category)
      return CATEGORY_META[nextItem.category].label;
    return `항목 ${(nextItem as Extract<WalkItem, { category: 'caution' | 'ppe' }>).indexInCat}`;
  })();

  const handleConfirm = () => setStep((s) => s + 1);

  // ── 공통 헤더 ──────────────────────────────────────────────────────────────
  const Header = (
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
            Today's TBM
          </Text>
        </View>
        <View
          className="items-center justify-center rounded-md"
          style={{ backgroundColor: 'rgba(255,255,255,0.18)', paddingHorizontal: 10, height: 40, minWidth: 46 }}>
          <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 12, letterSpacing: -0.2, color: '#ffffff' }}>
            {isSignPage ? '✓' : `${step + 1}/${allItems.length}`}
          </Text>
        </View>
      </View>
    </View>
  );

  // ── 서명 페이지: ScrollView 없이 full-height 레이아웃 ──────────────────────
  if (isSignPage) {
    return (
      <View className="flex-1 bg-[#fbfdff]">
        {Header}
        <View
          style={{
            flex: 1,
            paddingTop: scrollPadTop,
            paddingHorizontal: 16,
            paddingBottom: Math.max(insets.bottom, 16) + 4,
            gap: 8,
          }}>
          <BasicInfoMini supervisor={tbm.supervisor} date={formatDateKR(tbm.scheduledAt)} />
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center gap-1.5 overflow-hidden rounded-md active:opacity-70"
            style={{ backgroundColor: '#8b8d98', paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' }}>
            <ArrowLeft color="#ffffff" size={13} strokeWidth={2} />
            <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 12, letterSpacing: -0.25, color: '#ffffff' }}>
              목록으로 돌아가기
            </Text>
          </Pressable>
          <SignPage
            supervisor={tbm.supervisor}
            date={formatDateKR(tbm.scheduledAt)}
            onComplete={() => router.back()}
          />
        </View>
      </View>
    );
  }

  // ── 항목 확인 페이지: ScrollView ──────────────────────────────────────────
  return (
    <View className="flex-1 bg-[#fbfdff]">
      {Header}
      <ScrollView
        className="flex-1"
        style={{ paddingTop: scrollPadTop }}
        contentContainerStyle={{ paddingBottom: bottomBarH + 8, gap: 8 }}
        showsVerticalScrollIndicator={false}>
        <View className="px-4">
          <BasicInfoMini supervisor={tbm.supervisor} date={formatDateKR(tbm.scheduledAt)} />
        </View>
        <View className="px-4">
          <Pressable
            onPress={() => router.back()}
            className="flex-row items-center gap-1.5 overflow-hidden rounded-md active:opacity-70"
            style={{ backgroundColor: '#8b8d98', paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' }}>
            <ArrowLeft color="#ffffff" size={13} strokeWidth={2} />
            <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 12, letterSpacing: -0.25, color: '#ffffff' }}>
              목록으로 돌아가기
            </Text>
          </Pressable>
        </View>

        {currentWalkItem?.category === 'notice' ? (
          <View className="px-4">
            <NoticeCard
              text={(currentWalkItem as Extract<WalkItem, { category: 'notice' }>).text}
              step={step}
              totalItems={allItems.length}
            />
          </View>
        ) : currentWalkItem ? (
          <View className="px-4">
            <SurveyItemCard
              item={(currentWalkItem as Extract<WalkItem, { category: 'caution' | 'ppe' }>).item}
              meta={CATEGORY_META[currentWalkItem.category as 'caution' | 'ppe']}
              indexInCat={(currentWalkItem as Extract<WalkItem, { category: 'caution' | 'ppe' }>).indexInCat}
              catTotal={(currentWalkItem as Extract<WalkItem, { category: 'caution' | 'ppe' }>).catTotal}
              step={step}
              totalItems={allItems.length}
              nextLabel={nextLabel}
            />
          </View>
        ) : null}
      </ScrollView>

      {/* 하단 확인 버튼 */}
      <View
        className="absolute bottom-0 left-0 right-0"
        style={{
          backgroundColor: '#ffffff',
          paddingHorizontal: 16,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 16) + 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.07,
          shadowRadius: 20,
          elevation: 12,
        }}>
        <Pressable
          onPress={handleConfirm}
          className="h-12 w-full flex-row items-center justify-center gap-2 rounded-xl bg-[#3e63dd] active:opacity-90"
          accessibilityRole="button">
          <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 18, letterSpacing: -0.45, color: '#ffffff' }}>
            위 내용을 모두 확인함
          </Text>
          <ChevronRight color="#ffffff" size={20} strokeWidth={2.5} />
        </Pressable>
      </View>
    </View>
  );
}
