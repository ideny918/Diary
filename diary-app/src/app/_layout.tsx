import { GowunBatang_400Regular, GowunBatang_700Bold } from '@expo-google-fonts/gowun-batang';
import {
  IBMPlexSansKR_300Light,
  IBMPlexSansKR_400Regular,
  IBMPlexSansKR_500Medium,
  IBMPlexSansKR_600SemiBold,
  IBMPlexSansKR_700Bold,
} from '@expo-google-fonts/ibm-plex-sans-kr';
import { useFonts } from 'expo-font';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack, usePathname } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

import { BottomTabs } from '../components/BottomTabs';
import { DiaryProvider, useDiary } from '../store/DiaryContext';
import { C } from '../theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    IBMPlexSansKR_300Light,
    IBMPlexSansKR_400Regular,
    IBMPlexSansKR_500Medium,
    IBMPlexSansKR_600SemiBold,
    IBMPlexSansKR_700Bold,
    GowunBatang_400Regular,
    GowunBatang_700Bold,
  });
  return (
    <SafeAreaProvider>
      <DiaryProvider>
        <Shell ready={fontsLoaded} />
      </DiaryProvider>
    </SafeAreaProvider>
  );
}

/** One page of the diary book on a grey desk, binding shadow on the left, index tabs hanging below. */
function Shell({ ready }: { ready: boolean }) {
  const insets = useSafeAreaInsets();
  const { hydrated, unlocked } = useDiary();
  const isLock = usePathname() === '/lock';

  if (!ready || !hydrated) return <View style={{ flex: 1, backgroundColor: C.desk }} />;

  return (
    <KeyboardAvoidingView
      style={[styles.desk, { paddingTop: insets.top + 6, paddingBottom: Math.max(insets.bottom, 12) }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="dark" />
      <View style={styles.page}>
        <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: C.paper } }}>
          <Stack.Protected guard={!unlocked}>
            <Stack.Screen name="lock" />
          </Stack.Protected>
          <Stack.Protected guard={unlocked}>
            <Stack.Screen name="index" />
            <Stack.Screen name="year" />
            <Stack.Screen name="month" />
            <Stack.Screen name="week" />
            <Stack.Screen name="notes/index" />
            <Stack.Screen name="notes/[cat]" />
            <Stack.Screen name="note/[id]" />
            <Stack.Screen name="habit/index" />
            <Stack.Screen name="habit/[id]" />
            <Stack.Screen name="setting" />
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
    </KeyboardAvoidingView>
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
  binding: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 28, zIndex: 4 },
});
