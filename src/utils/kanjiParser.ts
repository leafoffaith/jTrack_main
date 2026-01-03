interface KanjiEntry {
  kanji: string;
  onyomi: string[];
  kunyomi: string[];
  meanings: string[];
  jlptLevel: "N5" | "N4" | "N3" | null;
  frequency?: number;
}

export function parseKanjiBank(data: any[]): KanjiEntry[];
export function filterByJLPT(
  entries: KanjiEntry[],
  level: string
): KanjiEntry[];
