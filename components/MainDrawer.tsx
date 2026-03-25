import { BlurView } from 'expo-blur';
import { Href, router, usePathname, useSegments } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  ChevronDown,
  Globe,
  Home,
  LogOut,
  MapPin,
  MessageSquare,
  Settings,
  X,
  Zap,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  Dimensions,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useDrawer } from '@/contexts/DrawerContext';

const DRAWER_WIDTH = Math.min(318, Math.round(Dimensions.get('window').width * 0.88));
const RADIUS = 22;

type MenuKey = 'home' | 'tbm' | 'suggestions' | 'settings';

function useActiveMenu(): MenuKey {
  const segments = useSegments();
  const pathname = usePathname();
  const leaf = segments[segments.length - 1] ?? '';
  if (leaf === 'tbm' || pathname.includes('/tbm')) return 'tbm';
  if (leaf === 'profile' || pathname.includes('profile')) return 'settings';
  if (leaf === 'suggestions' || pathname.includes('suggestions')) return 'suggestions';
  return 'home';
}

export function MainDrawer() {
  const { open, closeDrawer } = useDrawer();
  const insets = useSafeAreaInsets();
  const active = useActiveMenu();
  const [langOpen, setLangOpen] = useState(false);
  const slide = useSharedValue(DRAWER_WIDTH);

  useEffect(() => {
    slide.value = withTiming(open ? 0 : DRAWER_WIDTH, { duration: 280 });
  }, [open, slide]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slide.value }],
  }));

  const go = useCallback(
    (href: Href) => {
      closeDrawer();
      router.push(href);
    },
    [closeDrawer],
  );

  const logout = useCallback(() => {
    closeDrawer();
    router.replace('/' as Href);
  }, [closeDrawer]);

  return (
    <Modal visible={open} transparent animationType="none" onRequestClose={closeDrawer} statusBarTranslucent>
      <View style={styles.root} pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} accessibilityLabel="메뉴 닫기">
          {Platform.OS === 'web' ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 23, 42, 0.5)' }]} />
          ) : (
            <BlurView intensity={48} tint="dark" style={StyleSheet.absoluteFill} />
          )}
        </Pressable>

        <Animated.View
          style={[
            styles.panel,
            {
              width: DRAWER_WIDTH,
              paddingTop: insets.top + 10,
              paddingBottom: insets.bottom + 10,
            },
            panelStyle,
          ]}>
          <View
            className="flex-1 overflow-hidden bg-white"
            style={{
              borderTopLeftRadius: RADIUS,
              borderBottomLeftRadius: RADIUS,
              shadowColor: '#0f172a',
              shadowOffset: { width: -8, height: 0 },
              shadowOpacity: 0.12,
              shadowRadius: 28,
              elevation: 16,
            }}>
            {/* 히어로 */}
            <LinearGradient
              colors={['#1d4ed8', '#3e63dd', '#5b7fd9']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{ paddingHorizontal: 18, paddingTop: 16, paddingBottom: 22 }}>
              <View className="pointer-events-none absolute -right-10 -top-6 h-36 w-36 rounded-full bg-white/10" />
              <View className="pointer-events-none absolute bottom-0 left-0 h-24 w-24 rounded-full bg-black/10" />

              <View className="mb-5 flex-row items-center justify-between">
                <View>
                  <Text
                    style={{
                      fontFamily: 'Pretendard-Medium',
                      fontSize: 11,
                      letterSpacing: 2,
                      color: 'rgba(255,255,255,0.75)',
                    }}>
                    WELCOME
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Pretendard-Bold',
                      fontSize: 22,
                      letterSpacing: -0.5,
                      color: '#ffffff',
                      marginTop: 4,
                    }}>
                    안전한 하루 되세요
                  </Text>
                </View>
                <Pressable
                  onPress={closeDrawer}
                  className="h-11 w-11 items-center justify-center rounded-full active:opacity-70"
                  style={{ backgroundColor: 'rgba(255,255,255,0.22)' }}
                  accessibilityLabel="닫기">
                  <X color="#ffffff" size={22} strokeWidth={2.2} />
                </Pressable>
              </View>

              <View className="flex-row items-center gap-3">
                <View
                  className="h-[76px] w-[76px] items-center justify-center rounded-2xl border-[3px] border-white/90"
                  style={{
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.15,
                    shadowRadius: 8,
                  }}>
                  <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 30, color: '#ffffff' }}>김</Text>
                </View>
                <View className="min-w-0 flex-1">
                  <Text
                    style={{
                      fontFamily: 'Pretendard-Bold',
                      fontSize: 20,
                      letterSpacing: -0.4,
                      color: '#ffffff',
                    }}
                    numberOfLines={1}>
                    김안전
                  </Text>
                  <View className="mt-2 self-start rounded-full bg-white/20 px-2.5 py-1">
                    <Text
                      style={{
                        fontFamily: 'Pretendard-Medium',
                        fontSize: 12,
                        color: 'rgba(255,255,255,0.95)',
                      }}
                      numberOfLines={1}>
                      세이프틱스 강남 사업장
                    </Text>
                  </View>
                </View>
              </View>

              <View
                className="mt-4 flex-row items-start gap-2 rounded-2xl px-3 py-2.5"
                style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}>
                <MapPin color="rgba(255,255,255,0.9)" size={18} strokeWidth={2} style={{ marginTop: 2 }} />
                <View className="min-w-0 flex-1">
                  <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>
                    현재 위치
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Pretendard-Regular',
                      fontSize: 13,
                      color: '#ffffff',
                      marginTop: 2,
                      lineHeight: 18,
                    }}
                    numberOfLines={2}>
                    서울 강남구 테헤란로 일대
                  </Text>
                </View>
              </View>
            </LinearGradient>

            {/* 메뉴 구역 */}
            <View className="px-4 pb-1 pt-5">
              <Text
                style={{
                  fontFamily: 'Pretendard-SemiBold',
                  fontSize: 12,
                  letterSpacing: 1.2,
                  color: '#94a3b8',
                }}>
                MENU
              </Text>
            </View>

            <ScrollView className="flex-1 px-3" showsVerticalScrollIndicator={false} bounces={false}>
              <MenuRow
                icon={Home}
                label="홈"
                subtitle="대시보드"
                active={active === 'home'}
                onPress={() => go('/(main)' as Href)}
              />
              <MenuRow
                icon={Zap}
                label="Tool Box Meeting"
                subtitle="작업전 안전회의"
                active={active === 'tbm'}
                onPress={() => go('/tbm' as Href)}
              />
              <MenuRow
                icon={MessageSquare}
                label="건의사항"
                subtitle="의견 · 요청"
                active={active === 'suggestions'}
                onPress={() => go('/suggestions' as Href)}
              />
              <MenuRow
                icon={Settings}
                label="설정"
                subtitle="계정 · 알림"
                active={active === 'settings'}
                onPress={() => go('/profile' as Href)}
              />

              <View className="my-3 h-px bg-slate-100" />

              <Pressable
                onPress={() => setLangOpen((v) => !v)}
                className="mb-1 flex-row items-center rounded-2xl px-3 py-3 active:bg-slate-50">
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-slate-100">
                  <Globe color="#3e63dd" size={20} strokeWidth={2} />
                </View>
                <View className="min-w-0 flex-1 pl-3">
                  <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 16, color: '#0f172a' }}>언어</Text>
                  <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, color: '#94a3b8', marginTop: 2 }}>
                    한국어
                  </Text>
                </View>
                <View
                  className="h-9 w-9 items-center justify-center rounded-full bg-slate-100"
                  style={{ transform: [{ rotate: langOpen ? '180deg' : '0deg' }] }}>
                  <ChevronDown color="#64748b" size={20} strokeWidth={2} />
                </View>
              </Pressable>

              {langOpen ? (
                <View className="mb-2 overflow-hidden rounded-xl border border-slate-100 bg-slate-50/80">
                  <Pressable className="border-b border-slate-100/80 px-4 py-3 active:bg-white/60">
                    <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, color: '#3e63dd' }}>한국어</Text>
                    <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                      기본
                    </Text>
                  </Pressable>
                  <Pressable className="px-4 py-3 active:bg-white/60">
                    <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 14, color: '#334155' }}>English</Text>
                  </Pressable>
                </View>
              ) : null}

              <View className="h-2" />

              <Pressable
                onPress={logout}
                className="mb-2 flex-row items-center rounded-2xl border border-red-100 bg-red-50/60 px-3 py-3.5 active:bg-red-50">
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-red-100/80">
                  <LogOut color="#dc2626" size={20} strokeWidth={2} />
                </View>
                <Text
                  style={{
                    fontFamily: 'Pretendard-SemiBold',
                    fontSize: 16,
                    color: '#b91c1c',
                    marginLeft: 12,
                  }}>
                  로그아웃
                </Text>
              </Pressable>

              <View className="h-2" />
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

