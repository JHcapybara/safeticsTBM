import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import { ArrowLeft, ChevronDown, Hand, ImagePlus, X } from 'lucide-react-native';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { CenteredColumn } from '@/components/CenteredColumn';
import { scrollViewAndroidProps } from '@/constants/scrollViewAndroid';
import { useLang } from '@/contexts/LangContext';
import { useResponsiveLayout } from '@/hooks/useResponsiveLayout';

const HEADER_BG = 'rgba(51, 65, 85, 0.92)';
const CUSTOM_KEY = '__custom__';

const TITLE_RED = '#dc2626';
const TITLE_ORANGE = '#ea580c';
const TITLE_BLUE = '#2563eb';
const TITLE_BLACK = '#0a0a0a';
const DETAIL_GRAY = '#64748b';
const CUSTOM_PICKER_ITEM_COLOR = '#3e63dd';
const CUSTOM_PICKER_ITEM_COLOR_SELECTED = '#3e63dd';
const UI_FONT_MIN = 16;
const MAX_STOP_IMAGES = 3;
const DETAIL_MAX_LEN = 1000;

type StopReasonRow = {
  key: string;
  label: string;
  titleColor?: string;
};

type StopReasonOption = {
  key: string;
  titleColor: string;
};

const STOP_REASON_OPTIONS: readonly StopReasonOption[] = [
  { key: '추락 위험: 안전벨트 미착용, 안전난간 부실', titleColor: TITLE_RED },
  { key: '협착 위험: 장비와 구조물 사이 끼임 가능성', titleColor: TITLE_RED },
  { key: '낙하물: 고소에서 자재나 도구 낙하 가능성', titleColor: TITLE_RED },
  { key: '화재 폭발: 가연성 물질 근처 화기 작업', titleColor: TITLE_RED },
  { key: '감전 위험: 전선 손상, 누전 위험', titleColor: TITLE_RED },
  { key: '질식 위험: 밀폐공간 산소 부족', titleColor: TITLE_RED },
  { key: '컨디션 이상: 음주, 약물, 과로 상태', titleColor: TITLE_ORANGE },
  { key: '자격 미달: 무면허, 미숙련 작업자', titleColor: TITLE_ORANGE },
  { key: '안전수칙 위반: 개인보호구 미착용', titleColor: TITLE_ORANGE },
  { key: '의사소통 불가: 언어 장벽, 신호 무시', titleColor: TITLE_ORANGE },
  { key: '무리한 작업: 안전 절차 무시', titleColor: TITLE_ORANGE },
  { key: '집중력 저하: 부주의, 딴생각', titleColor: TITLE_ORANGE },
  { key: '장비 고장: 브레이크, 조향 장치 이상', titleColor: TITLE_BLUE },
  { key: '안전장치 불량: 경보장치, 안전밸브', titleColor: TITLE_BLUE },
  { key: '구조물 결함: 균열, 변형, 부식', titleColor: TITLE_BLUE },
  { key: '전기 시설: 누전, 합선, 절연 불량', titleColor: TITLE_BLUE },
  { key: '가설 시설: 비계, 거푸집 불안정', titleColor: TITLE_BLUE },
  { key: '도구 손상: 날 부분 마모, 손잡이 파손', titleColor: TITLE_BLUE },
  { key: '악천후: 강풍, 폭우, 폭설, 태풍', titleColor: TITLE_BLACK },
  { key: '시야 불량: 안개, 먼지, 연기', titleColor: TITLE_BLACK },
  { key: '극한 온도: 혹서, 혹한 작업', titleColor: TITLE_BLACK },
  { key: '지반 불안: 지반 침하, 붕괴 위험', titleColor: TITLE_BLACK },
  { key: '화학적 위험: 독성 가스, 부식성 물질', titleColor: TITLE_BLACK },
  { key: '소음: 의사소통 불가능한 소음', titleColor: TITLE_BLACK },
];

const REASON_TITLE_COLOR_BY_KEY: ReadonlyMap<string, string> = new Map(
  STOP_REASON_OPTIONS.map((o) => [o.key, o.titleColor]),
);

function splitReasonKey(key: string): { title: string; detail: string } {
  const sep = ': ';
  const i = key.indexOf(sep);
  if (i === -1) return { title: key, detail: '' };
  return { title: key.slice(0, i), detail: key.slice(i + sep.length) };
}

