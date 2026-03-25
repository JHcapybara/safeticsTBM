import { ChevronRight } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';

import { suggestionStatusLabel, type SuggestionItem } from '@/constants/suggestions';

function statusMeta(status: SuggestionItem['status']) {
  switch (status) {
    case 'completed':
      return { color: '#22c55e' as const };
    case 'in_progress':
      return { color: '#f59e0b' as const };
    case 'pending':
      return { color: '#ef4444' as const };
  }
}

export function SuggestionFeedCard({ item }: { item: SuggestionItem }) {
  const { color } = statusMeta(item.status);
  const statusText = suggestionStatusLabel(item.status);
  return (
    <Pressable
      className="overflow-hidden rounded-2xl border border-[rgba(0,0,47,0.08)] bg-white p-4 active:opacity-95"
      style={{
        shadowColor: '#0f172a',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 16,
        elevation: 3,
      }}>
      <View className="mb-3 flex-row flex-wrap items-center gap-2">
        {item.tags.map((tag) => (
          <View key={tag} className="rounded-full bg-slate-100 px-2.5 py-1">
            <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 11, color: '#475569', letterSpacing: -0.1 }}>
              #{tag}
            </Text>
          </View>
        ))}
        <View className="ml-auto flex-row items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1">
          <View className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
          <Text style={{ fontFamily: 'Pretendard-Medium', fontSize: 11, color: '#64748b' }}>{statusText}</Text>
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
        numberOfLines={3}>
        {item.preview}
      </Text>

      <View className="mt-4 flex-row items-center border-t border-slate-100 pt-3">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-[#3e63dd]/12">
          <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, color: '#3e63dd' }}>
            {item.authorInitial}
          </Text>
        </View>
        <View className="min-w-0 flex-1 pl-3">
          <Text style={{ fontFamily: 'Pretendard-SemiBold', fontSize: 14, color: '#1e293b' }} numberOfLines={1}>
            {item.author}
          </Text>
          <Text style={{ fontFamily: 'Pretendard-Regular', fontSize: 12, color: '#94a3b8', marginTop: 2 }} numberOfLines={1}>
            {item.timeLabel} · {item.siteLabel}
          </Text>
        </View>
        <ChevronRight color="#cbd5e1" size={20} strokeWidth={2} />
      </View>
    </Pressable>
  );
}
