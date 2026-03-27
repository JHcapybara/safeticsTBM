import { scrollViewAndroidProps } from '@/constants/scrollViewAndroid';
import type { ScrollViewProps } from 'react-native';
import { ScrollView } from 'react-native';

type Props = ScrollViewProps & {
  className?: string;
  contentContainerClassName?: string;
};

/**
 * 안드로이드 하단 제스처/소프트키 영역까지 스크롤 콘텐츠가 보이도록
 * `contentContainerClassName`에 `pb-8` 기본값을 둔 세로 스크롤 래퍼입니다.
 * 가로 스크롤·캐러셀에는 사용하지 마세요.
 */
export function ScreenScroll({ className, contentContainerClassName, ...rest }: Props) {
  return (
    <ScrollView
      {...scrollViewAndroidProps}
      className={['flex-1', className].filter(Boolean).join(' ')}
      contentContainerClassName={['pb-8', contentContainerClassName].filter(Boolean).join(' ')}
      {...rest}
    />
  );
}
