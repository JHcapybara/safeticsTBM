import { Redirect, Stack } from 'expo-router';

import { MainDrawer } from '@/components/MainDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { DrawerProvider } from '@/contexts/DrawerContext';

const headerTitle = { fontFamily: 'Pretendard-SemiBold' as const };
const headerBack = { fontFamily: 'Pretendard-Regular' as const };

export default function MainLayout() {
  const { isLoggedIn } = useAuth();

  // 레이아웃에서 null을 반환하면 Slot/Stack이 없어 Render Error가 날 수 있음 — Redirect 사용
  // TODO(인증): 로그아웃 시 흰 화면만 뜸 등 — 이 Redirect·Auth·스택 구조 전면 재검토 예정
  if (!isLoggedIn) {
    return <Redirect href="/" />;
  }

  return (
    <DrawerProvider>
      <Stack
        screenOptions={{
          headerTitleStyle: headerTitle,
          headerBackTitleStyle: headerBack,
          headerStyle: { backgroundColor: '#f8fafc' },
          headerTintColor: '#3e63dd',
          animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            fullScreenGestureEnabled: true,
        }}>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="tbm" options={{ headerShown: false }} />
        <Stack.Screen name="profile" options={{ headerShown: false }} />
        <Stack.Screen name="suggestions" options={{ headerShown: false }} />
        <Stack.Screen name="suggestions/new" options={{ headerShown: false }} />
        <Stack.Screen name="suggestions/[id]" options={{ headerShown: false }} />
      </Stack>
      <MainDrawer />
    </DrawerProvider>
  );
}
