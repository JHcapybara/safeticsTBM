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
  useWindowDimensions,
  View,
} from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { scrollViewAndroidProps } from '@/constants/scrollViewAndroid';
import { useAuth } from '@/contexts/AuthContext';
import { useDrawer } from '@/contexts/DrawerContext';
import { useLang } from '@/contexts/LangContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

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
  const { logout } = useAuth();
  const { s, lang, setLang } = useLang();
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { drawerWidth } = useResponsiveLayout();
  const screenHeight = Math.max(Dimensions.get('screen').height, windowHeight);
  const active = useActiveMenu();
  const [langOpen, setLangOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const slide = useSharedValue(drawerWidth);

  useEffect(() => {
    slide.value = withTiming(open ? 0 : drawerWidth, { duration: 280 });
  }, [open, drawerWidth, slide]);

  useEffect(() => {
    if (!open) slide.value = drawerWidth;
  }, [drawerWidth, open, slide]);

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

  const openLogoutConfirm = useCallback(() => {
    closeDrawer();
    setLogoutConfirmOpen(true);
  }, [closeDrawer]);

  const confirmLogout = useCallback(() => {
    // 1. 모달·드로어 먼저 닫기
    setLogoutConfirmOpen(false);
    closeDrawer();
    // 2. 화면 이동을 먼저 → (main) Stack이 언마운트된 뒤 상태 초기화
    //    순서가 반대면 isLoggedIn이 false가 되는 시점에 Navigator가 아직 살아있어 Render Error 발생
    router.replace('/');
    // 3. 애니메이션 전환이 끝난 뒤 auth 상태 초기화 (UI 깜빡임 방지)
    setTimeout(() => {
      logout();
    }, 400);
  }, [closeDrawer, logout]);

  const cancelLogout = useCallback(() => {
    setLogoutConfirmOpen(false);
  }, []);

  return (
    <>
    <Modal visible={open} transparent animationType="none" onRequestClose={closeDrawer} statusBarTranslucent>
      <View style={[styles.root, { height: screenHeight, minHeight: screenHeight }]} pointerEvents="box-none">
        <Pressable style={StyleSheet.absoluteFill} onPress={closeDrawer} accessibilityLabel={s.nav.home}>
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
              width: drawerWidth,
              height: screenHeight,
              paddingTop: insets.top,
              paddingBottom: insets.bottom,
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
                      lineHeight: 13,
                      letterSpacing: 2,
                      color: 'rgba(255,255,255,0.75)',
                    }}>
                    {s.drawer.welcomeBadge}
                  </Text>
                  <Text
                    style={{
                      fontFamily: 'Pretendard-Bold',
                      fontSize: 22,
                      lineHeight: 26,
                      letterSpacing: -0.5,
                      color: '#ffffff',
                      marginTop: 4,
                    }}>
                    {s.drawer.greeting}
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

              <View className="min-w-0">
                <Text
                  style={{
                    fontFamily: 'Pretendard-Bold',
                    fontSize: 20,
                    lineHeight: 24,
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
                      lineHeight: 14,
                      color: 'rgba(255,255,255,0.95)',
                    }}
                    numberOfLines={1}>
                    세이프틱스 강남 사업장
                  </Text>
                </View>
              </View>

              <View
                className="mt-4 flex-row items-start gap-2 rounded-2xl px-3 py-2.5"
                style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}>
                <MapPin color="rgba(255,255,255,0.9)" size={18} strokeWidth={2} style={{ marginTop: 2 }} />
                <View className="min-w-0 flex-1">
                  <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 11, lineHeight: 13, color: 'rgba(255,255,255,0.7)' }}>
                    {s.drawer.currentLocation}
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
                  lineHeight: 14,
                  letterSpacing: 1.2,
                  color: '#94a3b8',
                }}>
                {s.drawer.menuLabel}
              </Text>
            </View>

            <ScrollView
              {...scrollViewAndroidProps}
              className="flex-1 px-3"
              style={{ flex: 1 }}
              contentContainerClassName="pb-8"
              showsVerticalScrollIndicator={false}
              bounces={false}>
              <MenuRow
                icon={Home}
                label={s.nav.home}
                subtitle={s.nav.dashboard}
                active={active === 'home'}
                onPress={() => go('/(main)' as Href)}
              />
              <MenuRow
                icon={Zap}
                label={s.nav.tbm}
                subtitle={s.nav.tbmSubtitle}
                active={active === 'tbm'}
                onPress={() => go('/tbm' as Href)}
              />
              <MenuRow
                icon={MessageSquare}
                label={s.nav.suggestions}
                subtitle={s.nav.suggestionsSubtitle}
                active={active === 'suggestions'}
                onPress={() => go('/suggestions' as Href)}
              />
              <MenuRow
                icon={Settings}
                label={s.nav.settings}
                subtitle={s.nav.settingsSubtitle}
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
                  <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 16, lineHeight: 19, color: '#0f172a' }}>{s.common.language}</Text>
                  <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, lineHeight: 14, color: '#94a3b8', marginTop: 2 }}>
                    {lang === 'ko' ? s.common.korean : s.common.english}
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
                  <Pressable
                    className="border-b border-slate-100/80 px-4 py-3 active:bg-white/60"
                    onPress={() => { setLang('ko'); setLangOpen(false); }}>
                    <Text style={{ fontFamily: lang === 'ko' ? 'Pretendard-SemiBold' : 'Pretendard-Regular', fontSize: 14, lineHeight: 17, color: lang === 'ko' ? '#3e63dd' : '#334155' }}>
                      {s.common.korean}
                    </Text>
                    {lang === 'ko' ? (
                      <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 11, lineHeight: 13, color: '#94a3b8', marginTop: 2 }}>
                        {s.common.default}
                      </Text>
                    ) : null}
                  </Pressable>
                  <Pressable
                    className="px-4 py-3 active:bg-white/60"
                    onPress={() => { setLang('en'); setLangOpen(false); }}>
                    <Text style={{ fontFamily: lang === 'en' ? 'Pretendard-SemiBold' : 'Pretendard-Regular', fontSize: 14, lineHeight: 17, color: lang === 'en' ? '#3e63dd' : '#334155' }}>
                      {s.common.english}
                    </Text>
                  </Pressable>
                </View>
              ) : null}

              <View className="h-2" />

              <Pressable
                onPress={openLogoutConfirm}
                className="mb-2 flex-row items-center rounded-2xl border border-red-100 bg-red-50/60 px-3 py-3.5 active:bg-red-50">
                <View className="h-11 w-11 items-center justify-center rounded-xl bg-red-100/80">
                  <LogOut color="#dc2626" size={20} strokeWidth={2} />
                </View>
                <Text
                  style={{
                    fontFamily: 'Pretendard-SemiBold',
                    fontSize: 16,
                    lineHeight: 19,
                    color: '#b91c1c',
                    marginLeft: 12,
                  }}>
                  {s.common.logout}
                </Text>
              </Pressable>

              <View className="h-2" />
            </ScrollView>
          </View>
        </Animated.View>
      </View>
    </Modal>

    <Modal
      visible={logoutConfirmOpen}
      transparent
      animationType="fade"
      onRequestClose={cancelLogout}
      statusBarTranslucent>
      <View style={{ flex: 1 }}>
      <Pressable
        style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(15, 23, 42, 0.45)', zIndex: 0 }]}
        onPress={cancelLogout}
        accessibilityRole="button"
        accessibilityLabel={s.common.logoutConfirmNo}
      />
      <View
        style={[
          StyleSheet.absoluteFillObject,
          {
            zIndex: 1,
            elevation: 8,
            justifyContent: 'center',
            alignItems: 'center',
            paddingHorizontal: 24,
          },
        ]}
        pointerEvents="box-none">
        <View
          className="w-full max-w-[320px] overflow-hidden rounded-2xl bg-white"
          style={{
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 12 },
            shadowOpacity: 0.15,
            shadowRadius: 24,
            elevation: 24,
          }}
          pointerEvents="auto">
          <Text
            style={{
              fontFamily: 'Pretendard-SemiBold',
              fontSize: 17,
              lineHeight: 24,
              letterSpacing: -0.35,
              color: '#0f172a',
              paddingHorizontal: 20,
              paddingTop: 22,
              paddingBottom: 8,
              textAlign: 'center',
            }}>
            {s.common.logoutConfirmMessage}
          </Text>
          <View className="mt-2 flex-row border-t border-slate-100">
            <Pressable
              onPress={cancelLogout}
              className="flex-1 items-center justify-center border-r border-slate-100 py-3.5 active:bg-slate-50"
              accessibilityRole="button"
              accessibilityLabel={s.common.logoutConfirmNo}>
              <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 16, lineHeight: 22, color: '#64748b' }}>
                {s.common.logoutConfirmNo}
              </Text>
            </Pressable>
            <Pressable
              onPress={confirmLogout}
              className="flex-1 items-center justify-center py-3.5 active:bg-red-50"
              accessibilityRole="button"
              accessibilityLabel={s.common.logoutConfirmYes}
              hitSlop={8}>
              <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 16, lineHeight: 22, color: '#b91c1c' }} pointerEvents="none">
                {s.common.logoutConfirmYes}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
      </View>
    </Modal>
    </>
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
            lineHeight: 19,
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
              lineHeight: 14,
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
    zIndex: 2,
    elevation: 24,
  },
});
