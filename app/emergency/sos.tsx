import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { ArrowLeft, CheckCircle, Siren } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, Text, Vibration, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useLang } from '@/contexts/LangContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

/** 벨 반복 간격 (ms) — expo-av 루프 사용 시 fallback */
const VIBRATION_PATTERN = [0, 400, 200, 400, 200, 400];

function formatTime(date: Date): string {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function SosScreen() {
  const { s } = useLang();
  const insets = useSafeAreaInsets();
  const { pagePaddingX, headerTitleFontSize } = useResponsiveLayout();

  const [sent, setSent] = useState(false);
  const [sentTime, setSentTime] = useState('');

  const soundRef = useRef<Audio.Sound | null>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  /* 상태바 */
  useEffect(() => {
    setStatusBarStyle('light');
    return () => setStatusBarStyle('dark');
  }, []);

  /* 입장 fade-in */
  useEffect(() => {
    Animated.timing(opacityAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [opacityAnim]);

  /* 아이콘 맥박 애니메이션 */
  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.18,
          duration: 500,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 500,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );
    pulse.start();
    return () => pulse.stop();
  }, [pulseAnim]);

  /* 사운드 + 진동 재생 — 기기 설정 그대로 따름
   * 소리 모드: 소리 + 진동 / 진동 모드: 진동만 / 무음: 아무것도 안 함 */
  const startAlarm = useCallback(async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,   // iOS 무음 스위치 존중
        staysActiveInBackground: false,
        shouldDuckAndroid: false,      // 다른 앱 볼륨 건드리지 않음
      });
      const { sound } = await Audio.Sound.createAsync(
        require('@/assets/sounds/siren.mp3'),
        { shouldPlay: true, isLooping: true, volume: 1.0 },
      );
      soundRef.current = sound;
    } catch {
      /* 사운드 로드 실패 시 진동 폴백 */
    }
    Vibration.vibrate(VIBRATION_PATTERN, true);
  }, []);

  const stopAlarm = useCallback(async () => {
    Vibration.cancel();
    if (soundRef.current) {
      await soundRef.current.stopAsync().catch(() => {});
      await soundRef.current.unloadAsync().catch(() => {});
      soundRef.current = null;
    }
  }, []);

  /* 화면 진입 시 경보 시작 — 사용자가 SOS 종료 버튼을 누를 때까지 계속 울림 */
  useEffect(() => {
    void startAlarm();
    return () => {
      void stopAlarm();
    };
  }, [startAlarm, stopAlarm]);

  const handleBack = async () => {
    await stopAlarm();
    router.replace('/(main)');
  };

  return (
    <Animated.View style={{ flex: 1, opacity: opacityAnim }}>
      <LinearGradient
        colors={sent ? ['#064e3b', '#065f46', '#047857'] : ['#7f1d1d', '#991b1b', '#dc2626']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ flex: 1 }}>

        {/* 배경 원형 장식 */}
        <View
          pointerEvents="none"
          style={{
            position: 'absolute', top: -60, right: -60,
            width: 260, height: 260, borderRadius: 130,
            backgroundColor: 'rgba(255,255,255,0.06)',
          }}
        />
        <View
          pointerEvents="none"
          style={{
            position: 'absolute', bottom: -80, left: -40,
            width: 200, height: 200, borderRadius: 100,
            backgroundColor: 'rgba(255,255,255,0.04)',
          }}
        />

        {/* 헤더 */}
        <View
          style={{
            paddingTop: insets.top + 12,
            paddingBottom: 12,
            paddingHorizontal: pagePaddingX,
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
          }}>
          <Pressable
            onPress={() => void handleBack()}
            accessibilityRole="button"
            accessibilityLabel={s.emergency.sos.backToHome}
            style={{
              width: 40, height: 40,
              alignItems: 'center', justifyContent: 'center',
              borderRadius: 8,
              backgroundColor: 'rgba(255,255,255,0.15)',
            }}>
            <ArrowLeft color="#fff" size={18} strokeWidth={2} />
          </Pressable>
          <Text
            style={{
              flex: 1, textAlign: 'center',
              fontFamily: 'Pretendard-Bold',
              fontSize: headerTitleFontSize,
              lineHeight: headerTitleFontSize + 12,
              letterSpacing: -0.5,
              color: '#ffffff',
            }}>
            {s.emergency.sos.screenTitle}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        {/* 메인 콘텐츠 */}
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: pagePaddingX, gap: 32 }}>

          {/* 아이콘 */}
          <Animated.View
            style={{
              transform: [{ scale: sent ? 1 : pulseAnim }],
              width: 120, height: 120,
              borderRadius: 60,
              backgroundColor: 'rgba(255,255,255,0.15)',
              alignItems: 'center', justifyContent: 'center',
              borderWidth: 2,
              borderColor: 'rgba(255,255,255,0.3)',
            }}>
            {sent
              ? <CheckCircle color="#ffffff" size={52} strokeWidth={1.8} />
              : <Siren color="#ffffff" size={52} strokeWidth={1.8} />
            }
          </Animated.View>

          {/* 상태 텍스트 */}
          <View style={{ alignItems: 'center', gap: 12 }}>
            <Text style={{
              fontFamily: 'Pretendard-Bold',
              fontSize: 28,
              letterSpacing: -0.7,
              color: '#ffffff',
              textAlign: 'center',
            }}>
              {sent ? s.emergency.sos.sent : s.emergency.sos.sending}
            </Text>

            {sent ? (
              <>
                <Text style={{
                  fontFamily: 'Pretendard-Regular',
                  fontSize: 15,
                  lineHeight: 23,
                  color: 'rgba(255,255,255,0.85)',
                  textAlign: 'center',
                  letterSpacing: -0.2,
                }}>
                  {s.emergency.sos.sentDesc}
                </Text>

                <View style={{
                  marginTop: 8,
                  paddingHorizontal: 16, paddingVertical: 10,
                  borderRadius: 12,
                  backgroundColor: 'rgba(255,255,255,0.12)',
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.2)',
                  alignItems: 'center',
                  gap: 2,
                }}>
                  <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 0.3 }}>
                    {s.emergency.sos.sentAt}
                  </Text>
                  <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 20, letterSpacing: 1, color: '#ffffff' }}>
                    {sentTime}
                  </Text>
                </View>
              </>
            ) : (
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 4 }}>
                {[0, 1, 2].map((i) => (
                  <SendingDot key={i} delay={i * 220} />
                ))}
              </View>
            )}
          </View>

          {/* 전송 메시지 미리보기 */}
          {sent ? (
            <View style={{
              width: '100%',
              maxWidth: 360,
              borderRadius: 14,
              backgroundColor: 'rgba(255,255,255,0.1)',
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.18)',
              padding: 14,
              gap: 6,
            }}>
              <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 0.5 }}>
                SENT MESSAGE
              </Text>
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, lineHeight: 20, color: 'rgba(255,255,255,0.9)', letterSpacing: -0.15 }}>
                {s.emergency.sos.autoMessage}
              </Text>
            </View>
          ) : null}
        </View>

        {/* 하단 버튼 */}
        <View style={{ paddingHorizontal: pagePaddingX, paddingBottom: Math.max(insets.bottom, 24) + 8, gap: 10 }}>
          {sent ? (
            <Pressable
              onPress={() => void handleBack()}
              accessibilityRole="button"
              style={{
                height: 56,
                borderRadius: 16,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: 'rgba(255,255,255,0.2)',
                borderWidth: 1,
                borderColor: 'rgba(255,255,255,0.3)',
              }}>
              <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 16, color: '#ffffff', letterSpacing: -0.3 }}>
                {s.emergency.sos.backToHome}
              </Text>
            </Pressable>
          ) : (
            <Pressable
              onPress={() => void stopAlarm().then(() => { setSentTime(formatTime(new Date())); setSent(true); })}
              accessibilityRole="button"
              style={{
                height: 56,
                borderRadius: 16,
                alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#ffffff',
              }}>
              <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 17, color: '#991b1b', letterSpacing: -0.4 }}>
                {s.emergency.sos.sosEnd}
              </Text>
            </Pressable>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
}

/** 전송 중 점 애니메이션 */
function SendingDot({ delay }: { delay: number }) {
  const anim = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0.3, duration: 400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [anim, delay]);

  return (
    <Animated.View
      style={{
        width: 10, height: 10, borderRadius: 5,
        backgroundColor: '#ffffff',
        opacity: anim,
      }}
    />
  );
}
