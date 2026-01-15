interface KanjiEntry {
  kanji: string;
  onyomi: string[];
  kunyomi: string[];
  meanings: string[];
  jlptLevel: "N5" | "N4" | "N3" | null;
  frequency?: number;
}

export function parseKanjiBank(_data: any[]): KanjiEntry[] {
  // TODO: Implement kanji bank parsing
  return [];
}

export function filterByJLPT(
  entries: KanjiEntry[],
  level: string
): KanjiEntry[] {
  // TODO: Implement JLPT filtering
  return entries.filter(entry => entry.jlptLevel === level);
}
