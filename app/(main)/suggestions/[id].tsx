import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, router } from 'expo-router';
import { setStatusBarStyle } from 'expo-status-bar';
import { ArrowLeft, Menu } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { type SuggestionStatus } from '@/constants/suggestions';
import { useDrawer } from '@/contexts/DrawerContext';
import { useLang } from '@/contexts/LangContext';
import { useSuggestions } from '@/contexts/SuggestionContext';

const HEADER_BG = 'rgba(0, 46, 201, 0.88)';

function statusMeta(status: SuggestionStatus) {
  switch (status) {
    case 'completed':
      return { color: '#15803d' as const, bg: '#dcfce7' as const, border: '#86efac' as const };
    case 'in_progress':
      return { color: '#b45309' as const, bg: '#fef3c7' as const, border: '#fcd34d' as const };
    case 'pending':
      return { color: '#b91c1c' as const, bg: '#fee2e2' as const, border: '#fca5a5' as const };
  }
}

export default function SuggestionDetailScreen() {
  const { s } = useLang();
  const { openDrawer } = useDrawer();
  const { suggestions } = useSuggestions();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const item = id ? suggestions.find((x) => x.id === String(id)) : undefined;

  const [status] = useState<SuggestionStatus>(item?.status ?? 'pending');
  const [commentInput, setCommentInput] = useState('');
  const [history] = useState(item?.actionHistory ?? []);
  const [comments, setComments] = useState<
    { id: string; createdAt: string; author: string; content: string }[]
  >([]);

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle('light');
      return () => setStatusBarStyle('dark');
    }, []),
  );

  const onBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/suggestions');
  };

  if (!item) {
    return (
      <SafeAreaView className="flex-1 bg-[#fbfdff]" edges={['bottom']}>
        <View className="flex-1 items-center justify-center px-6">
          <Text style={{ fontFamily: 'Pretendard-Regular', color: '#64748b' }}>{s.suggestions.noResults}</Text>
          <Pressable onPress={onBack} className="mt-4 rounded-xl bg-[#3e63dd] px-6 py-3">
            <Text style={{ fontFamily: 'Pretendard-SemiBold', color: '#ffffff' }}>{s.common.goBack}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const statusStyle = statusMeta(status);
  const statusText =
    status === 'completed'
      ? s.status.actionCompleted
      : status === 'in_progress'
        ? s.status.actionInProgress
        : s.status.pending;

  const canSubmitComment = commentInput.trim().length > 0;

  const onAddComment = () => {
    if (!canSubmitComment) return;
    const now = new Date();
    const stamp = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, '0')}.${String(
      now.getDate(),
    ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    setComments((prev) => [
      {
        id: `local-${Date.now()}`,
        createdAt: stamp,
        author: s.suggestions.detailMe,
        content: commentInput.trim(),
      },
      ...prev,
    ]);
    setCommentInput('');
  };

  return (
    <View className="flex-1 bg-[#fbfdff]">
      <View style={{ backgroundColor: HEADER_BG }}>
        <SafeAreaView edges={['top']}>
          <View className="flex-row items-center gap-2 px-4 pb-2 pt-2">
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel={s.common.goBack}
              className="h-10 w-10 items-center justify-center rounded-md bg-[#3e63dd] active:opacity-90">
              <ArrowLeft color="#fff" size={18} strokeWidth={2} />
            </Pressable>
            <Text
              className="flex-1 text-center text-[20px] font-bold text-white"
              style={{ fontFamily: 'Pretendard-Bold', lineHeight: 32, letterSpacing: -0.5 }}>
              {s.suggestions.title}
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
        className="flex-1"
        contentContainerStyle={{
          paddingHorizontal: 16,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom, 24) + 8,
        }}
        showsVerticalScrollIndicator={false}>
        <View
          className="rounded-2xl border border-[rgba(0,0,47,0.08)] bg-white p-4"
          style={{
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.05,
            shadowRadius: 14,
            elevation: 3,
          }}>
          <View className="flex-row items-start justify-between gap-3">
            <View className="min-w-0 flex-1">
              <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 15, lineHeight: 18, color: '#1e293b' }}>{item.author}</Text>
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, lineHeight: 14, color: '#94a3b8', marginTop: 2 }}>
                {item.timeLabel} - {item.siteLabel}
              </Text>
            </View>
            <View className="items-end">
              <View className="rounded-full border px-2.5 py-1" style={{ backgroundColor: statusStyle.bg, borderColor: statusStyle.border }}>
                <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 12, lineHeight: 14, color: statusStyle.color }}>{statusText}</Text>
              </View>
              <Text
                style={{
                  fontFamily: 'Pretendard-Medium',
                  fontSize: 12,
                  lineHeight: 14,
                  color: '#64748b',
                  marginTop: 6,
                  letterSpacing: -0.15,
                }}>
                {item.ticketNo}
              </Text>
            </View>
          </View>

          <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.08)', marginTop: 14, marginBottom: 14 }} />

          <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, lineHeight: 18, color: '#1e293b', marginTop: 14 }}>
            {s.suggestions.detailSuggestion}
          </Text>
          <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 20, lineHeight: 28, color: '#0f172a', letterSpacing: -0.4, marginTop: 6 }}>
            {item.title}
          </Text>
          <Text
            style={{
              fontFamily: 'Pretendard-Regular',
              fontSize: 15,
              lineHeight: 24,
              color: 'rgba(0,7,20,0.72)',
              letterSpacing: -0.2,
              marginTop: 12,
            }}>
            {item.preview}
          </Text>

          <View style={{ height: 1, backgroundColor: 'rgba(0,0,47,0.08)', marginTop: 14, marginBottom: 14 }} />

          <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, lineHeight: 18, color: '#1e293b' }}>
            {s.suggestions.detailActionHistory}
          </Text>
          <View className="mt-2" style={{ gap: 10 }}>
            {history.length === 0 ? (
              <Text
                style={{
                  fontFamily: 'Pretendard-Regular',
                  fontSize: 13,
                  lineHeight: 20,
                  color: '#94a3b8',
                  paddingVertical: 2,
                }}>
                {s.suggestions.detailNoActionHistory}
              </Text>
            ) : (
              history.map((h, i) => (
                <View
                  key={h.id}
                  style={{
                    paddingBottom: i === history.length - 1 ? 0 : 12,
                    marginBottom: i === history.length - 1 ? 0 : 2,
                    borderBottomWidth: i === history.length - 1 ? 0 : 1,
                    borderBottomColor: 'rgba(0,0,47,0.06)',
                  }}>
                  <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 12, lineHeight: 16, color: '#64748b' }}>
                    {h.createdAt} - {h.author}
                  </Text>
                  <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 14, lineHeight: 20, color: '#1f2937', marginTop: 4 }}>
                    {h.content}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>

        <View
          className="mt-3 rounded-2xl border border-[rgba(0,0,47,0.08)] bg-white p-4"
          style={{
            shadowColor: '#0f172a',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.04,
            shadowRadius: 12,
            elevation: 2,
          }}>
          <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, lineHeight: 18, color: '#1e293b' }}>
            {s.suggestions.detailComments}
          </Text>
          <TextInput
            value={commentInput}
            onChangeText={setCommentInput}
            placeholder={s.suggestions.detailCommentPlaceholder}
            placeholderTextColor="#94a3b8"
            multiline
            className="mt-3 min-h-[92px] rounded-xl border border-[rgba(0,0,47,0.12)] bg-white px-3 py-2.5 text-[14px] text-[#1f2937]"
            style={{ fontFamily: 'Pretendard-Regular', textAlignVertical: 'top' }}
          />

          <View className="mt-3">
            <Pressable
              onPress={onAddComment}
              disabled={!canSubmitComment}
              className="h-11 items-center justify-center rounded-xl bg-[#3e63dd] active:opacity-90"
              style={{ opacity: canSubmitComment ? 1 : 0.45 }}>
              <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 13, lineHeight: 16, color: '#ffffff' }}>
                {s.suggestions.detailPostComment}
              </Text>
            </Pressable>
          </View>

          <View className="mt-3 rounded-xl border border-[rgba(0,0,47,0.08)] bg-[#fcfdff] p-3">
            {comments.length === 0 ? (
              <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 13, lineHeight: 18, color: '#94a3b8' }}>
                {s.suggestions.detailNoComments}
              </Text>
            ) : (
              comments.map((c, i) => (
                <View
                  key={c.id}
                  style={{
                    paddingBottom: i === comments.length - 1 ? 0 : 10,
                    marginBottom: i === comments.length - 1 ? 0 : 10,
                    borderBottomWidth: i === comments.length - 1 ? 0 : 1,
                    borderBottomColor: 'rgba(0,0,47,0.08)',
                  }}>
                  <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 12, lineHeight: 16, color: '#64748b' }}>
                    {c.createdAt} - {c.author}
                  </Text>
                  <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 14, lineHeight: 20, color: '#1f2937', marginTop: 4 }}>
                    {c.content}
                  </Text>
                </View>
              ))
            )}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
