import { router } from 'expo-router';
import { Bell, Building2, HelpCircle, LogOut, Shield } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const rows = [
  { icon: Building2, label: '소속 현장', value: '○○건설 · 본사' },
  { icon: Shield, label: '권한', value: '현장 안전관리자' },
  { icon: Bell, label: '알림', value: 'TBM 시작 30분 전' },
  { icon: HelpCircle, label: '도움말', value: '가이드 및 문의' },
] as const;

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-tbm-surface" edges={['bottom']}>
      <ScrollView className="flex-1 px-4" showsVerticalScrollIndicator={false}>
        <View className="mb-6 items-center rounded-2xl border border-tbm-border bg-white py-8">
          <View className="mb-3 h-20 w-20 items-center justify-center rounded-full bg-teal-100">
            <Text className="text-2xl font-bold text-teal-800">김</Text>
          </View>
          <Text className="text-lg font-bold text-slate-900">김안전</Text>
          <Text className="text-sm text-tbm-muted">kim.safety@example.com</Text>
        </View>

        <View className="mb-4 overflow-hidden rounded-2xl border border-tbm-border bg-white">
          {rows.map(({ icon: Icon, label, value }, i) => (
            <Pressable
              key={label}
              className={`flex-row items-center gap-3 px-4 py-4 active:bg-slate-50 ${i > 0 ? 'border-t border-tbm-border' : ''}`}>
              <Icon color="#0d9488" size={22} strokeWidth={2} />
              <View className="flex-1">
                <Text className="text-xs font-medium text-tbm-muted">{label}</Text>
                <Text className="text-base text-slate-900">{value}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Pressable
          onPress={() => router.replace('/')}
          className="mb-8 flex-row items-center justify-center gap-2 rounded-2xl border border-red-200 bg-red-50 py-4 active:bg-red-100">
          <LogOut color="#dc2626" size={22} />
          <Text className="font-semibold text-red-700">로그아웃</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
