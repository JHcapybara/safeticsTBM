import * as Location from 'expo-location';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useLang } from '@/contexts/LangContext';
import type { SupportedLang } from '@/lang';

export type CurrentWeather = {
  locationLabel: string;
  tempC: number;
  apparentC: number;
  windKmh: number;
  humidity: number;
  minC: number;
  maxC: number;
  weatherCode: number;
  conditionLabel: string;
};

type State = {
  loading: boolean;
  error: string | null;
  data: CurrentWeather | null;
};

const DEFAULT_LAT = 37.5172;
const DEFAULT_LON = 127.0473;
const DEFAULT_LOCATION_KO = '서울특별시 강남구';
const DEFAULT_LOCATION_EN = 'Gangnam-gu, Seoul';

function msUntilNextHour(): number {
  const now = new Date();
  const next = new Date(now);
  next.setHours(next.getHours() + 1, 0, 0, 0);
  return Math.max(0, next.getTime() - now.getTime());
}

function weatherCodeToLabel(code: number, lang: SupportedLang): string {
  const ko: Record<number, string> = {
    0: '맑음',
    1: '대체로 맑음',
    2: '부분적으로 흐림',
    3: '흐림',
    45: '안개',
    48: '착빙 안개',
    51: '약한 이슬비',
    53: '이슬비',
    55: '강한 이슬비',
    61: '약한 비',
    63: '비',
    65: '강한 비',
    71: '약한 눈',
    73: '눈',
    75: '강한 눈',
    80: '약한 소나기',
    81: '소나기',
    82: '강한 소나기',
    95: '뇌우',
    96: '뇌우(우박)',
    99: '강한 뇌우(우박)',
  };
  const en: Record<number, string> = {
    0: 'Clear',
    1: 'Mainly clear',
    2: 'Partly cloudy',
    3: 'Overcast',
    45: 'Fog',
    48: 'Rime fog',
    51: 'Light drizzle',
    53: 'Drizzle',
    55: 'Dense drizzle',
    61: 'Light rain',
    63: 'Rain',
    65: 'Heavy rain',
    71: 'Light snow',
    73: 'Snow',
    75: 'Heavy snow',
    80: 'Light shower',
    81: 'Showers',
    82: 'Heavy shower',
    95: 'Thunderstorm',
    96: 'Thunderstorm (hail)',
    99: 'Severe thunderstorm',
  };
  const table = lang === 'ko' ? ko : en;
  return table[code] ?? (lang === 'ko' ? '날씨 정보' : 'Weather');
}

function toLocationLabel(
  raw: { city?: string | null; locality?: string | null; subregion?: string | null; region?: string | null } | null,
  lang: SupportedLang,
) {
  if (raw == null) return lang === 'ko' ? DEFAULT_LOCATION_KO : DEFAULT_LOCATION_EN;
  if (lang === 'ko') return [raw.region, raw.subregion, raw.city ?? raw.locality].filter(Boolean).join(' ');
  return [raw.city ?? raw.locality, raw.subregion, raw.region].filter(Boolean).join(', ');
}

async function resolveCoords() {
  const granted = await Location.requestForegroundPermissionsAsync();
  if (!granted.granted) {
    return { latitude: DEFAULT_LAT, longitude: DEFAULT_LON, usingFallback: true };
  }
  const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
  return {
    latitude: position.coords.latitude,
    longitude: position.coords.longitude,
    usingFallback: false,
  };
}

