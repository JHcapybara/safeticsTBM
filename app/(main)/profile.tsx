import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { ArrowLeft, Menu } from 'lucide-react-native';
import { useCallback } from 'react';
import { Pressable, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CenteredColumn } from '@/components/CenteredColumn';
import { scrollViewAndroidProps } from '@/constants/scrollViewAndroid';
import { useDrawer } from '@/contexts/DrawerContext';
import { useLang } from '@/contexts/LangContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';
import { useNotificationPrefs } from '@/hooks/useNotificationPrefs';

const HEADER_BG = 'rgba(0, 46, 201, 0.8)';
const ACCENT = '#3e63dd';

function SettingRow({
  title,
  description,
  value,
  onValueChange,
}: {
  title: string;
  description: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-start justify-between gap-2 rounded-[4px] bg-[#f9f9f9] p-2">
      <View className="min-w-0 flex-1 flex-col gap-1">
        <Text
          className="text-[18px] text-[#1c2024]"
          style={{ fontFamily: 'Pretendard-Regular', lineHeight: 28.8, letterSpacing: -0.45 }}>
          {title}
        </Text>
        <Text
          className="text-[14px] text-[#80838d]"
          style={{ fontFamily: 'Pretendard-Regular', lineHeight: 22.4, letterSpacing: -0.35 }}>
          {description}
        </Text>
      </View>
      <View className="min-h-[29px] justify-center pt-0.5">
        <Switch
          value={value}
          onValueChange={onValueChange}
          trackColor={{ false: 'rgba(0,0,51,0.06)', true: ACCENT }}
          thumbColor="#ffffff"
          ios_backgroundColor="rgba(0,0,51,0.06)"
        />
      </View>
    </View>
  );
}

export default function ProfileScreen() {
  const { s } = useLang();
  const { openDrawer } = useDrawer();
  const { pushApp, pushTbm, setPushApp, setPushTbm } = useNotificationPrefs();
  const { pagePaddingX, contentColumnMaxWidth, headerTitleFontSize } = useResponsiveLayout();

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  const onBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(main)');
  };

  return (
    <View className="flex-1 bg-[#fbfdff]">
      <View style={{ backgroundColor: HEADER_BG }}>
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center gap-2 pb-2 pt-2" style={{ paddingHorizontal: pagePaddingX }}>
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel={s.settings.backA11y}
              className="h-10 w-10 items-center justify-center rounded-md bg-[#3e63dd] active:opacity-90">
              <ArrowLeft color="#fff" size={18} strokeWidth={2} />
            </Pressable>
            <Text
              className="flex-1 text-center font-bold text-white"
              style={{
                fontFamily: 'Pretendard-Bold',
                fontSize: headerTitleFontSize,
                lineHeight: headerTitleFontSize + 12,
                letterSpacing: -0.5,
              }}>
              {s.settings.headerTitle}
            </Text>
            <Pressable
              onPress={openDrawer}
              accessibilityRole="button"
              accessibilityLabel={s.settings.menuA11y}
              className="h-10 w-10 items-center justify-center rounded-md bg-[#3e63dd] active:opacity-90">
              <Menu color="#fff" size={18} strokeWidth={2} />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        {...scrollViewAndroidProps}
        className="flex-1"
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: pagePaddingX, paddingTop: 16, paddingBottom: 32 }}
        contentContainerClassName="gap-2"
        showsVerticalScrollIndicator={false}>
        <CenteredColumn maxWidth={contentColumnMaxWidth}>
          <SettingRow
            title={s.settings.pushAppTitle}
            description={s.settings.pushAppDesc}
            value={pushApp}
            onValueChange={setPushApp}
          />
          <SettingRow
            title={s.settings.pushTbmTitle}
            description={s.settings.pushTbmDesc}
            value={pushTbm}
            onValueChange={setPushTbm}
          />
        </CenteredColumn>
      </ScrollView>
    </View>
  );
}
