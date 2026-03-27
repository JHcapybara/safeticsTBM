import { Platform } from 'react-native';

/**
 * 안드로이드에서 ScrollView가 끝까지 스크롤되지 않거나,
 * 중첩 스크롤(세로+가로) 시 제스처가 막히는 경우가 있어 공통으로 둡니다.
 * @see https://reactnative.dev/docs/scrollview#removeclippedsubviews-android
 */
export const scrollViewAndroidProps =
  Platform.OS === 'android'
    ? ({
        nestedScrollEnabled: true,
        removeClippedSubviews: false,
      } as const)
    : ({} as const);
