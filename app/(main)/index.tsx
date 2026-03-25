import { Href, Link, router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight, CloudSun, Droplets, Menu, MessageSquare, Wind } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import { Pressable, ScrollView, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SITE_LOCATION_CITY } from '@/constants/site';
import { getSuggestionStats, MOCK_SUGGESTIONS } from '@/constants/suggestions';
import { useDrawer } from '@/contexts/DrawerContext';
import {
  EmergencyActionCard,
  EMERGENCY_CAROUSEL_CARD_WIDTH,
  EMERGENCY_CAROUSEL_GAP,
} from '@/components/EmergencyActionCard';
import { TbmTodayCard } from '@/components/TbmTodayCard';

/** MAI-01 — Figma node 90:811 */
export default function HomeScreen() {
  const { openDrawer } = useDrawer();
  const suggestionStats = useMemo(() => getSuggestionStats(MOCK_SUGGESTIONS), []);
  const suggestionPreview = useMemo(() => MOCK_SUGGESTIONS.slice(0, 2), []);
  const insets = useSafeAreaInsets();
  const headerPadBottom = 8;
  const headerBlockH = 62 + headerPadBottom;
  const scrollPadTop = insets.top + headerBlockH + 24;
  const { width: windowWidth } = useWindowDimensions();
  const carouselSidePad = Math.max(0, (windowWidth - EMERGENCY_CAROUSEL_CARD_WIDTH) / 2);
  const carouselStep = EMERGENCY_CAROUSEL_CARD_WIDTH + EMERGENCY_CAROUSEL_GAP;
  const emergencyCarouselRef = useRef<ScrollView>(null);
  const centerEmergencySos = useCallback(() => {
    emergencyCarouselRef.current?.scrollTo({ x: carouselStep, y: 0, animated: false });
  }, [carouselStep]);

  useEffect(() => {
    const id = requestAnimationFrame(() => centerEmergencySos());
    return () => cancelAnimationFrame(id);
  }, [centerEmergencySos, windowWidth]);

  return (
    <View className="flex-1 bg-[#fbfdff]">
      <View
        className="absolute left-0 right-0 top-0 z-10 px-4"
        style={{
          paddingTop: insets.top + 14,
          paddingBottom: headerPadBottom,
          backgroundColor: 'rgba(0, 46, 201, 0.88)',
        }}>
        <View className="flex-row items-start gap-2">
          <Text
            className="flex-1 font-bold text-white"
            style={{ fontSize: 20, lineHeight: 32, letterSpacing: -0.5 }}>
            세이프틱스 강남 사업장
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
        className="flex-1"
        style={{ paddingTop: scrollPadTop }}
        contentContainerStyle={{ paddingBottom: 16, gap: 16 }}
        showsVerticalScrollIndicator={false}>
        {/* 현장 날씨 — 브랜드 톤에 맞춘 카드 UI */}
        <View className="px-4">
          <View
            className="max-w-[480px] self-center rounded-[20px] border border-[rgba(0,0,47,0.08)] bg-white"
            style={{
              width: '100%',
              maxWidth: 343,
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
                        style={{ fontSize: 10, letterSpacing: 0.7 }}>
                        WEATHER
                      </Text>
                      <Text className="font-bold text-[#1c2024]" style={{ fontSize: 16, letterSpacing: -0.35, marginTop: 2 }}>
                        현장 날씨
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
                        {SITE_LOCATION_CITY}
                      </Text>
                    </View>
                  </View>
                  <View className="items-end">
                    <View className="flex-row items-end">
                      <Text
                        className="font-bold text-[#0f172a]"
                        style={{ fontSize: 44, lineHeight: 48, letterSpacing: -1.5 }}>
                        32
                      </Text>
                      <Text
                        className="mb-1 ml-0.5 font-bold text-[#64748b]"
                        style={{ fontSize: 18, letterSpacing: -0.4 }}>
                        °C
                      </Text>
                    </View>
                    <Text className="text-right text-xs text-[#64748b]" style={{ letterSpacing: -0.15, marginTop: 2 }}>
                      체감 34° · 미세 보통
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
                      <Text className="text-[10px] text-[#64748b]">풍속</Text>
                      <Text className="font-semibold text-[#1c2024]" style={{ fontSize: 14 }}>
                        15 km/h
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
                      <Text className="text-[10px] text-[#64748b]">습도</Text>
                      <Text className="font-semibold text-[#1c2024]" style={{ fontSize: 14 }}>
                        00%
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>

              <View className="border-t border-[rgba(0,0,47,0.06)] bg-[#fafbff] px-4 py-2.5">
                <Text className="text-xs leading-[18px] text-[#475569]" style={{ letterSpacing: -0.15 }}>
                  부분적으로 흐린 날씨가 예상됩니다. 최저{' '}
                  <Text className="font-semibold text-[#1c2024]">21°C</Text> · 최고{' '}
                  <Text className="font-semibold text-[#1c2024]">33°C</Text>
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* 오늘의 TBM — TbmTodayCard */}
        <View className="px-4">
          <TbmTodayCard pendingCount={8} dateLabel="2026.03.25" />
        </View>

        {/* 긴급 조치 캐러셀: 위험원 보고 | 긴급 SOS(초기 중앙) | 작업 중지 */}
        <View style={{ overflow: 'visible' }}>
          <ScrollView
            ref={emergencyCarouselRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            className="max-w-full"
            decelerationRate="fast"
            snapToInterval={carouselStep}
            snapToAlignment="start"
            contentContainerStyle={{
              gap: EMERGENCY_CAROUSEL_GAP,
              paddingLeft: carouselSidePad,
              paddingRight: carouselSidePad,
              paddingVertical: 0,
            }}>
            <EmergencyActionCard variant="hazard" onPress={() => {}} />
            <EmergencyActionCard variant="sos" onPress={() => {}} />
            <EmergencyActionCard variant="stop" onPress={() => {}} />
          </ScrollView>
        </View>

        {/* 건의사항 — 날씨 섹션과 동일 카드 골격 (보더·섀도우·그라데이션·하단 영역) */}
        <View className="px-4">
          <View
            className="max-w-[480px] self-center rounded-[20px] border border-[rgba(0,0,47,0.08)] bg-white"
            style={{
              width: '100%',
              maxWidth: 343,
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
                        style={{ fontSize: 10, letterSpacing: 0.7 }}>
                        SUGGESTIONS
                      </Text>
                      <Text className="font-bold text-[#1c2024]" style={{ fontSize: 16, letterSpacing: -0.35, marginTop: 2 }}>
                        건의사항
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
                        더보기
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
                      <Text className="text-[10px] leading-tight text-[#64748b]">조치 완료</Text>
                      <Text className="font-semibold text-[#15803d]" style={{ fontSize: 14, marginTop: 2 }}>
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
                      <Text className="text-[10px] leading-tight text-[#64748b]">조치중</Text>
                      <Text className="font-semibold text-[#d97706]" style={{ fontSize: 14, marginTop: 2 }}>
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
                      <Text className="text-[10px] leading-tight text-[#64748b]">미조치</Text>
                      <Text className="font-semibold text-[#dc2626]" style={{ fontSize: 14, marginTop: 2 }}>
                        {suggestionStats.pending}
                      </Text>
                    </View>
                  </View>
                </View>
              </LinearGradient>

              <View className="border-t border-[rgba(0,0,47,0.06)] bg-[#fafbff] px-4 py-2.5">
                <Text className="text-xs font-medium text-[#475569]" style={{ letterSpacing: 0.2, marginBottom: 10 }}>
                  최근 건의
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
                  전체 건의사항 보기
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
