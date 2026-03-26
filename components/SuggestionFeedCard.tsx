import { router } from 'expo-router';
import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { type SuggestionItem } from '@/constants/suggestions';
import { useLang } from '@/contexts/LangContext';

function statusMeta(status: SuggestionItem['status']) {
  switch (status) {
    case 'completed':
      return { color: '#15803d' as const, bg: '#dcfce7' as const, border: '#86efac' as const };
    case 'in_progress':
      return { color: '#b45309' as const, bg: '#fef3c7' as const, border: '#fcd34d' as const };
    case 'pending':
      return { color: '#b91c1c' as const, bg: '#fee2e2' as const, border: '#fca5a5' as const };
  }
}

export function SuggestionFeedCard({ item }: { item: SuggestionItem }) {
  const { s } = useLang();
  const statusStyle = statusMeta(item.status);
  const statusText =
    item.status === 'completed'
      ? s.status.actionCompleted
      : item.status === 'in_progress'
        ? s.status.actionInProgress
        : s.status.pending;

  return (
    <Pressable
      onPress={() => router.push({ pathname: '/suggestions/[id]', params: { id: item.id } })}
      className="overflow-hidden rounded-2xl border border-[rgba(0,0,47,0.08)] bg-white p-4 active:opacity-95"
      style={{
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
      }}>
      <View className="mb-2.5 flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1">
          <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, lineHeight: 17, color: '#1e293b' }} numberOfLines={1}>
            {item.author}
          </Text>
          <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, lineHeight: 14, color: '#94a3b8', marginTop: 2 }} numberOfLines={1}>
            {item.timeLabel} - {item.siteLabel}
          </Text>
        </View>
        <View
          className="rounded-full border px-2.5 py-1"
          style={{ backgroundColor: statusStyle.bg, borderColor: statusStyle.border }}>
          <Text style={{ fontFamily: 'Pretendard-Bold', fontSize: 12, lineHeight: 14, color: statusStyle.color }}>{statusText}</Text>
        </View>
      </View>

      <Text
        style={{
          fontFamily: 'Pretendard-Bold',
          fontSize: 17,
          letterSpacing: -0.35,
          color: '#0f172a',
          lineHeight: 24,
        }}
        numberOfLines={2}>
        {item.title}
      </Text>

      <Text
        style={{
          fontFamily: 'Pretendard-Regular',
          fontSize: 14,
          lineHeight: 21,
          color: 'rgba(0, 7, 20, 0.58)',
          marginTop: 8,
          letterSpacing: -0.2,
        }}
        numberOfLines={1}
        ellipsizeMode="tail">
        {item.preview}
      </Text>

      <View className="mt-3 flex-row justify-end">
        <ChevronRight color="#94a3b8" size={20} strokeWidth={2.2} />
      </View>
    </Pressable>
  );
}
