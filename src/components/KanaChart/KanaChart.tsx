/**
 * KanaChart Component
 * Displays a full hiragana or katakana chart with romaji
 */

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface KanaChartProps {
  type: 'hiragana' | 'katakana';
}

// Hiragana chart data
const hiraganaChart = [
  { romaji: 'a', kana: 'あ' }, { romaji: 'i', kana: 'い' }, { romaji: 'u', kana: 'う' }, { romaji: 'e', kana: 'え' }, { romaji: 'o', kana: 'お' },
  { romaji: 'ka', kana: 'か' }, { romaji: 'ki', kana: 'き' }, { romaji: 'ku', kana: 'く' }, { romaji: 'ke', kana: 'け' }, { romaji: 'ko', kana: 'こ' },
  { romaji: 'sa', kana: 'さ' }, { romaji: 'shi', kana: 'し' }, { romaji: 'su', kana: 'す' }, { romaji: 'se', kana: 'せ' }, { romaji: 'so', kana: 'そ' },
  { romaji: 'ta', kana: 'た' }, { romaji: 'chi', kana: 'ち' }, { romaji: 'tsu', kana: 'つ' }, { romaji: 'te', kana: 'て' }, { romaji: 'to', kana: 'と' },
  { romaji: 'na', kana: 'な' }, { romaji: 'ni', kana: 'に' }, { romaji: 'nu', kana: 'ぬ' }, { romaji: 'ne', kana: 'ね' }, { romaji: 'no', kana: 'の' },
  { romaji: 'ha', kana: 'は' }, { romaji: 'hi', kana: 'ひ' }, { romaji: 'fu', kana: 'ふ' }, { romaji: 'he', kana: 'へ' }, { romaji: 'ho', kana: 'ほ' },
  { romaji: 'ma', kana: 'ま' }, { romaji: 'mi', kana: 'み' }, { romaji: 'mu', kana: 'む' }, { romaji: 'me', kana: 'め' }, { romaji: 'mo', kana: 'も' },
  { romaji: 'ya', kana: 'や' }, { romaji: '', kana: '' }, { romaji: 'yu', kana: 'ゆ' }, { romaji: '', kana: '' }, { romaji: 'yo', kana: 'よ' },
  { romaji: 'ra', kana: 'ら' }, { romaji: 'ri', kana: 'り' }, { romaji: 'ru', kana: 'る' }, { romaji: 're', kana: 'れ' }, { romaji: 'ro', kana: 'ろ' },
  { romaji: 'wa', kana: 'わ' }, { romaji: '', kana: '' }, { romaji: '', kana: '' }, { romaji: '', kana: '' }, { romaji: 'wo', kana: 'を' },
  { romaji: 'n', kana: 'ん' }, { romaji: '', kana: '' }, { romaji: '', kana: '' }, { romaji: '', kana: '' }, { romaji: '', kana: '' },
];

// Katakana chart data
const katakanaChart = [
  { romaji: 'a', kana: 'ア' }, { romaji: 'i', kana: 'イ' }, { romaji: 'u', kana: 'ウ' }, { romaji: 'e', kana: 'エ' }, { romaji: 'o', kana: 'オ' },
  { romaji: 'ka', kana: 'カ' }, { romaji: 'ki', kana: 'キ' }, { romaji: 'ku', kana: 'ク' }, { romaji: 'ke', kana: 'ケ' }, { romaji: 'ko', kana: 'コ' },
  { romaji: 'sa', kana: 'サ' }, { romaji: 'shi', kana: 'シ' }, { romaji: 'su', kana: 'ス' }, { romaji: 'se', kana: 'セ' }, { romaji: 'so', kana: 'ソ' },
  { romaji: 'ta', kana: 'タ' }, { romaji: 'chi', kana: 'チ' }, { romaji: 'tsu', kana: 'ツ' }, { romaji: 'te', kana: 'テ' }, { romaji: 'to', kana: 'ト' },
  { romaji: 'na', kana: 'ナ' }, { romaji: 'ni', kana: 'ニ' }, { romaji: 'nu', kana: 'ヌ' }, { romaji: 'ne', kana: 'ネ' }, { romaji: 'no', kana: 'ノ' },
  { romaji: 'ha', kana: 'ハ' }, { romaji: 'hi', kana: 'ヒ' }, { romaji: 'fu', kana: 'フ' }, { romaji: 'he', kana: 'ヘ' }, { romaji: 'ho', kana: 'ホ' },
  { romaji: 'ma', kana: 'マ' }, { romaji: 'mi', kana: 'ミ' }, { romaji: 'mu', kana: 'ム' }, { romaji: 'me', kana: 'メ' }, { romaji: 'mo', kana: 'モ' },
  { romaji: 'ya', kana: 'ヤ' }, { romaji: '', kana: '' }, { romaji: 'yu', kana: 'ユ' }, { romaji: '', kana: '' }, { romaji: 'yo', kana: 'ヨ' },
  { romaji: 'ra', kana: 'ラ' }, { romaji: 'ri', kana: 'リ' }, { romaji: 'ru', kana: 'ル' }, { romaji: 're', kana: 'レ' }, { romaji: 'ro', kana: 'ロ' },
  { romaji: 'wa', kana: 'ワ' }, { romaji: '', kana: '' }, { romaji: '', kana: '' }, { romaji: '', kana: '' }, { romaji: 'wo', kana: 'ヲ' },
  { romaji: 'n', kana: 'ン' }, { romaji: '', kana: '' }, { romaji: '', kana: '' }, { romaji: '', kana: '' }, { romaji: '', kana: '' },
];

export const KanaChart: React.FC<KanaChartProps> = ({ type }) => {
  const chartData = type === 'hiragana' ? hiraganaChart : katakanaChart;
  const title = type === 'hiragana' ? 'Hiragana Chart' : 'Katakana Chart';

  return (
    <div className="w-full max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 gap-2">
            {chartData.map((item, index) => (
              <div
                key={index}
                className={`
                  aspect-square flex flex-col items-center justify-center
                  rounded-lg border-2 transition-all
                  ${item.kana ? 'border-border bg-card hover:bg-accent hover:border-primary cursor-pointer' : 'border-transparent'}
                `}
              >
                {item.kana && (
                  <>
                    <div className="text-3xl font-bold mb-1">{item.kana}</div>
                    <div className="text-xs text-muted-foreground">{item.romaji}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KanaChart;

