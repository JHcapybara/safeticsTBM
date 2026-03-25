import { Stack } from 'expo-router';

import { MainDrawer } from '@/components/MainDrawer';
import { DrawerProvider } from '@/contexts/DrawerContext';

const headerTitle = { fontFamily: 'Pretendard-SemiBold' as const };
const headerBack = { fontFamily: 'Pretendard-Regular' as const };

export default function MainLayout() {
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
        <Stack.Screen name="profile" options={{ title: '내 정보', headerShown: true }} />
        <Stack.Screen name="suggestions" options={{ title: '건의사항', headerShown: true }} />
      </Stack>
      <MainDrawer />
    </DrawerProvider>
  );
}
