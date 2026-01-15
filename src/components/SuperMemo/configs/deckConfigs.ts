import React from 'react';
import { DeckConfig } from '../types';
import { HiraganaCard, KatakanaCard } from '../../Flashcard/Flashcard';
import {
  fetchAvailableHiragana,
  fetchDueHiragana,
  fetchNewHiragana,
} from '../../Fetching/useHiraganaFetch';
import {
  fetchAvailableKatakana,
  fetchDueKatakana,
  fetchNewKatakana,
} from '../../Fetching/useKatakanaFetch';
import {
  fetchAvailableKanjiCards,
  fetchDueKanjiCards,
  fetchNewKanjiCards,
} from '../../Fetching/useKanjiFetch';

export const HIRAGANA_CONFIG: DeckConfig = {
  deckType: 'hiragana',
  deckName: 'Hiragana',
  modeLabel: {
    default: 'Hiragana',
    new: 'New Cards',
    due: 'Due Cards',
  },
  fetchFunctions: {
    fetchAvailable: fetchAvailableHiragana,
    fetchDue: fetchDueHiragana,
    fetchNew: fetchNewHiragana,
  },
  CardComponent: HiraganaCard,
};

export const KATAKANA_CONFIG: DeckConfig = {
  deckType: 'katakana',
  deckName: 'Katakana',
  modeLabel: {
    default: 'Katakana',
    new: 'New Cards',
    due: 'Due Cards',
  },
  fetchFunctions: {
    fetchAvailable: fetchAvailableKatakana,
    fetchDue: fetchDueKatakana,
    fetchNew: fetchNewKatakana,
  },
  CardComponent: KatakanaCard,
  limits: {
    dailyDueCards: 3,
  },
};

// Simple Kanji front card component (just shows the character)
const KanjiCardFront = ({ character }: { character: string; romaji?: string }): JSX.Element => {
  return React.createElement('div', { className: 'text-8xl font-bold' }, character);
};

export const KANJI_CONFIG: DeckConfig = {
  deckType: 'kanji',
  deckName: 'Kanji',
  modeLabel: {
    default: 'Kanji',
    new: 'New Cards',
    due: 'Due Cards',
  },
  fetchFunctions: {
    fetchAvailable: fetchAvailableKanjiCards,
    fetchDue: fetchDueKanjiCards,
    fetchNew: fetchNewKanjiCards,
  },
  CardComponent: KanjiCardFront,
};
