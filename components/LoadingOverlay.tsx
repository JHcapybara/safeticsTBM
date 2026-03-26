import { ActivityIndicator, Modal, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { SafeticsSymbolMark } from '@/components/SafeticsSymbolMark';

type Props = {
  visible: boolean;
  /** 하단 안내 문구 (선택) */
  message?: string;
};

/**
 * 긴 API 호출·동기 작업 등에 사용하는 풀스크린 로딩.
 * `import { LoadingOverlay } from '@/components/LoadingOverlay'`
 */
export function LoadingOverlay({ visible, message }: Props) {
  const insets = useSafeAreaInsets();

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View
        style={[
          styles.root,
          {
            paddingTop: insets.top + 24,
            paddingBottom: Math.max(insets.bottom, 24),
          },
        ]}
        accessibilityViewIsModal>
        <SafeticsSymbolMark size={140} color="#096DD9" />
        <ActivityIndicator size="large" color="#3e63dd" style={{ marginTop: 28 }} />
        {message ? (
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#fbfdff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  message: {
    marginTop: 16,
    fontFamily: 'Pretendard-Regular',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -0.3,
    color: 'rgba(0,7,20,0.55)',
    textAlign: 'center',
  },
});