function MenuRow({
  icon: Icon,
  label,
  subtitle,
  active,
  onPress,
}: {
  icon: typeof Home;
  label: string;
  subtitle?: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="mb-2 flex-row items-center rounded-2xl py-2.5 pr-2 active:opacity-90"
      style={[
        { paddingLeft: active ? 10 : 14 },
        active
          ? {
              backgroundColor: 'rgba(62, 99, 221, 0.1)',
              borderWidth: 1,
              borderColor: 'rgba(62, 99, 221, 0.22)',
            }
          : { backgroundColor: 'transparent' },
      ]}>
      {active ? (
        <View className="mr-2 w-1 self-stretch rounded-full bg-[#3e63dd]" style={{ minHeight: 40 }} />
      ) : null}
      <View
        className="h-11 w-11 items-center justify-center rounded-xl"
        style={{ backgroundColor: active ? 'rgba(62, 99, 221, 0.18)' : '#f1f5f9' }}>
        <Icon color={active ? '#3e63dd' : '#475569'} size={20} strokeWidth={2} />
      </View>
      <View className="min-w-0 flex-1 pl-2.5">
        <Text
          style={{
            fontFamily: active ? 'Pretendard-SemiBold' : 'Pretendard-Medium',
            fontSize: 16,
            letterSpacing: -0.35,
            color: active ? '#1e3a8a' : '#0f172a',
          }}
          numberOfLines={1}>
          {label}
        </Text>
        {subtitle ? (
          <Text
            style={{
              fontFamily: 'Pretendard-Regular',
              fontSize: 12,
              color: active ? 'rgba(30,58,138,0.65)' : '#94a3b8',
              marginTop: 2,
            }}
            numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  panel: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
    elevation: 24,
  },
});
