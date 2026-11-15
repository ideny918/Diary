import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';

import { goTab } from '../../components/BottomTabs';
import { Chip, Footer, Header, Label, PhotoPlaceholder, s, Swatch } from '../../components/ui';
import { dowOf, md } from '../../data/dates';
import { useDiary } from '../../store/DiaryContext';
import { C, MOOD_LABELS, t } from '../../theme';

export default function EntryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { sorted, ui, setUI } = useDiary();
  const e = sorted.find(x => x.id === id) ?? sorted[0];
  const back = () => (router.canGoBack() ? router.back() : goTab(ui.lastTab));

  if (!e) return <View style={{ flex: 1 }}><Header title="—" onBack={back} /></View>;

  const meta: [string, React.ReactNode][] = [
    [
      'Mood',
      <View key="mood" style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8 }}>
        <Swatch mood={e.mood} size={12} />
        <Text style={t(13, 600)}>{MOOD_LABELS[e.mood - 1]}</Text>
        <Text style={t(13, 400, 0, C.muted)}>{e.emotions.join(' · ')}</Text>
      </View>,
    ],
    ['Weather', <Text key="weather" style={t(13)}>{e.weather}</Text>],
    ['Place', <Text key="place" style={t(13)}>{e.place}</Text>],
  ];

  return (
    <View style={{ flex: 1 }}>
      <Header title={md(e.m, e.d)} sub={`${dowOf(e.y, e.m, e.d)} · ${e.time}`} onBack={back} />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={[s.scroll, { paddingTop: 16, paddingBottom: 24, rowGap: 16 }]} showsVerticalScrollIndicator={false}>
        <Text style={[t(22, 700, -0.01), { lineHeight: 28.6 }]}>{e.title}</Text>

        <View style={{ borderTopWidth: 1, borderColor: C.ink }}>
          {meta.map(([k, v]) => (
            <View key={k} style={[s.hairRow, { paddingVertical: 8 }]}>
              <View style={{ width: 72 }}><Label>{k}</Label></View>
              <View style={{ flex: 1 }}>{v}</View>
            </View>
          ))}
        </View>

        {e.photoUri ? (
          <Image source={{ uri: e.photoUri }} style={{ height: 200, borderWidth: 1, borderColor: C.hair }} resizeMode="cover" />
        ) : e.photo ? (
          <PhotoPlaceholder height={200} id={`hatch-${e.id}`} />
        ) : null}

        <Text style={[t(14), { lineHeight: 25.2 }]}>{e.body}</Text>

        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {e.tags.map(tag => (
            <Chip
              key={tag}
              label={'#' + tag}
              outlined
              onPress={() => {
                setUI({ tagF: tag, query: '', lastTab: 'search' });
                goTab('search');
              }}
            />
          ))}
        </View>
      </ScrollView>
      <Footer left={`Diary · ${e.y}`} right={md(e.m, e.d)} />
    </View>
  );
}
