import { useNavigation } from '@react-navigation/native';
import { Href, useLocalSearchParams, useRouter } from 'expo-router';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  FileText,
  Loader2,
  Menu,
  PenLine,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react-native';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Alert, PanResponder, Platform, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { cacheDirectory, EncodingType, writeAsStringAsync } from 'expo-file-system/legacy';
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator';
import { captureRef } from 'react-native-view-shot';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CenteredColumn } from '@/components/CenteredColumn';
import { scrollViewAndroidProps } from '@/constants/scrollViewAndroid';
import {
  applyLocalTbmSignatureCompletion,
  getTbmById,
  normalizeSignatureForExport,
  serializeSignaturePayloadForApi,
  signatureStrokeToPathD,
  TbmSurveyItem,
  type SignaturePoint,
  type TbmSignatureExport,
} from '@/constants/tbm';
import { useLang } from '@/contexts/LangContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import type { Strings } from '@/lang';
import { uploadSignatureToStorage } from '@/services/tbmSignatureUpload';

/** TBM-03 — 항목별 확인 워크스루 (Figma node 72:259788) */

type WalkCategory = 'caution' | 'ppe' | 'notice';

type WalkItem =
  | { category: 'caution' | 'ppe'; item: TbmSurveyItem; indexInCat: number; catTotal: number }
  | { category: 'notice'; text: string };
type WalkDecision = 'ok' | 'issue';

type CategoryMeta = { label: string; color: string; bg: string; icon: typeof AlertTriangle };

function getCategoryMeta(s: Strings): Record<WalkCategory, CategoryMeta> {
  return {
    caution: { label: s.checklist.cautions, color: '#d97706', bg: 'rgba(217,119,6,0.09)',  icon: AlertTriangle },
    ppe:     { label: s.checklist.ppe,      color: '#0d9488', bg: 'rgba(13,148,136,0.09)', icon: ShieldCheck   },
    notice:  { label: s.checklist.specialNotice, color: '#3e63dd', bg: 'rgba(62,99,221,0.09)', icon: FileText },
  };
}

