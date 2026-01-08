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
