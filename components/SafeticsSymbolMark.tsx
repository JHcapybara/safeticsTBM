import Svg, { G, Path, Rect } from 'react-native-svg';

type Props = {
  size?: number;
  /** 기본 브랜드 블루 */
  color?: string;
  /** 0~1, 도형 전체 */
  opacity?: number;
};

/**
 * 백그라운드 없는 Safetics 심볼 마크 (assets/branding/simbol_noBackground.svg 도형과 동일).
 * 스플래시/로딩 오버레이 등에 사용 — 네이티브 정적 스플래시는 PNG가 필요해 app.json image는 별도 내보내기.
 */
export function SafeticsSymbolMark({ size = 160, color = '#096DD9', opacity = 1 }: Props) {
  const fo = opacity;
  return (
    <Svg width={size} height={size} viewBox="0 0 1024 1024" accessibilityRole="image">
      <G transform="rotate(-45 66.8486 514.613)">
        <Rect x="66.8486" y="514.613" width="192" height="628" rx="96" fill={color} fillOpacity={0.92 * fo} />
      </G>
      <G transform="rotate(-135 201.541 648.193)">
        <Rect x="201.541" y="648.193" width="192" height="634.174" rx="96" fill={color} fillOpacity={0.92 * fo} />
      </G>
      <Path
        d="M846.103 396.221L833.953 408.384L826.531 415.827C830.251 387.258 820.834 357.381 798.332 335.636L586.816 131.304C548.625 94.4265 487.285 94.9745 449.777 132.524C412.287 170.092 412.844 230.429 451.017 267.325L662.534 471.656C685.035 493.401 715.588 502.117 744.559 497.945L737.406 505.104L724.987 517.55L800.902 590.882L825.74 565.99L775.112 517.091L846.534 445.545L897.162 494.444L922 469.552L846.085 396.221H846.103Z"
        fill={color}
        fillOpacity={0.92 * fo}
      />
    </Svg>
  );
}
