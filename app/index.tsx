import { SafeticsSymbol } from '@/components/SafeticsSymbol';
import { LinearGradient } from 'expo-linear-gradient';
import { Redirect, Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import type { LucideIcon } from 'lucide-react-native';
import { Globe, KeyRound, Lock, Phone, ShieldCheck, User, UserCircle } from 'lucide-react-native';
import { useState } from 'react';
import type { TextStyle } from 'react-native';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { scrollViewAndroidProps } from '@/constants/scrollViewAndroid';
import { useAuth } from '@/contexts/AuthContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import type { SupportedLang } from '@/lang';
import { useLang } from '@/contexts/LangContext';

const LOGIN_URL_CONTACT = 'https://safetics.io/contact';
const LOGIN_URL_REGISTER = 'https://safetydesigner.safetics.io/account/Register';

/** LGN-01 — 로그인 (아이디 / 인증번호) */
type LoginTab = 'id' | 'otp';

const footerLinkTextStyle = {
  fontFamily: 'Pretendard-Medium' as const,
  fontSize: 14,
  letterSpacing: -0.3,
  color: '#64748b',
};

/** AOS TextInput: 플레이스홀더 세로 잘림 방지 */
function loginFieldTextStyle(): TextStyle {
  const base: TextStyle = {
    fontFamily: 'Pretendard-Regular',
    fontSize: 16,
    letterSpacing: -0.35,
    color: '#0f172a',
  };
  if (Platform.OS === 'android') {
    return {
      ...base,
      paddingVertical: 0,
      textAlignVertical: 'center',
      includeFontPadding: false,
    };
  }
  return { ...base, lineHeight: 22 };
}

function FieldShell({ icon: Icon, children }: { icon: LucideIcon; children: React.ReactNode }) {
  return (
    <View
      className="flex-row items-center overflow-hidden rounded-2xl border border-[rgba(0,46,201,0.1)] bg-white px-3.5"
      style={{
        minHeight: 52,
        shadowColor: '#002ec9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
        elevation: 3,
      }}>
      <View className="py-3 pr-2">
        <Icon color="#3e63dd" size={20} strokeWidth={2} />
      </View>
      <View className="min-h-[52px] flex-1 justify-center py-2 pr-1">{children}</View>
    </View>
  );
}

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const { pagePaddingX, loginFormMaxWidth, isTablet, isLargeTablet } = useResponsiveLayout();
  const { s, lang, setLang } = useLang();
  const { isLoggedIn, login } = useAuth();
  const [tab, setTab] = useState<LoginTab>('id');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [phone, setPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  if (isLoggedIn) {
    return <Redirect href="/(main)" />;
  }

  const handleLogin = () => {
    setLoginError(null);
    if (tab === 'otp') {
      setLoginError(s.login.otpNotAvailable);
      return;
    }
    const ok = login(userId, password);
    if (!ok) {
      setLoginError(s.login.invalidCredentials);
    }
  };

  const switchTab = (next: LoginTab) => {
    setTab(next);
    setLoginError(null);
  };

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        className="flex-1 bg-[#fbfdff]"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          {...scrollViewAndroidProps}
          className="flex-1 bg-[#fbfdff]"
          style={{ flex: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ minHeight: windowHeight }}
          contentContainerClassName="pb-10">
          {/* 히어로 */}
          <View className="overflow-hidden pb-14" style={{ paddingTop: insets.top + 20 }}>
            <LinearGradient
              colors={['#0f2a9e', '#1e45d4', '#3e63dd']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            />
            <View
              className="pointer-events-none absolute -right-16 -top-10 h-52 w-52 rounded-full"
              style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}
            />
            <View
              className="pointer-events-none absolute -bottom-8 left-10 h-36 w-10 rounded-full bg-[#60a5fa]/25"
              style={{ transform: [{ rotate: '12deg' }] }}
            />

            <View style={{ paddingHorizontal: Math.max(20, pagePaddingX) }}>
              <View className="mb-3 flex-row items-center justify-between gap-3">
                <View className="flex-row items-center gap-2 self-start rounded-full bg-white/15 px-3 py-1.5">
                  <ShieldCheck color="#ffffff" size={16} strokeWidth={2.2} />
                  <Text
                    style={{
                      fontFamily: 'Pretendard-SemiBold',
                      fontSize: 11,
                      letterSpacing: 1,
                      color: 'rgba(255,255,255,0.92)',
                    }}>
                    SAFETICS
                  </Text>
                </View>
                <View className="flex-row items-center gap-1.5">
                  <Globe color="rgba(255,255,255,0.85)" size={16} strokeWidth={2} />
                  <View
                    className="flex-row rounded-full p-0.5"
                    style={{ backgroundColor: 'rgba(255,255,255,0.14)' }}
                    accessibilityRole="radiogroup"
                    accessibilityLabel={s.common.language}>
                    {(['ko', 'en'] as const satisfies readonly SupportedLang[]).map((code) => {
                      const selected = lang === code;
                      return (
                        <Pressable
                          key={code}
                          onPress={() => setLang(code)}
                          accessibilityRole="radio"
                          accessibilityState={{ selected }}
                          accessibilityLabel={code === 'ko' ? s.common.korean : s.common.english}
                          hitSlop={6}
                          className="rounded-full px-2.5 py-1.5"
                          style={{
                            backgroundColor: selected ? 'rgba(255,255,255,0.95)' : 'transparent',
                          }}>
                          <Text
                            style={{
                              fontFamily: selected ? 'Pretendard-SemiBold' : 'Pretendard-Medium',
                              fontSize: 12,
                              letterSpacing: -0.2,
                              color: selected ? '#1e40af' : 'rgba(255,255,255,0.9)',
                            }}>
                            {code === 'ko' ? 'KO' : 'EN'}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </View>
                </View>
              </View>
              <Text
                style={{
                  fontFamily: 'Pretendard-Bold',
                  fontSize: isLargeTablet ? 38 : isTablet ? 36 : 32,
                  lineHeight: isLargeTablet ? 46 : isTablet ? 44 : 40,
                  letterSpacing: -0.9,
                  color: '#ffffff',
                }}>
                {s.login.title}
              </Text>
              <Text
                style={{
                  fontFamily: 'Pretendard-Regular',
                  fontSize: isTablet ? 17 : 16,
                  lineHeight: isTablet ? 26 : 24,
                  letterSpacing: -0.35,
                  color: 'rgba(255,255,255,0.88)',
                  marginTop: 10,
                  maxWidth: isTablet ? 480 : 320,
                }}>
                {s.login.subtitle}
              </Text>
            </View>
          </View>

          {/* 오버랩 카드 */}
          <View style={{ paddingHorizontal: pagePaddingX, marginTop: -48 }}>
            <View
              className="overflow-hidden rounded-[22px] border border-[rgba(0,46,201,0.08)] bg-white"
              style={{
                maxWidth: loginFormMaxWidth,
                width: '100%',
                alignSelf: 'center',
                shadowColor: '#002ec9',
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.12,
                shadowRadius: 32,
                elevation: 14,
              }}>
              <LinearGradient
                colors={['rgba(62,99,221,0.06)', '#ffffff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 0, y: 1 }}
                style={{ paddingHorizontal: 20, paddingTop: 22, paddingBottom: 4 }}>
                {/* 세그먼트 */}
                <View
                  className="flex-row rounded-2xl p-1"
                  style={{ backgroundColor: 'rgba(0, 46, 201, 0.07)' }}>
                  <Pressable
                    onPress={() => switchTab('id')}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: tab === 'id' }}
                    className="native:flex-1 overflow-hidden rounded-xl"
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      alignItems: 'center',
                      backgroundColor: tab === 'id' ? '#ffffff' : 'transparent',
                      ...(tab === 'id'
                        ? {
                            shadowColor: '#3e63dd',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 8,
                            elevation: 4,
                          }
                        : null),
                    }}>
                    <Text
                      style={{
                        fontFamily: tab === 'id' ? 'Pretendard-SemiBold' : 'Pretendard-Medium',
                        fontSize: 14,
                        letterSpacing: -0.3,
                        color: tab === 'id' ? '#0f172a' : '#64748b',
                      }}
                      numberOfLines={1}>
                      {s.login.tabId}
                    </Text>
                  </Pressable>
                  <Pressable
                    onPress={() => switchTab('otp')}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: tab === 'otp' }}
                    className="native:flex-1 overflow-hidden rounded-xl"
                    style={{
                      flex: 1,
                      paddingVertical: 12,
                      alignItems: 'center',
                      backgroundColor: tab === 'otp' ? '#ffffff' : 'transparent',
                      ...(tab === 'otp'
                        ? {
                            shadowColor: '#3e63dd',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.15,
                            shadowRadius: 8,
                            elevation: 4,
                          }
                        : null),
                    }}>
                    <Text
                      style={{
                        fontFamily: tab === 'otp' ? 'Pretendard-SemiBold' : 'Pretendard-Medium',
                        fontSize: 14,
                        letterSpacing: -0.3,
                        color: tab === 'otp' ? '#0f172a' : '#64748b',
                      }}
                      numberOfLines={1}>
                      {s.login.tabOtp}
                    </Text>
                  </Pressable>
                </View>
              </LinearGradient>

              <View className="gap-3 px-5 pb-2 pt-1">
                {tab === 'id' ? (
                  <>
                    <View className="gap-1.5">
                      <Text
                        style={{
                          fontFamily: 'Pretendard-Medium',
                          fontSize: 13,
                          letterSpacing: -0.2,
                          color: '#64748b',
                        }}>
                        {s.login.labelId}
                      </Text>
                      <FieldShell icon={User}>
                        <TextInput
                          placeholder={s.login.placeholderIdLogin}
                          placeholderTextColor="rgba(15, 23, 42, 0.38)"
                          value={userId}
                          onChangeText={(t) => {
                            setUserId(t);
                            setLoginError(null);
                          }}
                          autoCapitalize="none"
                          autoCorrect={false}
                          textContentType="username"
                          className="w-full text-[#0f172a]"
                          style={loginFieldTextStyle()}
                        />
                      </FieldShell>
                    </View>
                    <View className="gap-1.5">
                      <Text
                        style={{
                          fontFamily: 'Pretendard-Medium',
                          fontSize: 13,
                          letterSpacing: -0.2,
                          color: '#64748b',
                        }}>
                        {s.login.labelPassword}
                      </Text>
                      <FieldShell icon={Lock}>
                        <TextInput
                          placeholder={s.login.placeholderPassword}
                          placeholderTextColor="rgba(15, 23, 42, 0.38)"
                          value={password}
                          onChangeText={(t) => {
                            setPassword(t);
                            setLoginError(null);
                          }}
                          secureTextEntry
                          textContentType="password"
                          autoCapitalize="none"
                          className="w-full text-[#0f172a]"
                          style={loginFieldTextStyle()}
                        />
                      </FieldShell>
                    </View>
                  </>
                ) : (
                  <>
                    <View className="gap-1.5">
                      <Text
                        style={{
                          fontFamily: 'Pretendard-Medium',
                          fontSize: 13,
                          letterSpacing: -0.2,
                          color: '#64748b',
                        }}>
                        {s.login.labelOtp}
                      </Text>
                      <FieldShell icon={KeyRound}>
                        <TextInput
                          placeholder={s.login.placeholderOtp}
                          placeholderTextColor="rgba(15, 23, 42, 0.38)"
                          value={otpCode}
                          onChangeText={setOtpCode}
                          keyboardType="number-pad"
                          textContentType="oneTimeCode"
                          className="w-full text-[#0f172a]"
                          style={loginFieldTextStyle()}
                        />
                      </FieldShell>
                    </View>
                    <View className="gap-1.5">
                      <Text
                        style={{
                          fontFamily: 'Pretendard-Medium',
                          fontSize: 13,
                          letterSpacing: -0.2,
                          color: '#64748b',
                        }}>
                        {s.login.labelPhone}
                      </Text>
                      <FieldShell icon={Phone}>
                        <TextInput
                          placeholder={s.login.placeholderPhone}
                          placeholderTextColor="rgba(15, 23, 42, 0.38)"
                          value={phone}
                          onChangeText={setPhone}
                          keyboardType="phone-pad"
                          textContentType="telephoneNumber"
                          className="w-full text-[#0f172a]"
                          style={loginFieldTextStyle()}
                        />
                      </FieldShell>
                    </View>
                    <View className="gap-1.5">
                      <Text
                        style={{
                          fontFamily: 'Pretendard-Medium',
                          fontSize: 13,
                          letterSpacing: -0.2,
                          color: '#64748b',
                        }}>
                        {s.login.labelName}
                      </Text>
                      <FieldShell icon={UserCircle}>
                        <TextInput
                          placeholder={s.login.placeholderName}
                          placeholderTextColor="rgba(15, 23, 42, 0.38)"
                          value={userName}
                          onChangeText={setUserName}
                          textContentType="name"
                          className="w-full text-[#0f172a]"
                          style={loginFieldTextStyle()}
                        />
                      </FieldShell>
                    </View>
                  </>
                )}

                {loginError ? (
                  <View className="mt-1 rounded-xl bg-red-50 px-3 py-2.5">
                    <Text
                      style={{
                        fontFamily: 'Pretendard-Medium',
                        fontSize: 13,
                        lineHeight: 18,
                        letterSpacing: -0.25,
                        color: '#b91c1c',
                        textAlign: 'center',
                      }}>
                      {loginError}
                    </Text>
                  </View>
                ) : null}

                <Pressable
                  onPress={handleLogin}
                  accessibilityRole="button"
                  accessibilityLabel={s.login.button}
                  className="mt-2 overflow-hidden rounded-2xl active:opacity-92"
                  style={{
                    shadowColor: '#3e63dd',
                    shadowOffset: { width: 0, height: 8 },
                    shadowOpacity: 0.35,
                    shadowRadius: 16,
                    elevation: 8,
                  }}>
                  <LinearGradient
                    colors={['#4f6ef2', '#3e63dd', '#2f4fc9']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{ paddingVertical: 16, alignItems: 'center', justifyContent: 'center' }}>
                    <Text
                      style={{
                        fontFamily: 'Pretendard-SemiBold',
                        fontSize: 17,
                        letterSpacing: -0.4,
                        color: '#ffffff',
                      }}>
                      {s.login.button}
                    </Text>
                  </LinearGradient>
                </Pressable>

                <View className="flex-row flex-wrap items-center justify-center gap-x-2 py-2 pb-5">
                  {tab === 'id' ? (
                    <>
                      <Pressable
                        onPress={() => void WebBrowser.openBrowserAsync(LOGIN_URL_REGISTER)}
                        hitSlop={8}
                        accessibilityRole="link"
                        accessibilityLabel={s.login.register}>
                        <Text style={footerLinkTextStyle}>{s.login.register}</Text>
                      </Pressable>
                      <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, color: '#cbd5e1' }}>·</Text>
                    </>
                  ) : null}
                  <Pressable
                    onPress={() => void WebBrowser.openBrowserAsync(LOGIN_URL_CONTACT)}
                    hitSlop={8}
                    accessibilityRole="link"
                    accessibilityLabel={s.login.contact}>
                    <Text style={footerLinkTextStyle}>{s.login.contact}</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          <View className="min-h-[16px] flex-1" />

          <View
            className="items-center gap-2 pb-6"
            style={{ paddingHorizontal: pagePaddingX, paddingBottom: Math.max(insets.bottom, 20) + 8 }}>
            <SafeticsSymbol size={40} color="#096DD9" />
            <Text
              className="font-bold tracking-tight text-[#94a3b8]"
              style={{ fontFamily: 'Pretendard-Bold', fontSize: 20, letterSpacing: -0.4 }}>
              safetics
            </Text>
            <Text
              style={{
                fontFamily: 'Pretendard-Medium',
                fontSize: 12,
                letterSpacing: 0.2,
                color: '#94a3b8',
                textTransform: 'uppercase',
              }}>
              Tool Box Meeting
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
