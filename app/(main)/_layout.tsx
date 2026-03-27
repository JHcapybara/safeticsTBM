import { Stack, useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { View } from 'react-native';

import { MainDrawer } from '@/components/MainDrawer';
import { useAuth } from '@/contexts/AuthContext';
import { DrawerProvider } from '@/contexts/DrawerContext';

const headerTitle = { fontFamily: 'Pretendard-SemiBold' as const };
const headerBack = { fontFamily: 'Pretendard-Regular' as const };

export default function MainLayout() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const redirecting = useRef(false);

  useEffect(() => {
    if (!isLoggedIn && !redirecting.current) {
      redirecting.current = true;
      // Redirect 컴포넌트로 교체하면 Stack/Modal이 마운트된 채 Navigator가 사라져
      // Render Error가 발생하므로 명령형 replace를 사용
      router.replace('/');
    }
    if (isLoggedIn) {
      redirecting.current = false;
    }
  }, [isLoggedIn, router]);

  // 리다이렉트 중에도 Stack 트리를 유지해 Navigator가 사라지지 않게 함
  if (!isLoggedIn) {
    return <View style={{ flex: 1 }} />;
  }

  return (
    <DrawerProvider>
      <Stack
        screenOptions={{
          contentStyle: { flex: 1 },
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
