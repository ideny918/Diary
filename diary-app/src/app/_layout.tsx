import {
  NunitoSans_300Light,
  NunitoSans_400Regular,
  NunitoSans_500Medium,
  NunitoSans_600SemiBold,
  NunitoSans_700Bold,
  useFonts,
} from '@expo-google-fonts/nunito-sans';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabs, tabForPath } from '../components/BottomTabs';
import { DiaryProvider, useDiary } from '../store/DiaryContext';
import { C } from '../theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts(
    Platform.OS === 'ios'
      ? {} // iOS uses the system Avenir Next
      : { NunitoSans_300Light, NunitoSans_400Regular, NunitoSans_500Medium, NunitoSans_600SemiBold, NunitoSans_700Bold },
  );
  return (
    <SafeAreaProvider>
      <DiaryProvider>
        <Shell ready={fontsLoaded} />
      </DiaryProvider>
    </SafeAreaProvider>
  );
}

/**
 * The whole app sits on one "page" of a diary book: a paper card on a grey desk,
 * with a binding shadow on the left and index tabs hanging from its bottom edge.
 */
function Shell({ ready }: { ready: boolean }) {
  const insets = useSafeAreaInsets();
  const { hydrated, unlocked, setUI } = useDiary();
  const pathname = usePathname();
  const isLock = pathname === '/lock';

  // Remember the last tab so Entry / Write keep it highlighted (and "back" returns there).
  const tab = tabForPath(pathname);
  useEffect(() => {
    if (tab) setUI({ lastTab: tab });
  }, [tab, setUI]);

  if (!ready || !hydrated) return <View style={{ flex: 1, backgroundColor: C.desk }} />;

  return (
    <View style={[styles.desk, { paddingTop: insets.top + 6, paddingBottom: Math.max(insets.bottom, 12) }]}>
      <StatusBar style="dark" />
      <View style={styles.page}>
        <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: C.paper } }}>
          <Stack.Protected guard={!unlocked}>
            <Stack.Screen name="lock" />
          </Stack.Protected>
          <Stack.Protected guard={unlocked}>
            <Stack.Screen name="index" />
            <Stack.Screen name="month" />
            <Stack.Screen name="search" />
            <Stack.Screen name="insight" />
            <Stack.Screen name="setting" />
            <Stack.Screen name="write" />
            <Stack.Screen name="entry/[id]" />
          </Stack.Protected>
        </Stack>
        <LinearGradient
          colors={['rgba(0,0,0,0.07)', 'rgba(0,0,0,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.binding}
          pointerEvents="none"
        />
      </View>
      {isLock || !unlocked ? <View style={{ height: 34 }} /> : <BottomTabs />}
    </View>
  );
}

const styles = StyleSheet.create({
  desk: { flex: 1, backgroundColor: C.desk },
  page: {
    flex: 1,
    marginRight: 10,
    backgroundColor: C.paper,
    borderTopRightRadius: 6,
    borderBottomRightRadius: 6,
    boxShadow: '1px 1px 0px rgba(0,0,0,0.13), 6px 8px 24px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  binding: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 22, zIndex: 4 },
});
