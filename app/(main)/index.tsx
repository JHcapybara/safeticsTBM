import { Href, Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, CloudSun, Droplets, Menu, MessageSquare, RefreshCw, Wind } from 'lucide-react-native';
import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { scrollViewAndroidProps } from '@/constants/scrollViewAndroid';
import { SITE_LOCATION_CITY } from '@/constants/site';
import { getSuggestionStats, MOCK_SUGGESTIONS } from '@/constants/suggestions';
import {
  formatTbmDateLabelDot,
  getTbmPendingCheckCount,
  isTbmScheduledToday,
  MOCK_TBMS,
} from '@/constants/tbm';
import { useDrawer } from '@/contexts/DrawerContext';
import { useLang } from '@/contexts/LangContext';
import { useCurrentWeather } from '@/hooks/useCurrentWeather';
import {
  EmergencyActionCard,
  EMERGENCY_CAROUSEL_CARD_MIN_HEIGHT,
  EMERGENCY_CAROUSEL_CARD_WIDTH,
} from '@/components/EmergencyActionCard';
import { TbmTodayCard } from '@/components/TbmTodayCard';
import { emergencyCarouselCardMinHeight, useResponsiveLayout } from '@/hooks/useResponsiveLayout';

/** MAI-01 — Figma node 90:811 */
export default function HomeScreen() {
  const { openDrawer } = useDrawer();
  const { s } = useLang();
  const { weather, weatherLoading, refreshWeather } = useCurrentWeather();
  const suggestionStats = useMemo(() => getSuggestionStats(MOCK_SUGGESTIONS), []);
  const suggestionPreview = useMemo(() => MOCK_SUGGESTIONS.slice(0, 2), []);
  const insets = useSafeAreaInsets();
  const headerPadBottom = 8;
  const headerBlockH = 62 + headerPadBottom;
  const scrollPadTop = insets.top + headerBlockH + 24;
  const todayTbm = useMemo(() => MOCK_TBMS.find((t) => isTbmScheduledToday(t.scheduledAt)), []);
  const todayTbmDateLabel = todayTbm ? formatTbmDateLabelDot(todayTbm.scheduledAt) : '—';
  const todayTbmPending = todayTbm ? getTbmPendingCheckCount(todayTbm) : 0;
  const { width: windowWidth } = useWindowDimensions();
  const {
    pagePaddingX,
    cardColumnMaxWidth,
    emergencyCardWidth,
    emergencyCarouselGap,
    headerTitleFontSize,
  } = useResponsiveLayout();
  /** 긴급 캐러셀 — 고정 카드 폭 N, 슬롯 사이 margin G */
  const emergencyNarrowW = emergencyCardWidth;
  const emergencyCarouselStride = emergencyNarrowW + emergencyCarouselGap;
  const emergencyCarouselSidePad = Math.max(0, (windowWidth - emergencyNarrowW) / 2);
  const emergencyCarouselMinH = emergencyCarouselCardMinHeight(emergencyNarrowW, EMERGENCY_CAROUSEL_CARD_WIDTH);
  const emergencyCarouselRef = useRef<ScrollView>(null);
  const [emergencyFocusedIndex, setEmergencyFocusedIndex] = useState(1);

  useLayoutEffect(() => {
    const stride = emergencyCarouselStride;
    const id = requestAnimationFrame(() => {
      emergencyCarouselRef.current?.scrollTo({ x: stride * emergencyFocusedIndex, y: 0, animated: false });
    });
    return () => cancelAnimationFrame(id);
  }, [emergencyCarouselStride, emergencyFocusedIndex, emergencyNarrowW]);

  const onEmergencyCarouselScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      const x = e.nativeEvent.contentOffset.x;
      const idx = Math.round(x / emergencyCarouselStride);
      setEmergencyFocusedIndex(Math.max(0, Math.min(2, idx)));
    },
    [emergencyCarouselStride],
  );

  return (
    <View className="flex-1 bg-[#fbfdff]">
      <View
        className="absolute left-0 right-0 top-0 z-10"
        style={{
          paddingHorizontal: pagePaddingX,
          paddingTop: insets.top + 14,
          paddingBottom: headerPadBottom,
          backgroundColor: 'rgba(0, 46, 201, 0.88)',
        }}>
        <View className="flex-row items-start gap-2">
          <Text
            className="flex-1 font-bold text-white"
            style={{
              fontFamily: 'Pretendard-Bold',
              fontSize: headerTitleFontSize,
              lineHeight: headerTitleFontSize + 12,
              letterSpacing: -0.5,
            }}>
            {s.home.headerTitle}
          </Text>
          <Pressable
            onPress={openDrawer}
            className="h-10 w-10 items-center justify-center rounded-md bg-[#3e63dd] active:opacity-80"
            accessibilityLabel="메뉴 열기">
            <Menu color="#ffffff" size={18} strokeWidth={2} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        {...scrollViewAndroidProps}
        className="flex-1"
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: scrollPadTop,
          paddingBottom: Math.max(insets.bottom, 8) + 16,
        }}
        contentContainerClassName="gap-4"
        showsVerticalScrollIndicator={false}>
        {/* 현장 날씨 — 브랜드 톤에 맞춘 카드 UI */}
        <View style={{ paddingHorizontal: pagePaddingX }}>
          <View
            className="max-w-[480px] self-center rounded-[20px] border border-[rgba(0,0,47,0.08)] bg-white"
            style={{
              width: '100%',
              maxWidth: cardColumnMaxWidth,
              shadowColor: '#002ec9',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.08,
              shadowRadius: 24,
              elevation: 6,
            }}>
            <View className="overflow-hidden rounded-[20px]">
              <LinearGradient
                colors={['#f4f7ff', '#ffffff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 }}>
                <View className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-[#3e63dd]/12" />
                <View className="pointer-events-none absolute -bottom-4 -left-8 h-24 w-24 rounded-full bg-[#60a5fa]/10" />

                <View className="flex-row items-start justify-between">
                  <View className="min-w-0 flex-1 flex-row items-center gap-2.5 pr-2">
                    <View
                      className="rounded-xl bg-[#3e63dd] p-2"
                      style={{
                        shadowColor: '#3e63dd',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                        elevation: 3,
                      }}>
                      <CloudSun color="#ffffff" size={20} strokeWidth={2} />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text
                        className="font-semibold text-[#3e63dd]"
                        style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 10, lineHeight: 12, letterSpacing: 0.7 }}>
                        {s.weather.badge}
                      </Text>
                      <Text
                        className="font-bold text-[#1c2024]"
                        style={{ fontFamily: 'Pretendard-Bold', fontSize: 16, lineHeight: 19, letterSpacing: -0.35, marginTop: 2 }}>
                        {s.weather.title}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Pretendard-Regular',
                          fontSize: 12,
                          lineHeight: 16,
                          color: '#64748b',
                          marginTop: 4,
                          letterSpacing: -0.15,
                        }}
                        numberOfLines={2}>
                        {weather?.locationLabel ?? SITE_LOCATION_CITY}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <Pressable
                      onPress={() => void refreshWeather()}
                      disabled={weatherLoading}
                      accessibilityRole="button"
                      accessibilityLabel={s.weather.refreshA11y}
                      hitSlop={8}
                      className="mb-1 rounded-lg border border-[rgba(0,0,47,0.08)] bg-white/90 p-2 active:opacity-70"
                      style={{ opacity: weatherLoading ? 0.5 : 1 }}>
                      <RefreshCw color="#3e63dd" size={18} strokeWidth={2} />
                    </Pressable>
                    <View className="flex-row items-end">
                      <Text
                        className="font-bold text-[#0f172a]"
                        style={{ fontFamily: 'Pretendard-Bold', fontSize: 44, lineHeight: 48, letterSpacing: -1.5 }}>
                        {weather ? Math.round(weather.tempC) : '--'}
                      </Text>
                      <Text
                        className="mb-1 ml-0.5 font-bold text-[#64748b]"
                        style={{ fontFamily: 'Pretendard-Bold', fontSize: 18, lineHeight: 22, letterSpacing: -0.4 }}>
                        °C
                      </Text>
                    </View>
                    <Text
                      className="text-right text-xs text-[#64748b]"
                      style={{ fontFamily: 'Pretendard-Regular', letterSpacing: -0.15, marginTop: 2 }}>
                      {weather
                        ? `${s.weather.feelsLike} ${Math.round(weather.apparentC)}° · ${weather.conditionLabel}`
                        : weatherLoading
                          ? s.weather.loading
                          : s.weather.unavailable}
                    </Text>
                  </View>
                </View>

                <View className="mt-3 flex-row gap-2">
                  <View
                    className="flex-1 flex-row items-center gap-2 rounded-xl border border-[rgba(0,0,47,0.06)] bg-white px-2.5 py-2"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.04,
                      shadowRadius: 6,
                      elevation: 1,
                    }}>
                    <View className="rounded-lg bg-slate-100 p-1.5">
                      <Wind color="#3e63dd" size={16} strokeWidth={2} />
                    </View>
                    <View>
                      <Text
                        className="text-[10px] text-[#64748b]"
                        style={{ fontFamily: 'Pretendard-Regular', lineHeight: 12 }}>
                        {s.weather.windSpeed}
                      </Text>
                      <Text
                        className="font-semibold text-[#1c2024]"
                        style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, lineHeight: 17 }}>
                        {weather ? `${Math.round(weather.windKmh)} km/h` : '--'}
                      </Text>
                    </View>
                  </View>
                  <View
                    className="flex-1 flex-row items-center gap-2 rounded-xl border border-[rgba(0,0,47,0.06)] bg-white px-2.5 py-2"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.04,
                      shadowRadius: 6,
                      elevation: 1,
                    }}>
                    <View className="rounded-lg bg-slate-100 p-1.5">
                      <Droplets color="#3e63dd" size={16} strokeWidth={2} />
                    </View>
                    <View>
                      <Text
                        className="text-[10px] text-[#64748b]"
                        style={{ fontFamily: 'Pretendard-Regular', lineHeight: 12 }}>
                        {s.weather.humidity}
                      </Text>
                      <Text
                        className="font-semibold text-[#1c2024]"
                        style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, lineHeight: 17 }}>
                        {weather ? `${Math.round(weather.humidity)}%` : '--'}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>

              <View className="border-t border-[rgba(0,0,47,0.06)] bg-[#fafbff] px-4 py-2.5">
                <Text
                  className="text-xs leading-[18px] text-[#475569]"
                  style={{ fontFamily: 'Pretendard-Regular', letterSpacing: -0.15 }}>
                  {weather
                    ? `${weather.conditionLabel}. ${s.weather.min} ${Math.round(weather.minC)}°C · ${s.weather.max} ${Math.round(weather.maxC)}°C`
                    : s.weather.loading}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 오늘의 TBM — TbmTodayCard */}
        <View style={{ paddingHorizontal: pagePaddingX }}>
          <TbmTodayCard
            pendingCount={todayTbm != null ? todayTbmPending : 8}
            dateLabel={todayTbm != null ? todayTbmDateLabel : '—'}
            maxWidth={cardColumnMaxWidth}
          />
        </View>

        <View style={{ overflow: 'visible' }}>
          <ScrollView
            {...scrollViewAndroidProps}
            ref={emergencyCarouselRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            className="max-w-full"
            style={{
              minHeight: Math.max(EMERGENCY_CAROUSEL_CARD_MIN_HEIGHT, emergencyCarouselMinH),
              overflow: 'visible',
            }}
            decelerationRate="fast"
            snapToInterval={emergencyCarouselStride}
            snapToAlignment="start"
            onMomentumScrollEnd={onEmergencyCarouselScrollEnd}
            contentContainerStyle={{
              paddingLeft: emergencyCarouselSidePad,
              paddingRight: emergencyCarouselSidePad,
              paddingVertical: 0,
            }}>
            <View
              style={{
                width: emergencyNarrowW,
                marginRight: emergencyCarouselGap,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'visible',
              }}
              pointerEvents="box-none">
              <EmergencyActionCard
                variant="hazard"
                cardWidth={emergencyNarrowW}
                onPress={() => router.push('/suggestions/new?from=hazard' as Href)}
              />
            </View>
            <View
              style={{
                width: emergencyNarrowW,
                marginRight: emergencyCarouselGap,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'visible',
              }}
              pointerEvents="box-none">
              <EmergencyActionCard
                variant="sos"
                cardWidth={emergencyNarrowW}
                onPress={() => {
                  Alert.alert(
                    s.emergency.sos.confirmTitle,
                    s.emergency.sos.confirmMessage,
                    [
                      { text: s.emergency.sos.confirmNo, style: 'cancel' },
                      {
                        text: s.emergency.sos.confirmYes,
                        style: 'destructive',
                        onPress: () => router.push('/emergency/sos' as Href),
                      },
                    ],
                  );
                }}
              />
            </View>
            <View
              style={{
                width: emergencyNarrowW,
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'visible',
              }}
              pointerEvents="box-none">
              <EmergencyActionCard
                variant="stop"
                cardWidth={emergencyNarrowW}
                onPress={() => router.push('/emergency/stop' as Href)}
              />
            </View>
          </ScrollView>
        </View>

        {/* 건의사항 — 날씨 섹션과 동일 카드 골격 (보더·섀도우·그라데이션·하단 영역) */}
        <View style={{ paddingHorizontal: pagePaddingX }}>
          <View
            className="max-w-[480px] self-center rounded-[20px] border border-[rgba(0,0,47,0.08)] bg-white"
            style={{
              width: '100%',
              maxWidth: cardColumnMaxWidth,
              shadowColor: '#002ec9',
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.08,
              shadowRadius: 24,
              elevation: 6,
            }}>
            <View className="overflow-hidden rounded-[20px]">
              <LinearGradient
                colors={['#f4f7ff', '#ffffff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingHorizontal: 16, paddingTop: 14, paddingBottom: 12 }}>
                <View className="pointer-events-none absolute -right-6 -top-8 h-28 w-28 rounded-full bg-[#3e63dd]/12" />
                <View className="pointer-events-none absolute -bottom-4 -left-8 h-24 w-24 rounded-full bg-[#60a5fa]/10" />

                <View className="flex-row items-start justify-between">
                  <View className="min-w-0 flex-1 flex-row items-center gap-2.5 pr-2">
                    <View
                      className="rounded-xl bg-[#3e63dd] p-2"
                      style={{
                        shadowColor: '#3e63dd',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.3,
                        shadowRadius: 6,
                        elevation: 3,
                      }}>
                      <MessageSquare color="#ffffff" size={20} strokeWidth={2} />
                    </View>
                    <View className="min-w-0 flex-1">
                      <Text
                        className="font-semibold text-[#3e63dd]"
                        style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 10, lineHeight: 12, letterSpacing: 0.7 }}>
                        {s.suggestions.badge}
                      </Text>
                      <Text
                        className="font-bold text-[#1c2024]"
                        style={{ fontFamily: 'Pretendard-Bold', fontSize: 16, lineHeight: 19, letterSpacing: -0.35, marginTop: 2 }}>
                        {s.suggestions.title}
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Pretendard-Regular',
                          fontSize: 12,
                          lineHeight: 16,
                          color: '#64748b',
                          marginTop: 4,
                          letterSpacing: -0.15,
                        }}>
                        총 {suggestionStats.total}건 · 조치 현황 요약
                      </Text>
                    </View>
                  </View>
                  <Link href={'/suggestions' as Href} asChild>
                    <Pressable hitSlop={8} className="flex-row items-center gap-0.5 active:opacity-70">
                      <Text
                        style={{
                          fontFamily: 'Pretendard-SemiBold',
                          fontSize: 13,
                          color: '#3e63dd',
                          letterSpacing: -0.2,
                        }}>
                        {s.common.seeMore}
                      </Text>
                      <ChevronRight color="#3e63dd" size={18} strokeWidth={2} />
                    </Pressable>
                  </Link>
                </View>

                <View className="mt-3 flex-row gap-2">
                  <View
                    className="min-w-0 flex-1 flex-row items-center gap-2 rounded-xl border border-[rgba(0,0,47,0.06)] bg-white px-2 py-2"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.04,
                      shadowRadius: 6,
                      elevation: 1,
                    }}>
                    <View className="min-w-0 flex-1">
                      <Text
                        className="text-[10px] leading-tight text-[#64748b]"
                        style={{ fontFamily: 'Pretendard-Regular', lineHeight: 12 }}>
                        {s.status.actionCompleted}
                      </Text>
                      <Text
                        className="font-semibold text-[#15803d]"
                        style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, lineHeight: 17, marginTop: 2 }}>
                        {suggestionStats.completed}
                      </Text>
                    </View>
                  </View>
                  <View
                    className="min-w-0 flex-1 flex-row items-center gap-2 rounded-xl border border-[rgba(0,0,47,0.06)] bg-white px-2 py-2"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.04,
                      shadowRadius: 6,
                      elevation: 1,
                    }}>
                    <View className="min-w-0 flex-1">
                      <Text
                        className="text-[10px] leading-tight text-[#64748b]"
                        style={{ fontFamily: 'Pretendard-Regular', lineHeight: 12 }}>
                        {s.status.actionInProgress}
                      </Text>
                      <Text
                        className="font-semibold text-[#d97706]"
                        style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, lineHeight: 17, marginTop: 2 }}>
                        {suggestionStats.inProgress}
                      </Text>
                    </View>
                  </View>
                  <View
                    className="min-w-0 flex-1 flex-row items-center gap-2 rounded-xl border border-[rgba(0,0,47,0.06)] bg-white px-2 py-2"
                    style={{
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.04,
                      shadowRadius: 6,
                      elevation: 1,
                    }}>
                    <View className="min-w-0 flex-1">
                      <Text
                        className="text-[10px] leading-tight text-[#64748b]"
                        style={{ fontFamily: 'Pretendard-Regular', lineHeight: 12 }}>
                        {s.status.pending}
                      </Text>
                      <Text
                        className="font-semibold text-[#dc2626]"
                        style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, lineHeight: 17, marginTop: 2 }}>
                        {suggestionStats.pending}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>

              <View className="border-t border-[rgba(0,0,47,0.06)] bg-[#fafbff] px-4 py-2.5">
                <Text
                  className="text-xs font-medium text-[#475569]"
                  style={{ fontFamily: 'Pretendard-Medium', letterSpacing: 0.2, marginBottom: 10 }}>
                  {s.suggestions.recent}
                </Text>
                {suggestionPreview.map((item, idx) => {
                  const dotColor =
                    item.status === 'completed' ? '#22c55e' : item.status === 'in_progress' ? '#f59e0b' : '#ef4444';
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => router.push('/suggestions' as Href)}
                      className={`flex-row items-center gap-3 py-2.5 active:opacity-80 ${idx > 0 ? 'border-t border-slate-100/90' : ''}`}>
                      <View className="h-2 w-2 rounded-full" style={{ backgroundColor: dotColor }} />
                      <View className="min-w-0 flex-1">
                        <Text
                          style={{
                            fontFamily: 'Pretendard-SemiBold',
                            fontSize: 14,
                            color: '#1e293b',
                            letterSpacing: -0.2,
                          }}
                          numberOfLines={1}>
                          {item.title}
                        </Text>
                        <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                          {item.timeLabel} · {item.author}
                        </Text>
                      </View>
                      <ChevronRight color="#cbd5e1" size={18} strokeWidth={2} />
                    </Pressable>
                  );
                })}
              </View>

              <Pressable
                onPress={() => router.push('/suggestions' as Href)}
                className="border-t border-slate-100 bg-slate-50/80 px-4 py-3 active:opacity-90">
                <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, color: '#3e63dd', textAlign: 'center' }}>
                  {s.suggestions.viewAll}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
