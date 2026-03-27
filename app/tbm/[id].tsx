import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Bell,
  CheckCircle2,
  Circle,
  ClipboardList,
  ListChecks,
  PenLine,
  ShieldAlert,
  User,
} from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CenteredColumn } from '@/components/CenteredColumn';
import { scrollViewAndroidProps } from '@/constants/scrollViewAndroid';
import {
  formatTbmDateTime,
  getHistorySignaturePaths,
  getTbmById,
} from '@/constants/tbm';
import { useLang } from '@/contexts/LangContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

/** 과거/완료 TBM 기록 상세 — 오늘의 TBM(세션) 플로우와 구분, 요약·서명 열람용 */

type BadgeVariant = 'green' | 'blue' | 'red' | 'yellow';

const BADGE_STYLES: Record<BadgeVariant, { bg: string; text: string }> = {
  green: { bg: 'rgba(0,164,51,0.10)', text: 'rgba(0,113,63,0.87)' },
  blue: { bg: 'rgba(62,99,221,0.1)', text: '#1d4ed8' },
  red: { bg: 'rgba(229,72,77,0.1)', text: '#b91c1c' },
  yellow: { bg: 'rgba(255,222,0,0.24)', text: '#ab6400' },
};

function StatusBadge({ label, variant }: { label: string; variant: BadgeVariant }) {
  const s = BADGE_STYLES[variant];
  return (
    <View
      className="items-center justify-center rounded overflow-hidden"
      style={{ backgroundColor: s.bg, paddingHorizontal: 8, paddingVertical: 3 }}>
      <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 12, letterSpacing: -0.3, color: s.text, lineHeight: 18 }}>
        {label}
      </Text>
    </View>
  );
}

function statusToBadge(
  status: 'scheduled' | 'completed' | 'incomplete',
  s: { status: { completed: string; incomplete: string; scheduled: string } },
): { label: string; variant: BadgeVariant } {
  if (status === 'completed') return { label: s.status.completed, variant: 'green' };
  if (status === 'incomplete') return { label: s.status.incomplete, variant: 'red' };
  return { label: s.status.scheduled, variant: 'yellow' };
}