function formatDateKR(iso: string) {
  const d = new Date(iso);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`;
}

const optimizeSignature = async (
  imageUri: string,
  maxWidth = 400,
  quality = 0.7,
): Promise<string> => {
  const optimized = await manipulateAsync(
    imageUri,
    [{ resize: { width: maxWidth } }],
    {
      compress: quality,
      format: SaveFormat.JPEG,
      base64: true,
    },
  );
  if (!optimized.base64) {
    throw new Error('Signature optimization failed: missing base64 output');
  }
  return `data:image/jpeg;base64,${optimized.base64}`;
};

function SpinningLoader({ color = '#ffffff', size = 18 }: { color?: string; size?: number }) {
  const rotation = useSharedValue(0);
  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 880, easing: Easing.linear }),
      -1,
      false,
    );
    return () => cancelAnimation(rotation);
  }, [rotation]);
  const spinStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));
  return (
    <Animated.View style={spinStyle}>
      <Loader2 color={color} size={size} strokeWidth={2} />
    </Animated.View>
  );
}

function SurveyPager({
  onPrev,
  onNext,
  canPrev,
  canNext,
  pageLabel,
}: {
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
  pageLabel: string;
}) {
  return (
    <View className="flex-row items-center justify-between" style={{ gap: 10 }}>
      <Pressable
        onPress={onPrev}
        disabled={!canPrev}
        className="h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border active:opacity-90"
        style={{
          backgroundColor: canPrev ? '#ffffff' : 'rgba(0,0,47,0.04)',
          borderColor: 'rgba(0,0,47,0.12)',
        }}>
        <ChevronLeft color={canPrev ? '#475569' : 'rgba(0,7,20,0.25)'} size={18} strokeWidth={2.4} />
        <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 16, color: canPrev ? '#475569' : 'rgba(0,7,20,0.25)' }}>
          이전
        </Text>
      </Pressable>
      <View
        className="h-11 items-center justify-center rounded-xl border"
        style={{ minWidth: 86, borderColor: 'rgba(0,0,47,0.1)', backgroundColor: 'rgba(0,0,47,0.03)' }}>
        <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 16, color: 'rgba(0,7,20,0.7)' }}>{pageLabel}</Text>
      </View>
      <Pressable
        onPress={onNext}
        disabled={!canNext}
        className="h-11 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl border active:opacity-90"
        style={{
          backgroundColor: canNext ? '#ffffff' : 'rgba(0,0,47,0.04)',
          borderColor: 'rgba(0,0,47,0.12)',
        }}>
        <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 16, color: canNext ? '#475569' : 'rgba(0,7,20,0.25)' }}>
          다음
        </Text>
        <ChevronRight color={canNext ? '#475569' : 'rgba(0,7,20,0.25)'} size={18} strokeWidth={2.4} />
      </Pressable>
    </View>
  );
}

// ─── 기본 정보 미니 카드 ─────────────────────────────────────────────────────

function BasicInfoMini({ supervisor, date }: { supervisor: string; date: string }) {
  const { s } = useLang();
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
              {s.tbm.workManager}
            </Text>
          </View>
          <View style={{ flex: 1 }} />
          <View
            className="items-center justify-center rounded overflow-hidden"
            style={{ backgroundColor: 'rgba(0,164,51,0.1)', paddingHorizontal: 7, paddingVertical: 3 }}>
            <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 11, letterSpacing: -0.2, color: 'rgba(0,113,63,0.87)' }}>
              {s.tbm.tbmManager}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

// ─── 서명 페이지 (Full-height) ────────────────────────────────────────────────

function SignPage({
  tbmId,
  date,
  okCount,
  issueCount,
  totalCount,
  onComplete,
}: {
  tbmId: string;
  date: string;
  okCount: number;
  issueCount: number;
  totalCount: number;
  /** 제출 시 viewBox 160×80 SVG 경로 + 스토리지 imageUrl 포함 */
  onComplete: (payload: TbmSignatureExport) => void;
}) {
  const { s } = useLang();
  const [strokes, setStrokes] = useState<SignaturePoint[][]>([]);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [isCapturing, setIsCapturing] = useState(false);
  const currentStrokeRef = useRef<SignaturePoint[]>([]);
  const [currentStroke, setCurrentStroke] = useState<SignaturePoint[]>([]);
  const canvasRef = useRef<View>(null);

  const isSigned = strokes.length > 0;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      // Android: 캡처 단계 true 가 부모/시스템과 충돌해 터치가 끊기는 경우가 있어 OS별 분기
      onStartShouldSetPanResponderCapture: () => Platform.OS !== 'android',
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => Platform.OS !== 'android',
      onShouldBlockNativeResponder: () => true,
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
        const pts = currentStrokeRef.current;
        if (pts.length >= 1) {
          setStrokes((prev) => [...prev, [...pts]]);
        }
        currentStrokeRef.current = [];
        setCurrentStroke([]);
      },
      onPanResponderTerminate: () => {
        const pts = currentStrokeRef.current;
        if (pts.length >= 1) {
          setStrokes((prev) => [...prev, [...pts]]);
        }
        currentStrokeRef.current = [];
        setCurrentStroke([]);
      },
    }),
  ).current;

  return (
    <View style={{ flex: 1, gap: 12 }}>
      {/* 서명 카드 (flex: 1 — 남은 공간 전체) */}
      <View
        collapsable={false}
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
          padding: 12,
          gap: 8,
        }}>
        {/* 헤더 */}
        <View className="flex-row items-center" style={{ gap: 10 }}>
          <View
            className="items-center justify-center rounded-xl"
            style={{ width: 36, height: 36, backgroundColor: 'rgba(62,99,221,0.1)' }}>
            <PenLine color="#3e63dd" size={17} strokeWidth={2} />
          </View>
          <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 15, letterSpacing: -0.4, color: '#1c2024', flex: 1 }}>
            {s.checklist.attendanceAndSign}
          </Text>
          <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, letterSpacing: -0.2, color: 'rgba(0,7,20,0.45)', textAlign: 'right' }}>
            {date}
          </Text>
        </View>

        <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.08)' }} />

        {/* 설문 응답 요약 (서명 섹션 내부) */}
        <View
          className="w-full rounded-xl border"
          style={{
            borderColor: 'rgba(62,99,221,0.18)',
            backgroundColor: 'rgba(62,99,221,0.04)',
            paddingHorizontal: 10,
            paddingVertical: 8,
            gap: 8,
          }}>
          <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 12, letterSpacing: -0.2, color: '#3e63dd' }}>
            설문 응답 요약
          </Text>
          <View className="flex-row items-stretch" style={{ gap: 8 }}>
            <View className="flex-1 items-center justify-center rounded-lg" style={{ backgroundColor: '#ffffff', paddingVertical: 8 }}>
              <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 24, color: '#1c2024' }}>{totalCount}</Text>
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 11, color: 'rgba(0,7,20,0.5)' }}>전체</Text>
            </View>
            <View className="flex-1 items-center justify-center rounded-lg" style={{ backgroundColor: '#ffffff', paddingVertical: 8 }}>
              <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 24, color: '#3e63dd' }}>{okCount}</Text>
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 11, color: 'rgba(0,7,20,0.5)' }}>확인</Text>
            </View>
            <View className="flex-1 items-center justify-center rounded-lg" style={{ backgroundColor: '#ffffff', paddingVertical: 8 }}>
              <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 24, color: '#64748b' }}>{issueCount}</Text>
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 11, color: 'rgba(0,7,20,0.5)' }}>이슈</Text>
            </View>
          </View>
        </View>

        {/* 서명란 레이블 + 지우기 버튼 */}
        <View className="flex-row items-center justify-between">
          <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 12, letterSpacing: -0.25, color: 'rgba(0,7,20,0.5)' }}>
            {s.checklist.signLabel}
          </Text>
          {isSigned && (
            <Pressable
              onPress={() => { setStrokes([]); setCurrentStroke([]); }}
              className="flex-row items-center gap-1 active:opacity-60"
              hitSlop={8}>
              <RotateCcw color="rgba(0,7,20,0.4)" size={12} strokeWidth={2} />
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 11, letterSpacing: -0.2, color: 'rgba(0,7,20,0.4)' }}>
                {s.checklist.resignLabel}
              </Text>
            </Pressable>
          )}
        </View>

        {/* 서명 캔버스 (flex: 1 — 최대 크기) — captureRef 대상 */}
        <View
          ref={canvasRef}
          collapsable={false}
          {...panResponder.panHandlers}
          onLayout={(e) =>
            setCanvasSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })
          }
          style={{
            flex: 1,
            minHeight: Platform.OS === 'android' ? 300 : 260,
            borderRadius: 12,
            borderWidth: 1.5,
            // AOS: dashed 보더·레이아웃 이슈 회피
            borderStyle: Platform.OS === 'android' ? 'solid' : 'dashed',
            borderColor: isSigned ? 'rgba(62,99,221,0.35)' : 'rgba(0,0,47,0.15)',
            backgroundColor: '#ffffff',
            overflow: 'hidden',
          }}>
          {/* 빈 상태 플레이스홀더 */}
          {!isSigned && (
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                pointerEvents: 'none',
              }}>
              <PenLine color="rgba(0,0,47,0.18)" size={32} strokeWidth={1.5} />
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 14, letterSpacing: -0.3, color: 'rgba(0,7,20,0.3)' }}>
                {s.checklist.signHere}
              </Text>
            </View>
          )}

          {/* SVG 필기 캔버스 — AOS에서 높이 0 레이아웃 시에도 그리기 가능하도록 최소 1 보정 */}
          {canvasSize.width > 0 && (
            <Svg
              width={canvasSize.width}
              height={Math.max(canvasSize.height, 1)}
              style={{ position: 'absolute', top: 0, left: 0 }}
              pointerEvents="none">
              {strokes.map((stroke, i) => (
                <Path
                  key={i}
                  d={signatureStrokeToPathD(stroke)}
                  stroke="#1c2024"
                  strokeWidth={2.2}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ))}
              {currentStroke.length >= 1 && (
                <Path
                  d={signatureStrokeToPathD(currentStroke)}
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

        {/* 완료 버튼 — captureRef로 Base64 PNG 추출 후 payload 구성 */}
        <Pressable
          onPress={async () => {
            if (!isSigned || canvasSize.width <= 0 || isCapturing) return;
            setIsCapturing(true);
            try {
              const cw = canvasSize.width;
              const ch = Math.max(canvasSize.height, 1);
              const pathExport = normalizeSignatureForExport(strokes, cw, ch);

              const tempUri = await captureRef(canvasRef, {
                format: 'png',
                quality: 0.85,
                result: 'tmpfile',
              });
              const imageDataUrl = await optimizeSignature(tempUri, 400, 0.7);

              // ── [DEV only] 임시 경로에 압축 JPG 파일로 저장 ───────────────
              if (__DEV__ && cacheDirectory) {
                const base64 = imageDataUrl.replace(/^data:image\/\w+;base64,/, '');
                const filename = `tbm_sign_${Date.now()}.jpg`;
                const filePath = `${cacheDirectory}${filename}`;
                await writeAsStringAsync(filePath, base64, {
                  encoding: EncodingType.Base64,
                });
                console.log('[TBM sign] 서명 이미지 저장됨 →', filePath);
              }
              // ────────────────────────────────────────────────────────────

              const uploadedAt = new Date().toISOString();
              const { imageUrl } = await uploadSignatureToStorage({ tbmId, imageDataUrl });

              onComplete({
                ...pathExport,
                signatureImageUrl: imageUrl,
                uploadedAt,
              });
            } catch (e) {
              const detail = e instanceof Error ? e.message : String(e);
              Alert.alert(
                s.checklist.signatureUploadErrorTitle,
                `${s.checklist.signatureUploadErrorMessage}\n\n${detail}`,
                [{ text: s.checklist.signatureUploadErrorOk }],
              );
            } finally {
              setIsCapturing(false);
            }
          }}
          disabled={!isSigned || canvasSize.width <= 0 || isCapturing}
          className="h-12 w-full flex-row items-center justify-center gap-2 rounded-xl"
          style={{ opacity: isSigned && !isCapturing ? 1 : 1, backgroundColor: isSigned ? '#0d9488' : '#e2e8f0' }}
          accessibilityRole="button">
          {isCapturing && <SpinningLoader />}
          <Text style={{
            fontFamily: 'Pretendard-Medium',
            fontSize: 16,
            letterSpacing: -0.4,
            color: isSigned ? '#ffffff' : '#64748b',
          }}>
            {isCapturing
              ? s.checklist.signatureUploading
              : !isSigned
                ? '서명을 해주세요.'
              : issueCount > 0
                ? '이슈 보고 및 서명 제출'
                : '서명 제출'}
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
  decision,
  minCardHeight,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  item: TbmSurveyItem;
  meta: CategoryMeta;
  indexInCat: number;
  catTotal: number;
  step: number;
  totalItems: number;
  nextLabel: string;
  decision?: WalkDecision;
  minCardHeight: number;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  const Icon = meta.icon;
  return (
    <View
      className="w-full overflow-hidden rounded-xl border"
      style={{
        minHeight: minCardHeight,
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
      {/* 타이틀 행 (기존 2번째 행을 메인 타이틀로 승격) */}
      <View className="flex-row items-center" style={{ gap: 8 }}>
        <View
          className="items-center justify-center rounded-lg"
          style={{ width: 30, height: 30, backgroundColor: meta.bg }}>
          <Icon color={meta.color} size={15} strokeWidth={2} />
        </View>
        <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 18, letterSpacing: -0.2, color: '#1c2024', flex: 1 }}>
          {meta.label} {indexInCat} / {catTotal}
        </Text>
        {decision ? (
          <View
            className="items-center justify-center rounded-lg"
            style={{
              width: 30,
              height: 30,
              backgroundColor: decision === 'ok' ? 'rgba(62,99,221,0.12)' : 'rgba(100,116,139,0.12)',
            }}>
            {decision === 'ok' ? (
              <CheckCircle2 color="#3e63dd" size={17} strokeWidth={2.2} />
            ) : (
              <AlertCircle color="#64748b" size={17} strokeWidth={2.2} />
            )}
          </View>
        ) : (
          <View style={{ width: 30, height: 30 }} />
        )}
      </View>
      <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.08)' }} />

      {/* 위험인자 · 유해요인 태그 */}
      <View className="flex-row items-center flex-wrap" style={{ gap: 6 }}>
        <View
          className="overflow-hidden rounded"
          style={{ backgroundColor: meta.bg, paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 16, letterSpacing: -0.2, color: meta.color }}>
            {item.hazardFactor}
          </Text>
        </View>
        <View
          className="overflow-hidden rounded"
          style={{ backgroundColor: 'rgba(0,0,47,0.05)', paddingHorizontal: 8, paddingVertical: 3 }}>
          <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 16, letterSpacing: -0.2, color: 'rgba(0,7,20,0.55)' }}>
            {item.harmfulFactor}
          </Text>
        </View>
      </View>

      {/* 설문 내용 */}
      <View style={{ paddingVertical: 8, minHeight: 120, flex: 1, justifyContent: 'flex-start' }}>
        <Text style={{
          fontFamily: 'Pretendard-Regular',
          fontSize: 20,
          lineHeight: 32,
          letterSpacing: -0.45,
          color: 'rgba(0,7,20,0.75)',
        }}>
          {item.question}
        </Text>
      </View>
      <SurveyPager
        onPrev={onPrev}
        onNext={onNext}
        canPrev={canPrev}
        canNext={canNext}
        pageLabel={`${step + 1}/${totalItems}`}
      />
    </View>
  );
}

// ─── 특별 공지 카드 ───────────────────────────────────────────────────────────

function NoticeCard({
  text,
  step,
  totalItems,
  decision,
  minCardHeight,
  onPrev,
  onNext,
  canPrev,
  canNext,
}: {
  text: string;
  step: number;
  totalItems: number;
  decision?: WalkDecision;
  minCardHeight: number;
  onPrev: () => void;
  onNext: () => void;
  canPrev: boolean;
  canNext: boolean;
}) {
  const { s } = useLang();
  const meta = getCategoryMeta(s).notice;
  const Icon = meta.icon;
  return (
    <View
      className="w-full overflow-hidden rounded-xl border"
      style={{
        minHeight: minCardHeight,
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
        <View className="flex-row items-center" style={{ gap: 8 }}>
          <View className="items-center justify-center rounded-lg" style={{ width: 30, height: 30, backgroundColor: meta.bg }}>
            <Icon color={meta.color} size={15} strokeWidth={2} />
          </View>
          <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 18, letterSpacing: -0.2, color: '#1c2024' }}>
            {s.checklist.todayNoticeLabel}
          </Text>
        </View>
        {decision ? (
          <View
            className="items-center justify-center rounded-lg"
            style={{
              width: 30,
              height: 30,
              backgroundColor: decision === 'ok' ? 'rgba(62,99,221,0.12)' : 'rgba(100,116,139,0.12)',
            }}>
            {decision === 'ok' ? (
              <CheckCircle2 color="#3e63dd" size={17} strokeWidth={2.2} />
            ) : (
              <AlertCircle color="#64748b" size={17} strokeWidth={2.2} />
            )}
          </View>
        ) : (
          <View style={{ width: 30, height: 30 }} />
        )}
      </View>
      <View style={{ height: 1, backgroundColor: 'rgba(62,99,221,0.1)' }} />

      <View
        className="overflow-hidden rounded-xl"
        style={{ backgroundColor: 'rgba(62,99,221,0.04)', borderWidth: 1, borderColor: 'rgba(62,99,221,0.1)', padding: 14, flex: 1 }}>
        <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 20, lineHeight: 32, letterSpacing: -0.4, color: 'rgba(0,7,20,0.75)' }}>
          {text}
        </Text>
      </View>
      <SurveyPager
        onPrev={onPrev}
        onNext={onNext}
        canPrev={canPrev}
        canNext={canNext}
        pageLabel={`${step + 1}/${totalItems}`}
      />
    </View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function TbmChecklistScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { height: windowHeight } = useWindowDimensions();
  const router = useRouter();
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { s } = useLang();
  const { pagePaddingX, contentColumnMaxWidth, headerTitleFontSize } = useResponsiveLayout();
  const [step, setStep] = useState(0);
  const [decisions, setDecisions] = useState<Record<number, WalkDecision>>({});
  const [confirmAnimating, setConfirmAnimating] = useState(false);
  const [ackVariant, setAckVariant] = useState<'ok' | 'issue'>('ok');

  const ackBackdrop = useSharedValue(0);
  const ackIconScale = useSharedValue(0);

  const ackDimStyle = useAnimatedStyle(() => ({
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15,23,42,0.52)',
    opacity: ackBackdrop.value,
  }));

  const ackGroupStyle = useAnimatedStyle(() => ({
    opacity: ackBackdrop.value,
    alignItems: 'center',
  }));

  const ackBubbleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ackIconScale.value }],
  }));

  const CATEGORY_META = getCategoryMeta(s);

  const tbm = id ? getTbmById(String(id)) : undefined;

  const allItems: WalkItem[] = useMemo(() => {
    if (!tbm) return [];
    return [
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
  }, [tbm]);

  const isSignPage = !!tbm && step >= allItems.length;

  useLayoutEffect(() => {
    if (!tbm) return;
    if (isSignPage) {
      navigation.setOptions({
        gestureEnabled: false,
        fullScreenGestureEnabled: false,
      });
    } else {
      navigation.setOptions({
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      });
    }
    return () => {
      navigation.setOptions({
        gestureEnabled: true,
        fullScreenGestureEnabled: true,
      });
    };
  }, [navigation, tbm, isSignPage]);

  const headerH = insets.top + 40 + 8 + 14;
  const scrollPadTop = headerH + 12;
  const bottomBarH = insets.bottom + 64 + 12 + 8;
  const surveyCardMinHeight = Math.max(420, windowHeight - scrollPadTop - bottomBarH - 24);

  if (!tbm) {
    return (
      <View className="flex-1 items-center justify-center bg-[#fbfdff]">
        <Text style={{ fontFamily: 'Pretendard-Regular', color: '#64748b' }}>{s.tbm.notFound}</Text>
      </View>
    );
  }

  const currentWalkItem = isSignPage ? null : allItems[step];
  const currentDecision = !isSignPage ? decisions[step] : undefined;
  const okCount = useMemo(
    () => Object.values(decisions).filter((v) => v === 'ok').length,
    [decisions],
  );
  const issueCount = useMemo(
    () => Object.values(decisions).filter((v) => v === 'issue').length,
    [decisions],
  );

  const nextItem = !isSignPage && step + 1 < allItems.length ? allItems[step + 1] : null;
  const nextLabel = (() => {
    if (!nextItem) return s.checklist.signLabel;
    if (nextItem.category === 'notice') return s.checklist.specialNotice;
    if (!currentWalkItem || currentWalkItem.category !== nextItem.category)
      return CATEGORY_META[nextItem.category].label;
    return `항목 ${(nextItem as Extract<WalkItem, { category: 'caution' | 'ppe' }>).indexInCat}`;
  })();

  const handleConfirm = useCallback(
    (variant: 'ok' | 'issue') => {
      if (confirmAnimating) return;
      setDecisions((prev) => ({ ...prev, [step]: variant }));
      setAckVariant(variant);
      setConfirmAnimating(true);
      ackBackdrop.value = withTiming(1, { duration: 140 });
      ackIconScale.value = withSequence(
        withTiming(0, { duration: 0 }),
        withSpring(1, { damping: 14, stiffness: 220, mass: 0.75 }),
      );
      setTimeout(() => {
        setStep((v) => v + 1);
        ackBackdrop.value = withTiming(0, { duration: 220 });
        ackIconScale.value = withTiming(0, { duration: 200 });
        setConfirmAnimating(false);
      }, 520);
    },
    [ackBackdrop, ackIconScale, confirmAnimating, step],
  );

  const handleGoPrev = useCallback(() => {
    if (step <= 0 || confirmAnimating) return;
    setStep((v) => Math.max(0, v - 1));
  }, [confirmAnimating, step]);

  const handleGoNext = useCallback(() => {
    if (isSignPage || confirmAnimating) return;
    if (!decisions[step]) return;
      setStep((v) => Math.min(allItems.length, v + 1));
  }, [allItems.length, confirmAnimating, decisions, isSignPage, step]);

  // ── 공통 헤더 ──────────────────────────────────────────────────────────────
  const Header = (
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
        <Pressable
          onPress={() => router.replace('/tbm' as Href)}
          className="h-10 w-10 items-center justify-center rounded-md bg-[#3e63dd] active:opacity-80"
          accessibilityLabel="메뉴 열기">
          <Menu color="#ffffff" size={18} strokeWidth={2} />
        </Pressable>
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
            paddingHorizontal: pagePaddingX,
            paddingBottom: Math.max(insets.bottom, 16) + 4,
            gap: 12,
          }}>
          {/* SignPage가 flex:1로 남은 높이를 쓰므로 컬럼에도 flex:1 필요 (RN 부모 높이 미정이면 자식 flex가 0) */}
          <CenteredColumn maxWidth={contentColumnMaxWidth} style={{ flex: 1, minHeight: 0, gap: 12 }}>
            <Pressable
              onPress={() => router.back()}
              className="flex-row items-center gap-1.5 overflow-hidden rounded-md active:opacity-70"
              style={{ backgroundColor: '#8b8d98', paddingHorizontal: 10, paddingVertical: 6, alignSelf: 'flex-start' }}>
              <ArrowLeft color="#ffffff" size={13} strokeWidth={2} />
              <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 12, letterSpacing: -0.25, color: '#ffffff' }}>
                {s.common.backToList}
              </Text>
            </Pressable>
            <SignPage
              tbmId={tbm.id}
              date={formatDateKR(tbm.scheduledAt)}
              okCount={okCount}
              issueCount={issueCount}
              totalCount={allItems.length}
              onComplete={(exp) => {
                applyLocalTbmSignatureCompletion(tbm.id, exp.svgPathDs, exp.signatureImageUrl);
                if (__DEV__) {
                  console.log('[TBM signature → server payload (URL only)]', serializeSignaturePayloadForApi(exp));
                }
                router.dismissTo('/tbm' as Href);
              }}
            />
          </CenteredColumn>
        </View>
      </View>
    );
  }

  // ── 항목 확인 페이지: ScrollView ──────────────────────────────────────────
  return (
    <View className="flex-1 bg-[#fbfdff]">
      {Header}
      <ScrollView
        {...scrollViewAndroidProps}
        className="flex-1"
        style={{ flex: 1 }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: scrollPadTop,
          paddingBottom: bottomBarH + 8,
          paddingHorizontal: pagePaddingX,
        }}
        contentContainerClassName="gap-4"
        showsVerticalScrollIndicator={false}>
        <CenteredColumn maxWidth={contentColumnMaxWidth} style={{ flex: 1, gap: 12 }}>
        {currentWalkItem?.category === 'notice' ? (
          <View style={{ flex: 1 }}>
            <NoticeCard
              text={(currentWalkItem as Extract<WalkItem, { category: 'notice' }>).text}
              step={step}
              totalItems={allItems.length}
              decision={currentDecision}
              minCardHeight={surveyCardMinHeight}
              onPrev={handleGoPrev}
              onNext={handleGoNext}
              canPrev={step > 0 && !confirmAnimating}
              canNext={!confirmAnimating && !!currentDecision}
            />
          </View>
        ) : currentWalkItem ? (
          <View style={{ flex: 1 }}>
            <SurveyItemCard
              item={(currentWalkItem as Extract<WalkItem, { category: 'caution' | 'ppe' }>).item}
              meta={CATEGORY_META[currentWalkItem.category as 'caution' | 'ppe']}
              indexInCat={(currentWalkItem as Extract<WalkItem, { category: 'caution' | 'ppe' }>).indexInCat}
              catTotal={(currentWalkItem as Extract<WalkItem, { category: 'caution' | 'ppe' }>).catTotal}
              step={step}
              totalItems={allItems.length}
              nextLabel={nextLabel}
              decision={currentDecision}
              minCardHeight={surveyCardMinHeight}
              onPrev={handleGoPrev}
              onNext={handleGoNext}
              canPrev={step > 0 && !confirmAnimating}
              canNext={!confirmAnimating && !!currentDecision}
            />
          </View>
        ) : null}
        </CenteredColumn>
      </ScrollView>

      {/* 하단 확인 버튼 */}
      <View
        className="absolute bottom-0 left-0 right-0"
        style={{
          backgroundColor: '#ffffff',
          paddingHorizontal: pagePaddingX,
          paddingTop: 12,
          paddingBottom: Math.max(insets.bottom, 16) + 4,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.07,
          shadowRadius: 20,
          elevation: 12,
          gap: 8,
          flexDirection: 'row',
        }}>
        {/* 이슈 있음 */}
        <Pressable
          onPress={() => handleConfirm('issue')}
          disabled={confirmAnimating}
          className="h-12 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl active:opacity-90"
          style={{
            opacity: confirmAnimating ? 0.55 : 1,
            backgroundColor: '#f1f5f9',
            borderWidth: 1,
            borderColor: 'rgba(0,0,47,0.08)',
          }}
          accessibilityRole="button">
          <AlertCircle color="#64748b" size={17} strokeWidth={2} />
          <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 16, letterSpacing: -0.35, color: '#475569' }}>
            {s.checklist.confirmIssue}
          </Text>
        </Pressable>
        {/* 확인하였음 */}
        <Pressable
          onPress={() => handleConfirm('ok')}
          disabled={confirmAnimating}
          className="h-12 flex-1 flex-row items-center justify-center gap-1.5 rounded-xl active:opacity-90"
          style={{
            opacity: confirmAnimating ? 0.55 : 1,
            backgroundColor: '#3e63dd',
          }}
          accessibilityRole="button">
          <CheckCircle2 color="#ffffff" size={17} strokeWidth={2} />
          <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 16, letterSpacing: -0.35, color: '#ffffff' }}>
            {s.checklist.confirmAll}
          </Text>
        </Pressable>
      </View>

      <Animated.View pointerEvents="none" style={[ackDimStyle, { zIndex: 100 }]} />
      <Animated.View
        pointerEvents="none"
        style={[
          StyleSheet.absoluteFillObject,
          {
            zIndex: 101,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
          },
        ]}>
        <Animated.View style={ackGroupStyle}>
          <Animated.View
            style={[
              {
                width: 108,
                height: 108,
                borderRadius: 54,
                backgroundColor: ackVariant === 'ok' ? '#ecfdf5' : '#fff7ed',
                alignItems: 'center',
                justifyContent: 'center',
                borderWidth: Platform.OS === 'android' ? 1.5 : 1,
                borderColor: ackVariant === 'ok' ? 'rgba(21,128,61,0.22)' : 'rgba(234,88,12,0.22)',
                ...(Platform.OS === 'android'
                  ? { elevation: 8 }
                  : {
                      shadowColor: ackVariant === 'ok' ? '#15803d' : '#ea580c',
                      shadowOffset: { width: 0, height: 14 },
                      shadowOpacity: 0.28,
                      shadowRadius: 28,
                    }),
              },
              ackBubbleStyle,
            ]}>
            {ackVariant === 'ok' ? (
              <CheckCircle2 size={62} color="#15803d" strokeWidth={2.5} />
            ) : (
              <AlertCircle size={62} color="#ea580c" strokeWidth={2.5} />
            )}
          </Animated.View>
          <Text
            style={{
              marginTop: 16,
              fontFamily: 'Pretendard-SemiBold',
              fontSize: 17,
              letterSpacing: -0.4,
              color: '#ffffff',
              textShadowColor: 'rgba(0,0,0,0.35)',
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 6,
            }}>
            {ackVariant === 'ok' ? s.checklist.confirmFlashTitle : s.checklist.issueFlashTitle}
          </Text>
        </Animated.View>
      </Animated.View>
    </View>
  );
}
