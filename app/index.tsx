import { SafeticsSymbol } from '@/components/SafeticsSymbol';
import { Redirect, Stack } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAuth } from '@/contexts/AuthContext';
import { useLang } from '@/contexts/LangContext';

/** LGN-01 — Figma node 78:272209 (TBM 화면설계) */
type LoginTab = 'id' | 'otp';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { s } = useLang();
  const { isLoggedIn, login } = useAuth();
  const [tab, setTab] = useState<LoginTab>('id');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [phone, setPhone] = useState('');
  const [userName, setUserName] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);

  const headerMinH = 320;

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

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <KeyboardAvoidingView
        className="flex-1 bg-[#fbfdff]"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          className="flex-1 bg-[#fbfdff]"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}>
          {/* Header — accent alpha / hero */}
          <View
            className="overflow-hidden px-4 pb-8"
            style={{
              backgroundColor: 'rgba(0, 46, 201, 0.88)',
              paddingTop: insets.top + 38,
              minHeight: headerMinH + insets.top,
            }}>
            <View
              className="pointer-events-none absolute -left-6 opacity-25"
              style={{ top: 127, width: 155, height: 158 }}>
              <View className="h-full w-full rounded-full border-2 border-white/40" />
              <View className="absolute right-0 top-8 h-24 w-24 rounded-full border border-white/30" />
            </View>

            <View className="max-w-[343px] gap-4">
              <Text
                className="font-bold text-white"
                style={{ fontSize: 60, lineHeight: 60, letterSpacing: -1.5 }}
                allowFontScaling={false}>
                {s.login.title}
              </Text>
              <Text
                className="text-white"
                style={{ fontSize: 18, lineHeight: 28.8, letterSpacing: -0.45 }}>
                {s.login.subtitle}
              </Text>
            </View>
          </View>

          {/* Tabs + card — 탭~카드 간 10px (Figma 78:272209), 상단 여백 16px */}
          <View className="px-4 pt-4">
            <View className="w-full max-w-[343px] self-center" style={{ gap: 10 }}>
            <View className="w-full max-w-[343px] flex-row items-start justify-center gap-2.5 self-center">
              <Pressable
                onPress={() => {
                  setTab('id');
                  setLoginError(null);
                }}
                className="relative h-10 flex-1 items-center justify-center px-1"
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === 'id' }}>
                {tab === 'id' ? (
                  <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3358d4]" />
                ) : null}
                <Text
                  className="text-center text-sm leading-snug"
                  style={{
                    fontWeight: tab === 'id' ? '500' : '400',
                    color: tab === 'id' ? '#1c2024' : 'rgba(0, 7, 20, 0.62)',
                    letterSpacing: -0.35,
                  }}>
                  {s.login.tabId}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setTab('otp');
                  setLoginError(null);
                }}
                className="relative h-10 flex-1 items-center justify-center px-1"
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === 'otp' }}>
                {tab === 'otp' ? (
                  <View className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3358d4]" />
                ) : null}
                <Text
                  className="text-center text-sm leading-snug"
                  style={{
                    fontWeight: tab === 'otp' ? '500' : '400',
                    color: tab === 'otp' ? '#1c2024' : 'rgba(0, 7, 20, 0.62)',
                    letterSpacing: -0.35,
                  }}>
                  {s.login.tabOtp}
                </Text>
              </Pressable>
            </View>

            <View
              className="w-full max-w-[343px] self-center rounded-lg border border-[rgba(0,0,47,0.15)] bg-white p-3"
              style={{
                gap: 16,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 0.04,
                shadowRadius: 1,
                elevation: 1,
              }}>
              {tab === 'id' ? (
                <>
                  <View className="gap-2">
                    <Text
                      className="w-full font-medium text-[#1c2024]"
                      style={{ fontSize: 16, lineHeight: 25.6, letterSpacing: -0.4 }}>
                      {s.login.labelId}
                    </Text>
                    <View className="h-10 rounded-md border border-[rgba(0,9,50,0.12)] bg-white/90 px-2">
                      <TextInput
                        className="h-full flex-1 px-2 text-base text-[#1c2024]"
                        style={{ lineHeight: 22, letterSpacing: -0.4 }}
                        placeholder={s.login.placeholderIdLogin}
                        placeholderTextColor="rgba(0, 5, 29, 0.45)"
                        value={userId}
                        onChangeText={(t) => {
                          setUserId(t);
                          setLoginError(null);
                        }}
                        autoCapitalize="none"
                        autoCorrect={false}
                        textContentType="username"
                      />
                    </View>
                  </View>
                  <View className="gap-2">
                    <Text
                      className="w-full font-medium text-[#1c2024]"
                      style={{ fontSize: 16, lineHeight: 25.6, letterSpacing: -0.4 }}>
                      {s.login.labelPassword}
                    </Text>
                    <View className="h-10 rounded-md border border-[rgba(0,9,50,0.12)] bg-white/90 px-2">
                      <TextInput
                        className="h-full flex-1 px-2 text-base text-[#1c2024]"
                        style={{ lineHeight: 22, letterSpacing: -0.4 }}
                        placeholder={s.login.placeholderPassword}
                        placeholderTextColor="rgba(0, 5, 29, 0.45)"
                        value={password}
                        onChangeText={(t) => {
                          setPassword(t);
                          setLoginError(null);
                        }}
                        secureTextEntry
                        textContentType="password"
                        autoCapitalize="none"
                      />
                    </View>
                  </View>
                </>
              ) : (
                <>
                  <View className="gap-2">
                    <Text
                      className="w-full font-medium text-[#1c2024]"
                      style={{ fontSize: 16, lineHeight: 25.6, letterSpacing: -0.4 }}>
                      {s.login.labelOtp}
                    </Text>
                    <View className="h-10 rounded-md border border-[rgba(0,9,50,0.12)] bg-white/90 px-2">
                      <TextInput
                        className="h-full flex-1 px-2 text-base text-[#1c2024]"
                        style={{ lineHeight: 22, letterSpacing: -0.4 }}
                        placeholder={s.login.placeholderOtp}
                        placeholderTextColor="rgba(0, 5, 29, 0.45)"
                        value={otpCode}
                        onChangeText={setOtpCode}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                      />
                    </View>
                  </View>
                  <View className="gap-2">
                    <Text
                      className="w-full font-medium text-[#1c2024]"
                      style={{ fontSize: 16, lineHeight: 25.6, letterSpacing: -0.4 }}>
                      {s.login.labelPhone}
                    </Text>
                    <View className="h-10 rounded-md border border-[rgba(0,9,50,0.12)] bg-white/90 px-2">
                      <TextInput
                        className="h-full flex-1 px-2 text-base text-[#1c2024]"
                        style={{ lineHeight: 22, letterSpacing: -0.4 }}
                        placeholder={s.login.placeholderPhone}
                        placeholderTextColor="rgba(0, 5, 29, 0.45)"
                        value={phone}
                        onChangeText={setPhone}
                        keyboardType="phone-pad"
                        textContentType="telephoneNumber"
                      />
                    </View>
                  </View>
                  <View className="gap-2">
                    <Text
                      className="w-full font-medium text-[#1c2024]"
                      style={{ fontSize: 16, lineHeight: 25.6, letterSpacing: -0.4 }}>
                      {s.login.labelName}
                    </Text>
                    <View className="h-10 rounded-md border border-[rgba(0,9,50,0.12)] bg-white/90 px-2">
                      <TextInput
                        className="h-full flex-1 px-2 text-base text-[#1c2024]"
                        style={{ lineHeight: 22, letterSpacing: -0.4 }}
                        placeholder={s.login.placeholderName}
                        placeholderTextColor="rgba(0, 5, 29, 0.45)"
                        value={userName}
                        onChangeText={setUserName}
                        textContentType="name"
                      />
                    </View>
                  </View>
                </>
              )}

              {loginError ? (
                <Text
                  style={{
                    fontFamily: 'Pretendard-Regular',
                    fontSize: 13,
                    lineHeight: 18,
                    letterSpacing: -0.25,
                    color: '#dc2626',
                    textAlign: 'center',
                  }}>
                  {loginError}
                </Text>
              ) : null}

              <Pressable
                onPress={handleLogin}
                className="h-12 w-full flex-row items-center justify-center gap-3 rounded-lg bg-[#3e63dd] px-6 active:opacity-90"
                accessibilityRole="button"
                accessibilityLabel={s.login.button}>
                <Text
                  className="font-medium text-white"
                  style={{ fontSize: 18, lineHeight: 28.8, letterSpacing: -0.45 }}>
                  {s.login.button}
                </Text>
                <ChevronRight color="#ffffff" size={20} strokeWidth={2} />
              </Pressable>

              <Pressable className="items-center py-0.5" hitSlop={8}>
                <Text
                  className="text-center font-medium"
                  style={{
                    fontSize: 14,
                    lineHeight: 22.4,
                    letterSpacing: -0.35,
                    color: 'rgba(0, 7, 20, 0.62)',
                  }}>
                  {s.login.contact}
                </Text>
              </Pressable>
            </View>
            </View>
          </View>

          <View className="min-h-[24px] flex-1" />

          {/* Footer — 심볼 + 워드마크 (피그마 LGN-01 푸터 대응) */}
          <View
            className="items-center gap-2 px-4 pb-8 pt-8"
            style={{ paddingBottom: Math.max(insets.bottom, 24) + 10 }}>
            <SafeticsSymbol size={44} color="#096DD9" />
            <Text
              className="font-bold tracking-tight text-[#64748b]"
              style={{ fontSize: 22, letterSpacing: -0.5 }}>
              safetics
            </Text>
            <Text
              className="font-bold text-[#1c2024]"
              style={{ fontSize: 18, lineHeight: 28.8, letterSpacing: -0.45, opacity: 0.2 }}>
              Tool Box Meeting
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  );
}
