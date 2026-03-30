import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { AlertTriangle, ArrowLeft, ImagePlus, Menu, X } from 'lucide-react-native';
import { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CenteredColumn } from '@/components/CenteredColumn';
import { scrollViewAndroidProps } from '@/constants/scrollViewAndroid';
import { useDrawer } from '@/contexts/DrawerContext';
import { useLang } from '@/contexts/LangContext';
import { useSuggestions } from '@/contexts/SuggestionContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

const HEADER_BG = 'rgba(0, 46, 201, 0.88)';
const HAZARD_HEADER_BG = 'rgba(180, 83, 9, 0.92)';
const MAX_IMAGES = 3;

export default function SuggestionNewScreen() {
  const { s } = useLang();
  const { openDrawer } = useDrawer();
  const { addSuggestion } = useSuggestions();
  const { pagePaddingX, contentColumnMaxWidth, headerTitleFontSize } = useResponsiveLayout();
  const { from } = useLocalSearchParams<{ from?: string }>();

  const isHazard = from === 'hazard';

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  const canSubmit = useMemo(() => title.trim().length >= 4 && content.trim().length >= 8, [title, content]);

  const onBack = () => {
    if (isHazard) {
      router.replace('/(main)');
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/suggestions');
    }
  };

  const onSubmit = () => {
    if (!canSubmit) return;
    addSuggestion({ title, preview: content });
    router.replace({ pathname: '/suggestions', params: { created: '1' } });
  };

  const pickImage = async () => {
    if (images.length >= MAX_IMAGES) return;

    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          s.suggestions.newImagePermissionTitle,
          s.suggestions.newImagePermissionMessage,
          [{ text: s.suggestions.newImagePermissionOk }],
        );
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      setImages((prev) => [...prev, result.assets[0].uri]);
    }
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const headerBg = isHazard ? HAZARD_HEADER_BG : HEADER_BG;
  const headerTitle = isHazard ? s.emergency.hazard.title : s.suggestions.newPost;

  return (
    <View className="flex-1 bg-[#fbfdff]">
      <View style={{ backgroundColor: headerBg }}>
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center gap-2 pb-2 pt-2" style={{ paddingHorizontal: pagePaddingX }}>
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel={s.common.goBack}
              className="h-10 w-10 items-center justify-center rounded-md active:opacity-90"
              style={{ backgroundColor: isHazard ? 'rgba(255,255,255,0.18)' : '#3e63dd' }}>
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
              {headerTitle}
            </Text>
            <Pressable
              onPress={openDrawer}
              accessibilityRole="button"
              accessibilityLabel={s.settings.menuA11y}
              className="h-10 w-10 items-center justify-center rounded-md active:opacity-90"
              style={{ backgroundColor: isHazard ? 'rgba(255,255,255,0.18)' : '#3e63dd' }}>
              <Menu color="#fff" size={18} strokeWidth={2} />
            </Pressable>
          </View>
        </SafeAreaView>
      </View>

      {/* 위험원 보고 모드 안내 배너 */}
      {isHazard ? (
        <View
          className="flex-row items-center gap-2.5 px-4 py-3"
          style={{ backgroundColor: 'rgba(254, 243, 199, 0.95)', borderBottomWidth: 1, borderBottomColor: 'rgba(251,191,36,0.3)' }}>
          <AlertTriangle color="#d97706" size={16} strokeWidth={2.2} />
          <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 13, color: '#92400e', letterSpacing: -0.2, flex: 1 }}>
            {s.emergency.hazard.desc.replace('\n', ' ')}
          </Text>
        </View>
      ) : null}

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

            {/* 제목 */}
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

            {/* 내용 */}
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

            {/* 사진 첨부 */}
            <View style={{ gap: 8 }}>
              <View className="flex-row items-center justify-between">
                <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, lineHeight: 18, color: '#1e293b' }}>
                  {s.suggestions.newImageLabel}
                </Text>
                <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, color: '#94a3b8' }}>
                  {images.length}/{MAX_IMAGES}
                </Text>
              </View>

              <View className="flex-row flex-wrap gap-2">
                {images.map((uri, idx) => (
                  <View
                    key={uri + idx}
                    className="overflow-hidden rounded-xl border border-[rgba(0,0,47,0.1)]"
                    style={{ width: 96, height: 96 }}>
                    <Image source={{ uri }} style={{ width: 96, height: 96 }} resizeMode="cover" />
                    <Pressable
                      onPress={() => removeImage(idx)}
                      accessibilityRole="button"
                      accessibilityLabel="사진 삭제"
                      className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full active:opacity-80"
                      style={{ backgroundColor: 'rgba(15,23,42,0.65)' }}>
                      <X color="#fff" size={12} strokeWidth={2.5} />
                    </Pressable>
                  </View>
                ))}

                {images.length < MAX_IMAGES ? (
                  <Pressable
                    onPress={() => void pickImage()}
                    accessibilityRole="button"
                    accessibilityLabel={s.suggestions.newImageAdd}
                    className="items-center justify-center rounded-xl border border-dashed border-[rgba(0,0,47,0.2)] active:opacity-70"
                    style={{ width: 96, height: 96, gap: 6, backgroundColor: 'rgba(62,99,221,0.03)' }}>
                    <ImagePlus color="#3e63dd" size={22} strokeWidth={1.8} />
                    <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 11, color: '#3e63dd', letterSpacing: -0.1 }}>
                      {s.suggestions.newImageAdd}
                    </Text>
                  </Pressable>
                ) : null}
              </View>

              {images.length === 0 ? (
                <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, color: '#94a3b8', letterSpacing: -0.15 }}>
                  {s.suggestions.newImageMax}
                </Text>
              ) : null}
            </View>

            {/* 하단: 글자수 + 등록 버튼 */}
            <View className="flex-row items-center justify-between">
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, lineHeight: 14, color: '#94a3b8' }}>
                {content.length}/1000
              </Text>
              <Pressable
                onPress={onSubmit}
                disabled={!canSubmit}
                className="h-11 min-w-[110px] items-center justify-center rounded-xl px-4 active:opacity-90"
                style={{
                  opacity: canSubmit ? 1 : 0.45,
                  backgroundColor: isHazard ? '#d97706' : '#3e63dd',
                }}>
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
