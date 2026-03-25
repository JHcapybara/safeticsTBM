import type { ComponentType } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CheckCircle2,
  Circle,
  ClipboardList,
  ListChecks,
  ShieldAlert,
  User,
} from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { formatTbmDateTime, getTbmById } from '@/constants/tbm';

export default function TbmDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const tbm = id ? getTbmById(String(id)) : undefined;

  if (!tbm) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-tbm-surface px-6">
        <Text className="mb-4 text-center text-slate-600">TBM을 찾을 수 없습니다.</Text>
        <Pressable className="rounded-xl bg-teal-600 px-6 py-3" onPress={() => router.back()}>
          <Text className="font-semibold text-white">돌아가기</Text>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-tbm-surface" edges={['bottom']}>
      <ScrollView className="flex-1 px-4 pt-2" showsVerticalScrollIndicator={false}>
        <View className="mb-4 rounded-2xl border border-tbm-border bg-white p-4">
          <View className="mb-2 flex-row flex-wrap items-center gap-2">
            <View
              className={`rounded-full px-2.5 py-1 ${tbm.status === 'completed' ? 'bg-slate-200' : 'bg-teal-100'}`}>
              <Text
                className={`text-xs font-bold ${tbm.status === 'completed' ? 'text-slate-700' : 'text-teal-800'}`}>
                {tbm.status === 'completed' ? '완료' : '예정'}
              </Text>
            </View>
            <Text className="text-sm text-tbm-muted">{formatTbmDateTime(tbm.scheduledAt)}</Text>
          </View>
          <Text className="text-xl font-bold text-slate-900">{tbm.title}</Text>
          <View className="mt-3 flex-row items-center gap-2 border-t border-tbm-border pt-3">
            <User color="#64748b" size={18} />
            <Text className="text-sm text-slate-700">
              책임자 {tbm.supervisor} · 참석 {tbm.attendeeCount}명
            </Text>
          </View>
          <Text className="mt-1 text-sm text-tbm-muted">
            {tbm.siteName} · {tbm.workArea}
          </Text>
        </View>

        <SectionTitle icon={ClipboardList} title="작업 내용" />
        <View className="mb-4 rounded-2xl border border-tbm-border bg-white p-4">
          <Text className="leading-6 text-slate-800">{tbm.workSummary}</Text>
        </View>

        <SectionTitle icon={ShieldAlert} title="위험 요인" />
        <View className="mb-4 rounded-2xl border border-tbm-border bg-white p-4">
          {tbm.riskFactors.map((line, idx) => (
            <View key={idx} className="mb-2 flex-row gap-2 last:mb-0">
              <Text className="font-bold text-amber-600">•</Text>
              <Text className="flex-1 text-slate-800">{line}</Text>
            </View>
          ))}
        </View>

        <SectionTitle icon={ListChecks} title="안전 대책" />
        <View className="mb-4 rounded-2xl border border-tbm-border bg-white p-4">
          {tbm.safetyMeasures.map((line, idx) => (
            <View key={idx} className="mb-2 flex-row gap-2 last:mb-0">
              <Text className="font-bold text-teal-600">✓</Text>
              <Text className="flex-1 text-slate-800">{line}</Text>
            </View>
          ))}
        </View>

        <SectionTitle icon={CheckCircle2} title="체크리스트" />
        <View className="mb-8 rounded-2xl border border-tbm-border bg-white p-2">
          {tbm.checklist.map((c) => (
            <View
              key={c.id}
              className="flex-row items-center gap-3 border-b border-tbm-border px-3 py-3 last:border-b-0">
              {c.done ? (
                <CheckCircle2 color="#0d9488" size={22} strokeWidth={2} />
              ) : (
                <Circle color="#cbd5e1" size={22} strokeWidth={2} />
              )}
              <Text className={`flex-1 text-base ${c.done ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                {c.label}
              </Text>
            </View>
          ))}
        </View>

        <Pressable
          className="mb-6 rounded-2xl bg-teal-700 py-4 active:bg-teal-800"
          onPress={() => {}}>
          <Text className="text-center text-base font-bold text-white">참석 확인 · 서명 (데모)</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

type IconComp = ComponentType<{ color?: string; size?: number; strokeWidth?: number }>;

function SectionTitle({ icon: Icon, title }: { icon: IconComp; title: string }) {
  return (
    <View className="mb-2 flex-row items-center gap-2">
      <Icon color="#0f766e" size={20} strokeWidth={2} />
      <Text className="text-base font-bold text-slate-800">{title}</Text>
    </View>
  );
}
