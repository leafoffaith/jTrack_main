import { SuperMemoItem } from 'supermemo'

export interface FlashcardItem extends SuperMemoItem {
  front: string
  back?: string
  kanjiBack?: {
    meaning: [],
    kun_readings: [],
    on_readings: [],
    name_readings: [],
    stroke_count: number
  }
  options?: []
  dueDate?: string;
  key? : any;
}
