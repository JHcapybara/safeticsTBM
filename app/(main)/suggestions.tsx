import { MessageSquare, PenLine, Sparkles } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SuggestionFeedCard } from '@/components/SuggestionFeedCard';
import { MOCK_SUGGESTIONS } from '@/constants/suggestions';

type SuggestionFilter = 'all' | 'completed' | 'in_progress' | 'pending';

export default function SuggestionsScreen() {
  const [suggestionFilter, setSuggestionFilter] = useState<SuggestionFilter>('all');
  const filteredSuggestions = useMemo(() => {
    if (suggestionFilter === 'all') return MOCK_SUGGESTIONS;
    return MOCK_SUGGESTIONS.filter((s) => s.status === suggestionFilter);
  }, [suggestionFilter]);

  return (
    <SafeAreaView className="flex-1 bg-[#fbfdff]" edges={['bottom']}>
      <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 28 }}>
        <View className="mb-4 max-w-[480px] flex-row items-end justify-between self-center" style={{ width: '100%' }}>
          <View className="flex-row items-center gap-2">
            <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#3e63dd]/10">
              <MessageSquare color="#3e63dd" size={20} strokeWidth={2} />
            </View>
            <View>
              <Text
                style={{
                  fontFamily: 'Pretendard-Medium',
                  fontSize: 12,
                  letterSpacing: 0.4,
                  color: '#64748b',
                }}>
                건의 · 소통
              </Text>
              <Text
                style={{
                  fontFamily: 'Pretendard-Bold',
                  fontSize: 22,
                  letterSpacing: -0.5,
                  color: '#0f172a',
                  marginTop: 2,
                }}>
                건의사항
              </Text>
            </View>
          </View>
          <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, color: '#64748b' }}>
            총 {MOCK_SUGGESTIONS.length}건
          </Text>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          className="mb-4 max-w-[480px] self-center"
          style={{ width: '100%' }}
          contentContainerStyle={{ gap: 8, paddingRight: 8 }}>
          {(
            [
              { key: 'all' as const, label: '전체' },
              { key: 'completed' as const, label: '조치 완료' },
              { key: 'in_progress' as const, label: '조치중' },
              { key: 'pending' as const, label: '미조치' },
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
                color: '#64748b',
                marginTop: 10,
              }}>
              이 필터에 해당하는 건의가 없습니다.
            </Text>
          </View>
        ) : null}

        <View className="mt-5 max-w-[480px] flex-row gap-2 self-center" style={{ width: '100%' }}>
          <Pressable
            className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-[rgba(0,0,47,0.12)] bg-white active:bg-slate-50"
            style={{
              shadowColor: '#002ec9',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.04,
              shadowRadius: 12,
              elevation: 2,
            }}>
            <PenLine color="#475569" size={18} strokeWidth={2} />
            <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, color: '#334155' }}>내가 쓴 글</Text>
          </Pressable>
          <Pressable
            className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl bg-[#3e63dd] active:opacity-90"
            style={{
              shadowColor: '#3e63dd',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 10,
              elevation: 4,
            }}>
            <Sparkles color="#ffffff" size={18} strokeWidth={2} />
            <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, color: '#ffffff' }}>새 건의</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