export default function TbmDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width, pagePaddingX, contentColumnMaxWidth, headerTitleFontSize, isTablet } = useResponsiveLayout();
  const { s } = useLang();
  const tbm = id ? getTbmById(String(id)) : undefined;
  const columnInner = contentColumnMaxWidth ?? width - pagePaddingX * 2;
  const signatureW = Math.min(columnInner - 32, isTablet ? 560 : 360);

  const headerBlockH = 40 + 8;
  const scrollPadTop = insets.top + headerBlockH + 24;

  if (!tbm) {
    return (
      <View className="flex-1 items-center justify-center bg-[#fbfdff] px-6">
        <Text style={{ fontFamily: 'Pretendard-Regular', color: '#64748b' }}>{s.tbm.notFound}</Text>
        <Pressable onPress={() => router.back()} className="mt-4 rounded-xl bg-[#3e63dd] px-6 py-3">
          <Text style={{ fontFamily: 'Pretendard-SemiBold', color: '#ffffff' }}>{s.common.goBack}</Text>
        </Pressable>
      </View>
    );
  }

  const badge = statusToBadge(tbm.status, s);
  const signaturePaths = getHistorySignaturePaths(tbm);

  return (
    <View className="flex-1 bg-[#fbfdff]">
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
              {s.tbm.recordDetailTitle}
            </Text>
          </View>
          <View className="h-10 w-10" />
        </View>
      </View>

      <ScrollView
        {...scrollViewAndroidProps}
        className="flex-1"
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: scrollPadTop,
          paddingBottom: Math.max(insets.bottom, 8) + 24,
          paddingHorizontal: pagePaddingX,
        }}
        contentContainerClassName="gap-2.5"
        showsVerticalScrollIndicator={false}>
        <CenteredColumn maxWidth={contentColumnMaxWidth}>

        {/* 기본 정보 */}
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
            <View className="flex-row items-center justify-between">
              <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 13, lineHeight: 16, letterSpacing: -0.3, color: 'rgba(0,7,20,0.45)' }}>
                {s.tbm.basicInfo}
              </Text>
              <StatusBadge label={badge.label} variant={badge.variant} />
            </View>
            <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.08)' }} />
            <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 18, lineHeight: 24, letterSpacing: -0.4, color: '#1c2024' }}>
              {tbm.title}
            </Text>
            <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, lineHeight: 16, letterSpacing: -0.25, color: 'rgba(0,7,20,0.55)' }}>
              {formatTbmDateTime(tbm.scheduledAt)}
            </Text>
            <View className="flex-row items-center gap-2">
              <User color="#64748b" size={16} strokeWidth={2} />
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, lineHeight: 16, color: 'rgba(0,7,20,0.65)' }}>
                {s.tbm.workManager} {tbm.supervisor} · 참석 {tbm.attendeeCount}명
              </Text>
            </View>
            <View
              className="rounded-xl px-3 py-2.5"
              style={{ backgroundColor: 'rgba(0,0,51,0.04)', borderWidth: 1, borderColor: 'rgba(0,0,47,0.06)' }}>
              <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 11, lineHeight: 13, color: 'rgba(0,7,20,0.45)' }}>
                {s.tbm.recordSiteLabel}
              </Text>
              <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, lineHeight: 18, color: '#1c2024', marginTop: 4 }}>
                {tbm.siteName}
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* 작업 내용 */}
        <SectionCard title={s.tbm.workContent} icon={ClipboardList} iconColor="#3e63dd" iconBg="rgba(62,99,221,0.1)">
          <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 15, lineHeight: 24, letterSpacing: -0.35, color: 'rgba(0,7,20,0.75)' }}>
            {tbm.workSummary}
          </Text>
        </SectionCard>

        {/* 위험 요인 */}
        <SectionCard title={s.tbm.riskFactors} icon={ShieldAlert} iconColor="#d97706" iconBg="rgba(217,119,6,0.1)">
          {tbm.riskFactors.map((line, idx) => (
            <View key={idx} className="mb-2 flex-row gap-2 last:mb-0">
              <Text style={{ fontFamily: 'Pretendard-Bold', color: '#d97706', lineHeight: 22 }}>•</Text>
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 14, lineHeight: 22, letterSpacing: -0.3, color: 'rgba(0,7,20,0.75)', flex: 1 }}>
                {line}
              </Text>
            </View>
          ))}
        </SectionCard>

        {/* 안전 대책 */}
        <SectionCard title={s.tbm.safetyMeasures} icon={ListChecks} iconColor="#0d9488" iconBg="rgba(13,148,136,0.1)">
          {tbm.safetyMeasures.map((line, idx) => (
            <View key={idx} className="mb-2 flex-row gap-2 last:mb-0">
              <Text style={{ fontFamily: 'Pretendard-Bold', color: '#0d9488', lineHeight: 22 }}>✓</Text>
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 14, lineHeight: 22, letterSpacing: -0.3, color: 'rgba(0,7,20,0.75)', flex: 1 }}>
                {line}
              </Text>
            </View>
          ))}
        </SectionCard>

        {/* 특별 공지 */}
        <View
          className="w-full overflow-hidden rounded-2xl border"
          style={{
            borderColor: 'rgba(62,99,221,0.18)',
            backgroundColor: '#ffffff',
            padding: 14,
            gap: 10,
          }}>
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(62,99,221,0.1)' }}>
              <Bell color="#3e63dd" size={18} strokeWidth={2} />
            </View>
            <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 14, letterSpacing: -0.35, color: '#1c2024' }}>
              {s.tbm.specialNoticeShort}
            </Text>
          </View>
          <View style={{ height: 1, backgroundColor: 'rgba(62,99,221,0.1)' }} />
          <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 14, lineHeight: 23, letterSpacing: -0.3, color: 'rgba(0,7,20,0.75)' }}>
            {tbm.specialNotice}
          </Text>
        </View>

        {/* 체크리스트 요약 */}
        <View
          className="w-full overflow-hidden rounded-2xl border"
          style={{
            borderColor: 'rgba(0,0,47,0.08)',
            backgroundColor: '#ffffff',
            padding: 14,
            gap: 10,
          }}>
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(0,0,51,0.06)' }}>
              <ClipboardList color="#3e63dd" size={18} strokeWidth={2} />
            </View>
            <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 14, letterSpacing: -0.35, color: '#1c2024' }}>
              {s.tbm.checklist}
            </Text>
          </View>
          <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.07)' }} />
          {tbm.checklist.map((c) => (
            <View key={c.id} className="flex-row items-center gap-3 py-2">
              {c.done ? (
                <CheckCircle2 color="#22c55e" size={20} strokeWidth={2} />
              ) : (
                <Circle color="#cbd5e1" size={20} strokeWidth={2} />
              )}
              <Text
                style={{
                  fontFamily: 'Pretendard-Regular',
                  fontSize: 14,
                  lineHeight: 18,
                  color: c.done ? 'rgba(0,7,20,0.45)' : '#1c2024',
                  textDecorationLine: c.done ? 'line-through' : 'none',
                  flex: 1,
                }}>
                {c.label}
              </Text>
            </View>
          ))}
        </View>

        {/* 참석 서명 */}
        <View
          className="w-full overflow-hidden rounded-2xl border"
          style={{
            borderColor: 'rgba(0,0,47,0.1)',
            backgroundColor: '#ffffff',
            padding: 14,
            gap: 10,
          }}>
          <View className="flex-row items-center gap-2">
            <View className="h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: 'rgba(62,99,221,0.1)' }}>
              <PenLine color="#3e63dd" size={18} strokeWidth={2} />
            </View>
            <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 14, letterSpacing: -0.35, color: '#1c2024' }}>
              {s.tbm.signatureSection}
            </Text>
          </View>
          <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.08)' }} />

          {signaturePaths ? (
            <View>
              <View
                className="w-full overflow-hidden rounded-xl border"
                style={{
                  borderColor: 'rgba(62,99,221,0.25)',
                  borderStyle: 'dashed',
                  backgroundColor: 'rgba(62,99,221,0.03)',
                  minHeight: 120,
                }}>
                <Svg width={signatureW} height={120} viewBox="0 0 160 80">
                  {signaturePaths.map((d, i) => (
                    <Path
                      key={i}
                      d={d}
                      stroke="#1c2024"
                      strokeWidth={2.2}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                </Svg>
              </View>
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 11, lineHeight: 14, color: 'rgba(0,7,20,0.4)', marginTop: 8, textAlign: 'center' }}>
                {tbm.supervisor} · {s.tbm.signatureRecorded}
              </Text>
            </View>
          ) : (
            <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 14, lineHeight: 20, color: '#94a3b8', textAlign: 'center', paddingVertical: 8 }}>
              {s.tbm.signatureMissing}
            </Text>
          )}
        </View>
        </CenteredColumn>
      </ScrollView>
    </View>
  );
}

function SectionCard({
  title,
  icon: Icon,
  iconColor,
  iconBg,
  children,
}: {
  title: string;
  icon: typeof ClipboardList;
  iconColor: string;
  iconBg: string;
  children: ReactNode;
}) {
  return (
    <View
      className="w-full overflow-hidden rounded-2xl border"
      style={{
        borderColor: 'rgba(0,0,47,0.08)',
        backgroundColor: '#ffffff',
        padding: 14,
        gap: 10,
        shadowColor: '#002ec9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 12,
        elevation: 2,
      }}>
      <View className="flex-row items-center gap-2">
        <View className="h-9 w-9 items-center justify-center rounded-lg" style={{ backgroundColor: iconBg }}>
          <Icon color={iconColor} size={18} strokeWidth={2} />
        </View>
        <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 14, letterSpacing: -0.35, color: '#1c2024' }}>{title}</Text>
      </View>
      <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.07)' }} />
      {children}
    </View>
  );
}