export default function WorkStopScreen() {
  const { s } = useLang();
  const insets = useSafeAreaInsets();
  const { pagePaddingX, contentColumnMaxWidth, headerTitleFontSize } = useResponsiveLayout();

  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [customText, setCustomText] = useState('');
  const [detailText, setDetailText] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [showPicker, setShowPicker] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const backdropAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(400)).current;

  const openPicker = () => {
    setShowPicker(true);
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 1, duration: 240, useNativeDriver: true }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 320,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const closePicker = () => {
    Animated.parallel([
      Animated.timing(backdropAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(slideAnim, {
        toValue: 400,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(() => setShowPicker(false));
  };

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  const isCustom = selectedKey === CUSTOM_KEY;

  const displayReason = useMemo(() => {
    if (!selectedKey) return null;
    if (isCustom) return customText.trim() || null;
    return selectedKey;
  }, [selectedKey, isCustom, customText]);

  const canSubmit = displayReason !== null && displayReason.length > 0;

  const onBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(main)');
  };

  const onSubmit = () => {
    if (!canSubmit) return;
    setShowSuccess(true);
  };

  const onSuccessClose = () => {
    setShowSuccess(false);
    router.replace('/(main)');
  };

  const pickStopImage = async () => {
    if (images.length >= MAX_STOP_IMAGES) return;

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

  const removeStopImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const pickerOptions = useMemo<StopReasonRow[]>(
    () => [
      { key: CUSTOM_KEY, label: s.emergency.stop.customOption },
      ...STOP_REASON_OPTIONS.map((o) => ({
        key: o.key,
        label: o.key,
        titleColor: o.titleColor,
      })),
    ],
    [s.emergency.stop.customOption],
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={{ flex: 1, backgroundColor: '#fbfdff' }}>
        {/* 헤더 */}
        <View style={{ backgroundColor: HEADER_BG }}>
          <SafeAreaView edges={['top']}>
            <View
              className="flex-row items-center gap-2 pb-2 pt-2"
              style={{ paddingHorizontal: pagePaddingX }}>
              <Pressable
                onPress={onBack}
                accessibilityRole="button"
                accessibilityLabel={s.common.goBack}
                className="h-10 w-10 items-center justify-center rounded-md active:opacity-80"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                <ArrowLeft color="#fff" size={18} strokeWidth={2} />
              </Pressable>
              <Text
                className="flex-1 text-center text-white"
                style={{
                  fontFamily: 'Pretendard-Bold',
                  fontSize: headerTitleFontSize,
                  lineHeight: headerTitleFontSize + 12,
                  letterSpacing: -0.5,
                }}>
                {s.emergency.stop.screenTitle}
              </Text>
              <View style={{ width: 40 }} />
            </View>
          </SafeAreaView>
        </View>

        {/* 안내 배너 */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
            paddingHorizontal: pagePaddingX,
            paddingVertical: 12,
            backgroundColor: 'rgba(226,232,240,0.7)',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(148,163,184,0.25)',
          }}>
          <Hand color="#475569" size={16} strokeWidth={2.2} />
          <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: UI_FONT_MIN, color: '#334155', letterSpacing: -0.2, flex: 1 }}>
            {s.emergency.stop.desc.replace('\n', ' ')}
          </Text>
        </View>

        <ScrollView
          {...scrollViewAndroidProps}
          style={{ flex: 1 }}
          contentContainerStyle={{
            paddingHorizontal: pagePaddingX,
            paddingTop: 20,
            paddingBottom: Math.max(insets.bottom, 16) + 24,
          }}
          showsVerticalScrollIndicator={false}>
          <CenteredColumn maxWidth={contentColumnMaxWidth}>
            <View
              style={{
                backgroundColor: '#fff',
                borderRadius: 16,
                padding: 16,
                gap: 16,
                shadowColor: '#0f172a',
                shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.05,
                shadowRadius: 14,
                elevation: 3,
              }}>

              {/* 드롭다운 */}
              <View style={{ gap: 8 }}>
                <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: UI_FONT_MIN, color: '#1e293b' }}>
                  {s.emergency.stop.reasonLabel}
                  <Text style={{ color: '#e11d48' }}> *</Text>
                </Text>
                <Pressable
                  onPress={openPicker}
                  accessibilityRole="button"
                  style={{
                    minHeight: 56,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: selectedKey ? 'rgba(71,85,105,0.5)' : 'rgba(0,0,47,0.12)',
                    backgroundColor: selectedKey ? 'rgba(71,85,105,0.05)' : '#fff',
                  }}>
                  <View style={{ flex: 1, minWidth: 0, paddingRight: 6 }}>
                    {selectedKey ? (
                      isCustom ? (
                        <Text
                          numberOfLines={2}
                          style={{
                            fontFamily: 'Pretendard-Bold',
                            fontSize: UI_FONT_MIN,
                            color: '#1e293b',
                            letterSpacing: -0.2,
                          }}>
                          {s.emergency.stop.customOption}
                        </Text>
                      ) : (
                        <Text numberOfLines={2} style={{ letterSpacing: -0.2 }}>
                          <Text
                            style={{
                              fontFamily: 'Pretendard-Bold',
                              fontSize: UI_FONT_MIN,
                              color: REASON_TITLE_COLOR_BY_KEY.get(selectedKey) ?? TITLE_BLACK,
                            }}>
                            {splitReasonKey(selectedKey).title}
                          </Text>
                          {splitReasonKey(selectedKey).detail ? (
                            <Text
                              style={{
                                fontFamily: 'Pretendard-Regular',
                                fontSize: UI_FONT_MIN,
                                color: DETAIL_GRAY,
                              }}>{` (${splitReasonKey(selectedKey).detail})`}</Text>
                          ) : null}
                        </Text>
                      )
                    ) : (
                      <Text
                        style={{
                          fontFamily: 'Pretendard-Regular',
                          fontSize: UI_FONT_MIN,
                          color: '#94a3b8',
                          letterSpacing: -0.2,
                        }}>
                        {s.emergency.stop.reasonPlaceholder}
                      </Text>
                    )}
                  </View>
                  <ChevronDown color={selectedKey ? '#475569' : '#94a3b8'} size={18} strokeWidth={2} />
                </Pressable>
              </View>

              {/* 직접 입력 텍스트 인풋 */}
              {isCustom ? (
                <View style={{ gap: 8 }}>
                  <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: UI_FONT_MIN, color: '#1e293b' }}>
                    {s.emergency.stop.customOption}
                  </Text>
                  <TextInput
                    value={customText}
                    onChangeText={setCustomText}
                    placeholder={s.emergency.stop.customInputPlaceholder}
                    placeholderTextColor="#94a3b8"
                    multiline
                    maxLength={200}
                    style={{
                      minHeight: 100,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: 'rgba(0,0,47,0.12)',
                      backgroundColor: '#fff',
                      paddingHorizontal: 14,
                      paddingVertical: 12,
                      fontFamily: 'Pretendard-Regular',
                      fontSize: UI_FONT_MIN,
                      color: '#1f2937',
                      textAlignVertical: 'top',
                    }}
                  />
                  <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: UI_FONT_MIN, color: '#94a3b8', textAlign: 'right' }}>
                    {customText.length}/200
                  </Text>
                </View>
              ) : null}

              {/* 상세 내용 (선택) */}
              <View style={{ gap: 8 }}>
                <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: UI_FONT_MIN, color: '#1e293b' }}>
                  {s.emergency.stop.detailLabel}
                </Text>
                <TextInput
                  value={detailText}
                  onChangeText={setDetailText}
                  placeholder={s.emergency.stop.detailPlaceholder}
                  placeholderTextColor="#94a3b8"
                  multiline
                  maxLength={DETAIL_MAX_LEN}
                  style={{
                    minHeight: 120,
                    borderRadius: 12,
                    borderWidth: 1,
                    borderColor: 'rgba(0,0,47,0.12)',
                    backgroundColor: '#fff',
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    fontFamily: 'Pretendard-Regular',
                    fontSize: UI_FONT_MIN,
                    color: '#1f2937',
                    textAlignVertical: 'top',
                  }}
                />
                <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: UI_FONT_MIN, color: '#94a3b8', textAlign: 'right' }}>
                  {detailText.length}/{DETAIL_MAX_LEN}
                </Text>
              </View>

              {/* 사진 첨부 (선택) — 새 건의와 동일 UI */}
              <View style={{ gap: 8 }}>
                <View className="flex-row items-center justify-between">
                  <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: UI_FONT_MIN, lineHeight: 20, color: '#1e293b' }}>
                    {s.emergency.stop.imageSectionLabel}
                  </Text>
                  <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: UI_FONT_MIN, color: '#94a3b8' }}>
                    {images.length}/{MAX_STOP_IMAGES}
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
                        onPress={() => removeStopImage(idx)}
                        accessibilityRole="button"
                        accessibilityLabel={s.emergency.stop.removeImageA11y}
                        className="absolute right-1 top-1 h-6 w-6 items-center justify-center rounded-full active:opacity-80"
                        style={{ backgroundColor: 'rgba(15,23,42,0.65)' }}>
                        <X color="#fff" size={12} strokeWidth={2.5} />
                      </Pressable>
                    </View>
                  ))}

                  {images.length < MAX_STOP_IMAGES ? (
                    <Pressable
                      onPress={() => void pickStopImage()}
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
                  <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: UI_FONT_MIN, color: '#94a3b8', letterSpacing: -0.15 }}>
                    {s.suggestions.newImageMax}
                  </Text>
                ) : null}
              </View>

              {/* 전송 버튼 */}
              <Pressable
                onPress={onSubmit}
                disabled={!canSubmit}
                style={{
                  height: 52,
                  borderRadius: 14,
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: canSubmit ? '#334155' : '#cbd5e1',
                }}>
                <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 16, color: '#fff', letterSpacing: -0.3 }}>
                  {s.emergency.stop.submitButton}
                </Text>
              </Pressable>
            </View>
          </CenteredColumn>
        </ScrollView>

        {/* ─── 사유 선택 피커 모달 ─── */}
        <Modal
          visible={showPicker}
          transparent
          animationType="none"
          onRequestClose={closePicker}>
          <View style={StyleSheet.absoluteFill}>
            {/* 배경: 디졸브(fade) */}
            <Animated.View
              style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.45)', opacity: backdropAnim }]}
            />
            {/* 빈 영역 탭 → 닫기 */}
            <Pressable style={{ flex: 1 }} onPress={closePicker} />

            {/* 시트: 아래에서 슬라이드업 */}
            <Animated.View
              style={{
                transform: [{ translateY: slideAnim }],
                backgroundColor: '#fff',
                borderTopLeftRadius: 20,
                borderTopRightRadius: 20,
                maxHeight: '70%',
                paddingBottom: Math.max(insets.bottom, 16),
              }}>
              {/* 피커 헤더 */}
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingHorizontal: 20,
                  paddingTop: 16,
                  paddingBottom: 12,
                  borderBottomWidth: 1,
                  borderBottomColor: 'rgba(0,0,0,0.07)',
                }}>
                <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 16, color: '#0f172a', letterSpacing: -0.3 }}>
                  {s.emergency.stop.pickerTitle}
                </Text>
                <Pressable
                  onPress={closePicker}
                  hitSlop={10}
                  style={{
                    width: 32, height: 32,
                    alignItems: 'center', justifyContent: 'center',
                    borderRadius: 16,
                    backgroundColor: 'rgba(0,0,0,0.06)',
                  }}>
                  <X color="#475569" size={16} strokeWidth={2.5} />
                </Pressable>
              </View>

              <FlatList
                data={pickerOptions}
                keyExtractor={(item) => item.key}
                {...scrollViewAndroidProps}
                renderItem={({ item, index }) => {
                  const isSelected = selectedKey === item.key;
                  const isCustomItem = item.key === CUSTOM_KEY;
                  const isLast = index === pickerOptions.length - 1;
                  const titleColor = item.titleColor ?? TITLE_BLACK;
                  const { title, detail } = splitReasonKey(item.key);
                  return (
                    <Pressable
                      onPress={() => {
                        setSelectedKey(item.key);
                        if (item.key !== CUSTOM_KEY) setCustomText('');
                        closePicker();
                      }}
                      style={{
                        paddingHorizontal: 20,
                        paddingVertical: 14,
                        borderBottomWidth: isLast ? 0 : 1,
                        borderBottomColor: 'rgba(0,0,0,0.05)',
                        backgroundColor: isSelected ? 'rgba(71,85,105,0.07)' : '#fff',
                        flexDirection: 'row',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                      }}>
                      {isCustomItem ? (
                        <Text
                          style={{
                            flex: 1,
                            fontFamily: 'Pretendard-Bold',
                            fontSize: UI_FONT_MIN,
                            color: isSelected ? CUSTOM_PICKER_ITEM_COLOR_SELECTED : CUSTOM_PICKER_ITEM_COLOR,
                            letterSpacing: -0.2,
                            paddingTop: 2,
                          }}>
                          {item.label}
                        </Text>
                      ) : (
                        <Text style={{ flex: 1, letterSpacing: -0.2, paddingTop: 2 }}>
                          <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: UI_FONT_MIN, color: titleColor }}>{title}</Text>
                          {detail ? (
                            <Text
                              style={{
                                fontFamily: 'Pretendard-Regular',
                                fontSize: UI_FONT_MIN,
                                color: DETAIL_GRAY,
                              }}>{` (${detail})`}</Text>
                          ) : null}
                        </Text>
                      )}
                      {isSelected ? (
                        <View
                          style={{
                            width: 8, height: 8, borderRadius: 4,
                            backgroundColor: '#475569',
                            marginLeft: 8,
                            marginTop: 6,
                          }}
                        />
                      ) : null}
                    </Pressable>
                  );
                }}
              />
            </Animated.View>
          </View>
        </Modal>

        {/* ─── 전송 완료 모달 ─── */}
        <Modal
          visible={showSuccess}
          transparent
          animationType="fade"
          onRequestClose={onSuccessClose}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.5)',
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 32,
            }}>
            <View
              style={{
                width: '100%',
                maxWidth: 360,
                backgroundColor: '#fff',
                borderRadius: 20,
                overflow: 'hidden',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 16 },
                shadowOpacity: 0.2,
                shadowRadius: 32,
                elevation: 16,
              }}>
              {/* 모달 헤더 */}
              <LinearGradient
                colors={['#334155', '#475569']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20, alignItems: 'center', gap: 10 }}>
                <View
                  style={{
                    width: 52, height: 52, borderRadius: 26,
                    backgroundColor: 'rgba(255,255,255,0.15)',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                  <Hand color="#fff" size={26} strokeWidth={1.8} />
                </View>
                <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 18, color: '#fff', letterSpacing: -0.4, textAlign: 'center' }}>
                  {s.emergency.stop.sentMessage}
                </Text>
              </LinearGradient>

              {/* 모달 바디 */}
              <View style={{ paddingHorizontal: 20, paddingTop: 18, paddingBottom: 20, gap: 6 }}>
                <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: UI_FONT_MIN, color: '#94a3b8', letterSpacing: 0.3 }}>
                  {s.emergency.stop.sentReasonLabel.toUpperCase()}
                </Text>
                {isCustom ? (
                  <Text
                    style={{
                      fontFamily: 'Pretendard-Regular',
                      fontSize: UI_FONT_MIN,
                      color: '#1e293b',
                      lineHeight: UI_FONT_MIN * 1.45,
                      letterSpacing: -0.2,
                    }}>
                    {displayReason}
                  </Text>
                ) : selectedKey ? (
                  <Text style={{ letterSpacing: -0.2, lineHeight: UI_FONT_MIN * 1.45 }}>
                    <Text
                      style={{
                        fontFamily: 'Pretendard-Bold',
                        fontSize: UI_FONT_MIN,
                        color: REASON_TITLE_COLOR_BY_KEY.get(selectedKey) ?? TITLE_BLACK,
                      }}>
                      {splitReasonKey(selectedKey).title}
                    </Text>
                    {splitReasonKey(selectedKey).detail ? (
                      <Text
                        style={{
                          fontFamily: 'Pretendard-Regular',
                          fontSize: UI_FONT_MIN,
                          color: DETAIL_GRAY,
                        }}>{` (${splitReasonKey(selectedKey).detail})`}</Text>
                    ) : null}
                  </Text>
                ) : null}

                {detailText.trim() ? (
                  <>
                    <Text
                      style={{
                        fontFamily: 'Pretendard-Medium',
                        fontSize: UI_FONT_MIN,
                        color: '#94a3b8',
                        letterSpacing: 0.3,
                        marginTop: 12,
                      }}>
                      {s.emergency.stop.sentDetailLabel.toUpperCase()}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Pretendard-Regular',
                        fontSize: UI_FONT_MIN,
                        color: '#1e293b',
                        lineHeight: UI_FONT_MIN * 1.45,
                        letterSpacing: -0.2,
                      }}>
                      {detailText.trim()}
                    </Text>
                  </>
                ) : null}

                {images.length > 0 ? (
                  <>
                    <Text
                      style={{
                        fontFamily: 'Pretendard-Medium',
                        fontSize: UI_FONT_MIN,
                        color: '#94a3b8',
                        letterSpacing: 0.3,
                        marginTop: detailText.trim() ? 8 : 12,
                      }}>
                      {s.emergency.stop.sentPhotosLabel.toUpperCase()}
                    </Text>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                      contentContainerStyle={{ flexDirection: 'row', gap: 8, paddingVertical: 4 }}>
                      {images.map((uri, i) => (
                        <Image
                          key={uri + i}
                          source={{ uri }}
                          style={{ width: 72, height: 72, borderRadius: 10, backgroundColor: '#f1f5f9' }}
                          resizeMode="cover"
                        />
                      ))}
                    </ScrollView>
                  </>
                ) : null}

                <Pressable
                  onPress={onSuccessClose}
                  style={{
                    marginTop: 16,
                    height: 48,
                    borderRadius: 12,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#334155',
                  }}>
                  <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: UI_FONT_MIN, color: '#fff', letterSpacing: -0.2 }}>
                    {s.emergency.stop.sentClose}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </KeyboardAvoidingView>
  );
}
