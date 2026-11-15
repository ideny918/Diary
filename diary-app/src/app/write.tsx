import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { goTab } from '../components/BottomTabs';
import { Chip, Footer, Grid, Header, Label, PhotoIcon, s } from '../components/ui';
import { DOW, hhmm, mdOf } from '../data/dates';
import { EMOTIONS, STAMP_PLACEHOLDER, SUGGESTED_TAGS } from '../data/seed';
import { useDiary } from '../store/DiaryContext';
import { C, fgOnMood, font, MOOD_LABELS, noOutline, P, t } from '../theme';

const LINE = 28;

export default function Write() {
  const { draft, setDraft, saveDraft, settings, ui } = useDiary();
  const [bodyH, setBodyH] = useState(224);
  const today = new Date();
  const canSave = !!(draft.title.trim() || draft.body.trim());
  const allTags = Array.from(new Set([...SUGGESTED_TAGS, ...draft.tags]));
  const toggle = (arr: string[], v: string) => (arr.includes(v) ? arr.filter(x => x !== v) : [...arr, v]);

  const back = () => (router.canGoBack() ? router.back() : goTab(ui.lastTab));

  const save = () => {
    const id = saveDraft();
    if (id) router.replace({ pathname: '/entry/[id]', params: { id } });
  };

  const addTag = () => {
    const tag = draft.tagText.trim().replace(/[#\s]/g, '');
    if (tag) setDraft(d => ({ tags: [...new Set([...d.tags, tag])], tagText: '' }));
  };

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!res.canceled && res.assets[0]) setDraft({ photoUri: res.assets[0].uri });
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Header
        title="New"
        sub={`${mdOf(today)} · ${DOW[today.getDay()]}`}
        onBack={back}
        right={
          <Pressable
            onPress={save}
            disabled={!canSave}
            style={{ height: 34, paddingHorizontal: 16, backgroundColor: P.point, justifyContent: 'center', opacity: canSave ? 1 : 0.35 }}
          >
            <Text style={t(12.5, 400, 0.06, C.paper)}>저장</Text>
          </Pressable>
        }
      />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[s.scroll, { paddingTop: 4, paddingBottom: 24, rowGap: 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {settings.stamp && (
          <View>
            {[
              ['Time', hhmm(today)],
              ['Weather', STAMP_PLACEHOLDER.weather],
              ['Place', STAMP_PLACEHOLDER.place],
            ].map(([k, v]) => (
              <View key={k} style={[s.hairRow, { justifyContent: 'space-between' }]}>
                <Label>{k}</Label>
                <Text style={t(13)}>{v}</Text>
              </View>
            ))}
          </View>
        )}

        {!!draft.prompt && (
          <View style={{ rowGap: 6 }}>
            <Label>Prompt</Label>
            <Text style={[t(15, 500), { lineHeight: 22.5 }]}>{draft.prompt}</Text>
          </View>
        )}

        <View style={{ rowGap: 8 }}>
          <Label>Mood</Label>
          <Grid
            items={P.moods}
            cols={5}
            render={(c, i) => {
              const on = draft.mood === i + 1;
              return (
                <Pressable
                  onPress={() => setDraft({ mood: i + 1 })}
                  accessibilityLabel={MOOD_LABELS[i]}
                  accessibilityState={{ selected: on }}
                  style={{ height: 66, alignItems: 'center', justifyContent: 'center', rowGap: 8, backgroundColor: on ? c : 'transparent' }}
                >
                  <View style={{ width: 16, height: 16, backgroundColor: c, borderWidth: 1, borderColor: on ? (i === 0 ? C.paper : C.ink) : C.hair }} />
                  <Text style={t(11.5, on ? 700 : 400, 0, on ? fgOnMood(i) : C.ink)}>{MOOD_LABELS[i]}</Text>
                </Pressable>
              );
            }}
          />
          {draft.mood > 0 && (
            <View style={{ rowGap: 8, marginTop: 8 }}>
              <Label>Feelings</Label>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
                {EMOTIONS.map(l => (
                  <Chip key={l} label={l} on={draft.emotions.includes(l)} onPress={() => setDraft(d => ({ emotions: toggle(d.emotions, l) }))} />
                ))}
              </View>
            </View>
          )}
        </View>

        <View>
          <TextInput
            value={draft.title}
            onChangeText={title => setDraft({ title })}
            placeholder="제목"
            placeholderTextColor={C.placeholder}
            style={[noOutline, t(20, 700, -0.01), { borderBottomWidth: 1, borderColor: C.ink, paddingTop: 6, paddingBottom: 8, paddingHorizontal: 0 }]}
          />
          <View style={{ minHeight: 224 }}>
            {/* ruled lines behind the text: 1px rule at the bottom of every 28px line */}
            {Array.from({ length: Math.ceil(bodyH / LINE) }, (_, i) => (
              <View key={i} pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top: i * LINE + LINE - 1, height: 1, backgroundColor: C.hair }} />
            ))}
            <TextInput
              value={draft.body}
              onChangeText={body => setDraft({ body })}
              placeholder="오늘은 어땠나요?"
              placeholderTextColor={C.placeholder}
              multiline
              scrollEnabled={false}
              textAlignVertical="top"
              onContentSizeChange={e => setBodyH(Math.max(224, e.nativeEvent.contentSize.height))}
              style={[noOutline, font(400), { fontSize: 14, lineHeight: LINE, color: C.ink, minHeight: 224, padding: 0, paddingTop: Platform.OS === 'ios' ? 4 : 0 }]}
            />
          </View>
        </View>

        <View style={{ rowGap: 8 }}>
          <Label>Photo</Label>
          {draft.photoUri ? (
            <View style={{ height: 170, borderWidth: 1, borderColor: C.hair }}>
              <Image source={{ uri: draft.photoUri }} style={{ flex: 1 }} resizeMode="cover" />
              <Pressable
                onPress={() => setDraft({ photoUri: null })}
                style={{ position: 'absolute', top: 6, right: 6, height: 28, paddingHorizontal: 10, borderWidth: 1, borderColor: C.ink, backgroundColor: C.paper, justifyContent: 'center' }}
              >
                <Text style={t(11)}>삭제</Text>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={pickPhoto}
              style={({ pressed }) => ({ height: 96, borderWidth: 1, borderStyle: 'dashed', borderColor: C.chipBorder, alignItems: 'center', justifyContent: 'center', rowGap: 6, backgroundColor: pressed ? C.pressed : 'transparent' })}
            >
              <PhotoIcon />
              <Text style={t(10.5, 400, 0.14, C.muted)}>ADD PHOTO</Text>
            </Pressable>
          )}
        </View>

        <View style={{ rowGap: 8 }}>
          <Label>Tags</Label>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {allTags.map(l => (
              <Chip key={l} label={'#' + l} on={draft.tags.includes(l)} onPress={() => setDraft(d => ({ tags: toggle(d.tags, l) }))} />
            ))}
            <TextInput
              value={draft.tagText}
              onChangeText={tagText => setDraft({ tagText })}
              onSubmitEditing={addTag}
              submitBehavior="submit"
              returnKeyType="done"
              placeholder="+ 새 태그"
              placeholderTextColor={C.placeholder}
              style={[noOutline, t(12), { height: 30, width: 84, paddingVertical: 0, paddingHorizontal: 11, borderRadius: 999, borderWidth: 1, borderStyle: 'dashed', borderColor: C.placeholder }]}
            />
          </View>
        </View>
      </ScrollView>
      <Footer left="Draft" right={mdOf(today)} />
    </KeyboardAvoidingView>
  );
}
