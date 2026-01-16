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
import {
  fetchAvailableSentenceCards,
  fetchDueSentenceCards,
  fetchNewSentenceCards,
} from '../../Fetching/useSentenceFetch';

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

// Sentence card component (shows Japanese sentence, and translation if provided)
const SentenceCardFront = ({ character, romaji }: { character: string; romaji?: string }): JSX.Element => {
  if (romaji) {
    // Back side: show both sentence and translation
    return React.createElement(
      'div',
      { className: 'space-y-6 w-full max-w-lg mx-auto' },
      React.createElement('div', { className: 'text-3xl font-bold leading-relaxed' }, character),
      React.createElement(
        'div',
        { className: 'border-t-2 border-gray-200 pt-4' },
        React.createElement('p', { className: 'text-sm text-muted-foreground mb-2' }, 'Translation'),
        React.createElement('p', { className: 'text-xl text-gray-700' }, romaji)
      )
    );
  }
  // Front side: show only Japanese sentence
  return React.createElement('div', { className: 'text-3xl font-bold leading-relaxed px-4' }, character);
};

export const SENTENCE_CONFIG: DeckConfig = {
  deckType: 'sentence',
  deckName: 'Sentences',
  modeLabel: {
    default: 'Sentences',
    new: 'New Cards',
    due: 'Due Cards',
  },
  fetchFunctions: {
    fetchAvailable: fetchAvailableSentenceCards,
    fetchDue: fetchDueSentenceCards,
    fetchNew: fetchNewSentenceCards,
  },
  CardComponent: SentenceCardFront,
};
