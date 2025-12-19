import { SuperMemoItem } from 'supermemo'

export interface FlashcardItem extends SuperMemoItem {
  front: string
  back?: string
  kanjiBack?: {
    meaning: string[],
    kun_readings: string[],
    on_readings: string[],
    name_readings: string[],
    stroke_count: number
  }
  options?: []
  due_date?: string;
  _userID?: number;
}
