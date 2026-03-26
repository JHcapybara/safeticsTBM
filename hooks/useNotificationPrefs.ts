import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';

const KEY_APP = '@tbm/settings/pushApp';
const KEY_TBM = '@tbm/settings/pushTbm';

export function useNotificationPrefs() {
  const [pushApp, setPushAppState] = useState(true);
  const [pushTbm, setPushTbmState] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [a, t] = await Promise.all([AsyncStorage.getItem(KEY_APP), AsyncStorage.getItem(KEY_TBM)]);
        if (cancelled) return;
        if (a !== null) setPushAppState(a === '1');
        if (t !== null) setPushTbmState(t === '1');
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const setPushApp = useCallback(async (v: boolean) => {
    setPushAppState(v);
    await AsyncStorage.setItem(KEY_APP, v ? '1' : '0');
  }, []);

  const setPushTbm = useCallback(async (v: boolean) => {
    setPushTbmState(v);
    await AsyncStorage.setItem(KEY_TBM, v ? '1' : '0');
  }, []);

  return { pushApp, pushTbm, setPushApp, setPushTbm, ready };
}
