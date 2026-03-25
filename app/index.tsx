import { SafeticsSymbol } from '@/components/SafeticsSymbol';
import { Href, Link, Stack } from 'expo-router';
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

/** LGN-01 — Figma node 78:272209 (TBM 화면설계) */
type LoginTab = 'id' | 'otp';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<LoginTab>('otp');
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [phone, setPhone] = useState('');
  const [userName, setUserName] = useState('');

  const headerMinH = 320;

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
                Log in
              </Text>
              <Text
                className="text-white"
                style={{ fontSize: 18, lineHeight: 28.8, letterSpacing: -0.45 }}>
                안전한 현장 관리를 위해 로그인해 주세요.
              </Text>
            </View>
          </View>

          {/* Tabs + card — 탭~카드 간 10px (Figma 78:272209), 상단 여백 16px */}
          <View className="px-4 pt-4">
            <View className="w-full max-w-[343px] self-center" style={{ gap: 10 }}>
            <View className="w-full max-w-[343px] flex-row items-start justify-center gap-2.5 self-center">
              <Pressable
                onPress={() => setTab('id')}
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
                  아이디 로그인
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setTab('otp')}
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
                  인증번호 로그인
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
                      아이디
                    </Text>
                    <View className="h-10 rounded-md border border-[rgba(0,9,50,0.12)] bg-white/90 px-2">
                      <TextInput
                        className="h-full flex-1 px-2 text-base text-[#1c2024]"
                        style={{ lineHeight: 22, letterSpacing: -0.4 }}
                        placeholder="아이디를 입력하세요."
                        placeholderTextColor="rgba(0, 5, 29, 0.45)"
                        value={userId}
                        onChangeText={setUserId}
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
                      비밀번호
                    </Text>
                    <View className="h-10 rounded-md border border-[rgba(0,9,50,0.12)] bg-white/90 px-2">
                      <TextInput
                        className="h-full flex-1 px-2 text-base text-[#1c2024]"
                        style={{ lineHeight: 22, letterSpacing: -0.4 }}
                        placeholder="비밀번호를 입력하세요."
                        placeholderTextColor="rgba(0, 5, 29, 0.45)"
                        value={password}
                        onChangeText={setPassword}
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
                      인증번호
                    </Text>
                    <View className="h-10 rounded-md border border-[rgba(0,9,50,0.12)] bg-white/90 px-2">
                      <TextInput
                        className="h-full flex-1 px-2 text-base text-[#1c2024]"
                        style={{ lineHeight: 22, letterSpacing: -0.4 }}
                        placeholder="인증번호를 입력해주세요."
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
                      휴대폰 번호
                    </Text>
                    <View className="h-10 rounded-md border border-[rgba(0,9,50,0.12)] bg-white/90 px-2">
                      <TextInput
                        className="h-full flex-1 px-2 text-base text-[#1c2024]"
                        style={{ lineHeight: 22, letterSpacing: -0.4 }}
                        placeholder="01012345678 형식으로 입력해주세요."
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
                      이름
                    </Text>
                    <View className="h-10 rounded-md border border-[rgba(0,9,50,0.12)] bg-white/90 px-2">
                      <TextInput
                        className="h-full flex-1 px-2 text-base text-[#1c2024]"
                        style={{ lineHeight: 22, letterSpacing: -0.4 }}
                        placeholder="이름을 입력해주세요."
                        placeholderTextColor="rgba(0, 5, 29, 0.45)"
                        value={userName}
                        onChangeText={setUserName}
                        textContentType="name"
                      />
                    </View>
                  </View>
                </>
              )}

              <Link href={'/(main)' as Href} replace asChild>
                <Pressable
                  className="h-12 w-full flex-row items-center justify-center gap-3 rounded-lg bg-[#3e63dd] px-6 active:opacity-90"
                  accessibilityRole="button"
                  accessibilityLabel="로그인">
                  <Text
                    className="font-medium text-white"
                    style={{ fontSize: 18, lineHeight: 28.8, letterSpacing: -0.45 }}>
                    로그인
                  </Text>
                  <ChevronRight color="#ffffff" size={20} strokeWidth={2} />
                </Pressable>
              </Link>

              <Pressable className="items-center py-0.5" hitSlop={8}>
                <Text
                  className="text-center font-medium"
                  style={{
                    fontSize: 14,
                    lineHeight: 22.4,
                    letterSpacing: -0.35,
                    color: 'rgba(0, 7, 20, 0.62)',
                  }}>
                  문의하기
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
