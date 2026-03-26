import '../global.css';

import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { AuthProvider } from '@/contexts/AuthContext';
import { LangProvider } from '@/contexts/LangContext';
import { SuggestionProvider } from '@/contexts/SuggestionContext';
import { WeatherProvider } from '@/contexts/WeatherContext';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: 'index',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Pretendard-Regular': require('../assets/fonts/Pretendard-Regular.otf'),
    'Pretendard-Medium': require('../assets/fonts/Pretendard-Medium.otf'),
    'Pretendard-SemiBold': require('../assets/fonts/Pretendard-SemiBold.otf'),
    'Pretendard-Bold': require('../assets/fonts/Pretendard-Bold.otf'),
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  const pretendardHeader = { fontFamily: 'Pretendard-SemiBold' as const };

  return (
    <LangProvider>
    <WeatherProvider>
    <AuthProvider>
    <SuggestionProvider>
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <View className="flex-1 font-sans" style={{ flex: 1 }}>
        <Stack
          screenOptions={{
            headerTitleStyle: pretendardHeader,
            headerBackTitleStyle: { fontFamily: 'Pretendard-Regular' },
            animation: 'slide_from_right',
            gestureEnabled: true,
            gestureDirection: 'horizontal',
            fullScreenGestureEnabled: true,
          }}>
          <Stack.Screen name="index" options={{ headerShown: false, animation: 'fade' }} />
          <Stack.Screen name="(main)" options={{ headerShown: false }} />
          <Stack.Screen name="tbm/[id]" options={{ headerShown: false }} />
          <Stack.Screen
            name="tbm/session/[id]"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="tbm/checklist/[id]"
            options={{ headerShown: false }}
          />
        </Stack>
      </View>
    </ThemeProvider>
    </SuggestionProvider>
    </AuthProvider>
    </WeatherProvider>
    </LangProvider>
  );
}
