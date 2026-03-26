/**
 * 건의사항 메인 — 라우트: `/suggestions` (웹 예: http://localhost:8081/suggestions)
 */
import { useFocusEffect } from '@react-navigation/native';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Menu, PenLine, Sparkles } from 'lucide-react-native';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { setStatusBarStyle } from 'expo-status-bar';

import { SuggestionFeedCard } from '@/components/SuggestionFeedCard';
import { getMySuggestions } from '@/constants/suggestions';
import { useDrawer } from '@/contexts/DrawerContext';
import { useLang } from '@/contexts/LangContext';
import { useSuggestions } from '@/contexts/SuggestionContext';

type SuggestionFilter = 'all' | 'completed' | 'in_progress' | 'pending';

const HEADER_PAD_BOTTOM = 8;
/** 헤더 블록 높이(대략) — index.tsx MAI-01과 동일 패턴 */
const HEADER_INNER_H = 40;

export default function SuggestionsScreen() {
  const { s } = useLang();
  const { openDrawer } = useDrawer();
  const { suggestions, currentUserName } = useSuggestions();
  const { created } = useLocalSearchParams<{ created?: string }>();
  const toastShown = useRef(false);
  const [showCreatedToast, setShowCreatedToast] = useState(false);
  const insets = useSafeAreaInsets();
  const [suggestionFilter, setSuggestionFilter] = useState<SuggestionFilter>('all');
  const [showMineOnly, setShowMineOnly] = useState(false);

  const filteredSuggestions = useMemo(() => {
    const base = showMineOnly ? getMySuggestions(suggestions, currentUserName) : suggestions;
    if (suggestionFilter === 'all') return base;
    return base.filter((x) => x.status === suggestionFilter);
  }, [showMineOnly, suggestionFilter, suggestions, currentUserName]);

  const headerBlockH = HEADER_INNER_H + HEADER_PAD_BOTTOM;
  const scrollPadTop = insets.top + headerBlockH + 24;

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  useEffect(() => {
    if (created !== '1' || toastShown.current) return;
    toastShown.current = true;
    setShowCreatedToast(true);
    const t = setTimeout(() => setShowCreatedToast(false), 2200);
    router.replace('/suggestions');
    return () => clearTimeout(t);
  }, [created]);

  const onBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/(main)');
  };

  return (
    <View className="flex-1 bg-[#fbfdff]">
      <View
        className="absolute left-0 right-0 top-0 z-10 px-4"
        style={{
          paddingTop: insets.top + 14,
          paddingBottom: HEADER_PAD_BOTTOM,
          backgroundColor: 'rgba(0, 46, 201, 0.88)',
        }}>
        <View className="flex-row items-center gap-2">
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel={s.common.goBack}
            className="h-10 w-10 items-center justify-center rounded-md bg-[#3e63dd] active:opacity-80">
            <ArrowLeft color="#ffffff" size={18} strokeWidth={2} />
          </Pressable>
          <Text
            className="flex-1 text-center font-bold text-white"
            style={{ fontFamily: 'Pretendard-Bold', fontSize: 20, lineHeight: 32, letterSpacing: -0.5 }}>
            {s.suggestions.title}
          </Text>
          <Pressable
            onPress={openDrawer}
            className="h-10 w-10 items-center justify-center rounded-md bg-[#3e63dd] active:opacity-80"
            accessibilityLabel={s.settings.menuA11y}>
            <Menu color="#ffffff" size={18} strokeWidth={2} />
          </Pressable>
        </View>
      </View>
      {showCreatedToast ? (
        <View
          className="absolute left-4 right-4 z-20 rounded-xl border border-[rgba(62,99,221,0.2)] bg-white px-3 py-2"
          style={{
            top: insets.top + 62,
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.08,
            shadowRadius: 10,
            elevation: 4,
          }}>
          <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 13, lineHeight: 16, color: '#1e293b', textAlign: 'center' }}>
            {s.suggestions.newSubmitDoneTitle}
          </Text>
        </View>
      ) : null}

      <ScrollView
        className="flex-1"
        style={{ paddingTop: scrollPadTop }}
        contentContainerStyle={{ paddingBottom: 28, paddingHorizontal: 16 }}
        showsVerticalScrollIndicator={false}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-3 max-w-[480px] self-center"
          style={{ width: '100%' }}
          contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
          {(
            [
              { key: 'all' as const, label: s.status.all },
              { key: 'completed' as const, label: s.status.actionCompleted },
              { key: 'in_progress' as const, label: s.status.actionInProgress },
              { key: 'pending' as const, label: s.status.pending },
            ] as const
          ).map(({ key, label }) => {
            const selected = suggestionFilter === key;
            return (
              <Pressable
                key={key}
                onPress={() => setSuggestionFilter(key)}
                className="rounded-full px-4 py-2 active:opacity-80"
                style={{
                  backgroundColor: selected ? '#3e63dd' : '#ffffff',
                  borderWidth: selected ? 0 : 1,
                  borderColor: 'rgba(0, 0, 47, 0.12)',
                }}>
                <Text
                  style={{
                    fontFamily: selected ? 'Pretendard-SemiBold' : 'Pretendard-Medium',
                    fontSize: 13,
                    color: selected ? '#ffffff' : '#475569',
                    letterSpacing: -0.2,
                  }}>
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View className="mb-4 max-w-[480px] flex-row gap-2 self-center" style={{ width: '100%' }}>
          <Pressable
            onPress={() => setShowMineOnly((v) => !v)}
            className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl border border-[rgba(0,0,47,0.12)] bg-white active:bg-slate-50"
            style={{
              shadowColor: '#002ec9',
              shadowOffset: { width: 0, height: 3 },
              shadowOpacity: 0.04,
              shadowRadius: 10,
              elevation: 2,
              backgroundColor: showMineOnly ? 'rgba(62,99,221,0.08)' : '#fff',
              borderColor: showMineOnly ? 'rgba(62,99,221,0.45)' : 'rgba(0,0,47,0.12)',
            }}>
            <PenLine color={showMineOnly ? '#1d4ed8' : '#475569'} size={17} strokeWidth={2} />
            <Text
              style={{
                fontFamily: 'Pretendard-SemiBold',
                fontSize: 14,
                lineHeight: 17,
                color: showMineOnly ? '#1d4ed8' : '#334155',
              }}>
              {s.suggestions.myPosts}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => router.push('/suggestions/new')}
            className="h-11 flex-1 flex-row items-center justify-center gap-2 rounded-xl bg-[#3e63dd] active:opacity-90"
            style={{
              shadowColor: '#3e63dd',
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.25,
              shadowRadius: 9,
              elevation: 4,
            }}>
            <Sparkles color="#ffffff" size={17} strokeWidth={2} />
            <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, lineHeight: 17, color: '#ffffff' }}>{s.suggestions.newPost}</Text>
          </Pressable>
        </View>

        <View className="max-w-[480px] self-center" style={{ width: '100%', gap: 12 }}>
          {filteredSuggestions.map((item) => (
            <SuggestionFeedCard key={item.id} item={item} />
          ))}
        </View>

        {filteredSuggestions.length === 0 ? (
          <View className="mt-4 max-w-[480px] items-center self-center rounded-2xl border border-dashed border-slate-200 py-10" style={{ width: '100%' }}>
            <Sparkles color="#94a3b8" size={28} strokeWidth={1.5} />
            <Text
              style={{
                fontFamily: 'Pretendard-Medium',
                fontSize: 15,
                lineHeight: 18,
                color: '#64748b',
                marginTop: 10,
              }}>
              {s.suggestions.noResults}
            </Text>
          </View>
        ) : null}

      </ScrollView>
    </View>
  );
}
