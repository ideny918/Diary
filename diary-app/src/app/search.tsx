import React from 'react';
import { Pressable, ScrollView, TextInput, View } from 'react-native';

import { EntryRow } from '../components/EntryRow';
import { Footer, Header, Label, LeaderRow, s, SearchIcon } from '../components/ui';
import { useDiary } from '../store/DiaryContext';
import { C, noOutline, P, t } from '../theme';

export default function Search() {
  const { sorted, ui, setUI } = useDiary();
  const q = ui.query.trim().toLowerCase();

  const results = sorted.filter(
    e =>
      (!ui.tagF || e.tags.includes(ui.tagF)) &&
      (!q || [e.title, e.body, ...e.tags, ...e.emotions, e.place].join(' ').toLowerCase().includes(q)),
  );

  const counts: Record<string, number> = {};
  sorted.forEach(e => e.tags.forEach(tag => (counts[tag] = (counts[tag] || 0) + 1)));
  const tags = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);

  return (
    <View style={{ flex: 1 }}>
      <Header title="Search" sub={results.length} />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.scroll, { paddingTop: 12, paddingBottom: 20, rowGap: 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 8, borderBottomWidth: 1, borderColor: C.ink, paddingVertical: 6 }}>
          <SearchIcon />
          <TextInput
            value={ui.query}
            onChangeText={query => setUI({ query })}
            placeholder="단어, 감정, 장소"
            placeholderTextColor={C.placeholder}
            returnKeyType="search"
            clearButtonMode="while-editing"
            style={[noOutline, t(15), { flex: 1, height: 32, paddingVertical: 0 }]}
          />
        </View>

        <View>
          <Label style={{ paddingBottom: 6 }}>Tags</Label>
          {tags.map((tag, i) => {
            const on = ui.tagF === tag;
            return (
              <Pressable
                key={tag}
                onPress={() => setUI(u => ({ tagF: u.tagF === tag ? null : tag }))}
                accessibilityState={{ selected: on }}
                style={{ backgroundColor: on ? P.point : 'transparent' }}
              >
                <LeaderRow no={String(i + 1).padStart(2, '0')} text={'#' + tag} n={counts[tag]} fg={on ? C.paper : C.ink} height={34} />
              </Pressable>
            );
          })}
        </View>

        <View>
          <Label ruled>{`Results · ${results.length}`}</Label>
          {results.map(e => (
            <EntryRow key={e.id} e={e} dateStyle="monthDay" />
          ))}
        </View>
      </ScrollView>
      <Footer left="Search" right={ui.tagF ? '#' + ui.tagF : 'All'} />
    </View>
  );
}
