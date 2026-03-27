import type { ReactNode } from 'react';
import { View, type StyleProp, type ViewStyle } from 'react-native';

type Props = {
  children: ReactNode;
  /** 없으면 전체 너비만 사용 (폰) */
  maxWidth?: number;
  style?: StyleProp<ViewStyle>;
};

/** 태블릿에서 본문을 넓힌 뒤 화면 중앙에 두기 위한 래퍼 */
export function CenteredColumn({ children, maxWidth, style }: Props) {
  return (
    <View style={[{ width: '100%', ...(maxWidth != null ? { maxWidth, alignSelf: 'center' } : {}) }, style]}>
      {children}
    </View>
  );
}
