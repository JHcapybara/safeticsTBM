import { useFocusEffect } from '@react-navigation/native';
import { router } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { ArrowLeft, Menu } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CenteredColumn } from '@/components/CenteredColumn';
import { scrollViewAndroidProps } from '@/constants/scrollViewAndroid';
import { useDrawer } from '@/contexts/DrawerContext';
import { useLang } from '@/contexts/LangContext';
import { useSuggestions } from '@/contexts/SuggestionContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

const HEADER_BG = 'rgba(0, 46, 201, 0.88)';

export default function SuggestionNewScreen() {
  const { s } = useLang();
  const { openDrawer } = useDrawer();
  const { addSuggestion } = useSuggestions();
  const { pagePaddingX, contentColumnMaxWidth, headerTitleFontSize } = useResponsiveLayout();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  const canSubmit = useMemo(() => title.trim().length >= 4 && content.trim().length >= 8, [title, content]);

  const onBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/suggestions');
  };

  const onSubmit = () => {
    if (!canSubmit) return;
    addSuggestion({ title, preview: content });
    router.replace({ pathname: '/suggestions', params: { created: '1' } });
  };

  return (
    <View className="flex-1 bg-[#fbfdff]">
      <View style={{ backgroundColor: HEADER_BG }}>
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center gap-2 pb-2 pt-2" style={{ paddingHorizontal: pagePaddingX }}>
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel={s.common.goBack}
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
              {s.suggestions.newPost}
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
        showsVerticalScrollIndicator={false}>
        <CenteredColumn maxWidth={contentColumnMaxWidth}>
        <View
          className="rounded-2xl border border-[rgba(0,0,47,0.08)] bg-white p-4"
          style={{
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.05,
            shadowRadius: 14,
            elevation: 3,
            gap: 14,
          }}>
          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, lineHeight: 18, color: '#1e293b' }}>
              {s.suggestions.newTitleLabel}
            </Text>
            <TextInput
              value={title}
              onChangeText={setTitle}
              placeholder={s.suggestions.newTitlePlaceholder}
              placeholderTextColor="#94a3b8"
              className="h-12 rounded-xl border border-[rgba(0,0,47,0.12)] bg-white px-3 text-[14px] text-[#1f2937]"
              style={{ fontFamily: 'Pretendard-Regular' }}
              maxLength={80}
            />
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, lineHeight: 18, color: '#1e293b' }}>
              {s.suggestions.newContentLabel}
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              placeholder={s.suggestions.newContentPlaceholder}
              placeholderTextColor="#94a3b8"
              multiline
              className="min-h-[160px] rounded-xl border border-[rgba(0,0,47,0.12)] bg-white px-3 py-3 text-[14px] text-[#1f2937]"
              style={{ fontFamily: 'Pretendard-Regular', textAlignVertical: 'top' }}
              maxLength={1000}
            />
          </View>

          <View className="flex-row items-center justify-between">
            <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, lineHeight: 14, color: '#94a3b8' }}>
              {content.length}/1000
            </Text>
            <Pressable
              onPress={onSubmit}
              disabled={!canSubmit}
              className="h-11 min-w-[110px] items-center justify-center rounded-xl bg-[#3e63dd] px-4 active:opacity-90"
              style={{ opacity: canSubmit ? 1 : 0.45 }}>
              <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, lineHeight: 17, color: '#fff' }}>
                {s.suggestions.newSubmit}
              </Text>
            </Pressable>
          </View>
        </View>
        </CenteredColumn>
      </ScrollView>
    </View>
  );
}