async function fetchWeather(lang: SupportedLang): Promise<CurrentWeather> {
  const coords = await resolveCoords();
  const weatherUrl =
    `https://api.open-meteo.com/v1/forecast?latitude=${coords.latitude}&longitude=${coords.longitude}` +
    '&current=temperature_2m,apparent_temperature,relative_humidity_2m,wind_speed_10m,weather_code' +
    '&daily=temperature_2m_max,temperature_2m_min&forecast_days=1&timezone=auto';
  const weatherRes = await fetch(weatherUrl);
  if (!weatherRes.ok) throw new Error('weather_api_failed');
  const weatherJson = (await weatherRes.json()) as {
    current?: {
      temperature_2m?: number;
      apparent_temperature?: number;
      relative_humidity_2m?: number;
      wind_speed_10m?: number;
      weather_code?: number;
    };
    daily?: { temperature_2m_max?: number[]; temperature_2m_min?: number[] };
  };
  const current = weatherJson.current;
  if (!current) throw new Error('weather_empty');

  let locationLabel = lang === 'ko' ? DEFAULT_LOCATION_KO : DEFAULT_LOCATION_EN;
  if (!coords.usingFallback) {
    try {
      const [rev] = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });
      locationLabel = toLocationLabel(rev ?? null, lang);
    } catch {
      /* 역지오코딩 실패 시 기본 라벨 유지 */
    }
  }

  const temp = current.temperature_2m ?? 0;
  const apparent = current.apparent_temperature ?? temp;
  const humidity = current.relative_humidity_2m ?? 0;
  const wind = current.wind_speed_10m ?? 0;
  const code = current.weather_code ?? 0;
  const min = weatherJson.daily?.temperature_2m_min?.[0] ?? temp;
  const max = weatherJson.daily?.temperature_2m_max?.[0] ?? temp;

  return {
    locationLabel,
    tempC: temp,
    apparentC: apparent,
    windKmh: wind,
    humidity,
    minC: min,
    maxC: max,
    weatherCode: code,
    conditionLabel: weatherCodeToLabel(code, lang),
  };
}

type WeatherContextValue = {
  weather: CurrentWeather | null;
  weatherLoading: boolean;
  weatherError: string | null;
  refreshWeather: () => Promise<void>;
};

const WeatherContext = createContext<WeatherContextValue | null>(null);

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const { lang } = useLang();
  const [state, setState] = useState<State>({ loading: true, error: null, data: null });

  const runFetch = useCallback(
    async (mode: 'initial' | 'manual' | 'hourly') => {
      setState((prev) => {
        const showLoading = mode === 'initial' || mode === 'manual' || (mode === 'hourly' && prev.data === null);
        return {
          ...prev,
          loading: showLoading,
          ...(mode === 'initial' ? { error: null } : {}),
        };
      });
      try {
        const data = await fetchWeather(lang);
        setState({ loading: false, error: null, data });
      } catch {
        setState((prev) => ({
          loading: false,
          error: 'weather_unavailable',
          data: prev.data,
        }));
      }
    },
    [lang],
  );

  useEffect(() => {
    let cancelled = false;
    let hourlyTimer: ReturnType<typeof setTimeout> | undefined;

    const scheduleNextHourly = () => {
      hourlyTimer = setTimeout(() => {
        void (async () => {
          if (cancelled) return;
          await runFetch('hourly');
          if (cancelled) return;
          scheduleNextHourly();
        })();
      }, msUntilNextHour());
    };

    void (async () => {
      await runFetch('initial');
      if (cancelled) return;
      scheduleNextHourly();
    })();

    return () => {
      cancelled = true;
      if (hourlyTimer) clearTimeout(hourlyTimer);
    };
  }, [lang, runFetch]);

  const refreshWeather = useCallback(async () => {
    await runFetch('manual');
  }, [runFetch]);

  const value = useMemo<WeatherContextValue>(
    () => ({
      weather: state.data,
      weatherLoading: state.loading,
      weatherError: state.error,
      refreshWeather,
    }),
    [state.data, state.error, state.loading, refreshWeather],
  );

  return <WeatherContext.Provider value={value}>{children}</WeatherContext.Provider>;
}

export function useCurrentWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) {
    throw new Error('useCurrentWeather는 WeatherProvider 안에서만 사용할 수 있습니다.');
  }
  return ctx;
}
