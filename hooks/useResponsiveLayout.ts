import { useMemo } from 'react';
import { useWindowDimensions } from 'react-native';

/** 짧은 변 ≥600px 을 태블릿으로 간주 (폰 가로 모드 오인 방지) */
export const TABLET_BREAKPOINT = 600;
export const LARGE_TABLET_BREAKPOINT = 900;

/** 홈·TBM 카드 등 좁은 폭 기본값 */
export const PHONE_NARROW_CARD_MAX = 343;

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();
  const shortSide = Math.min(width, height);
  const isTablet = shortSide >= TABLET_BREAKPOINT;
  const isLargeTablet = shortSide >= LARGE_TABLET_BREAKPOINT;

  const pagePaddingX = isLargeTablet ? 40 : isTablet ? 28 : 16;

  const contentColumnMaxWidth = useMemo(() => {
    if (!isTablet) return undefined;
    return Math.min(760, width - pagePaddingX * 2);
  }, [isTablet, width, pagePaddingX]);

  const cardColumnMaxWidth = useMemo(() => {
    if (!isTablet) return PHONE_NARROW_CARD_MAX;
    return contentColumnMaxWidth ?? PHONE_NARROW_CARD_MAX;
  }, [isTablet, contentColumnMaxWidth]);

  const loginFormMaxWidth = useMemo(() => {
    if (!isTablet) return 400;
    return Math.min(540, width - pagePaddingX * 2);
  }, [isTablet, width, pagePaddingX]);

  const emergencyCarouselGap = isTablet ? 20 : 16;

  const emergencyCardWidth = useMemo(() => {
    if (!isTablet) return 200;
    const inner = width - pagePaddingX * 2;
    const w = Math.floor((inner - emergencyCarouselGap * 2) / 2.35);
    return Math.max(220, Math.min(300, w));
  }, [isTablet, width, pagePaddingX, emergencyCarouselGap]);

  const headerTitleFontSize = isLargeTablet ? 24 : isTablet ? 22 : 20;

  const drawerWidth = isTablet ? Math.min(340, Math.round(shortSide * 0.42)) : 256;

  return {
    width,
    height,
    shortSide,
    isTablet,
    isLargeTablet,
    pagePaddingX,
    contentColumnMaxWidth,
    cardColumnMaxWidth,
    loginFormMaxWidth,
    emergencyCarouselGap,
    emergencyCardWidth,
    headerTitleFontSize,
    drawerWidth,
  };
}

export function emergencyCarouselCardMinHeight(cardWidth: number, baseWidth = 200): number {
  return Math.round(176 * (cardWidth / baseWidth));
}
