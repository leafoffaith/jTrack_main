import { SuperMemoItem } from 'supermemo'

export interface FlashcardItem extends SuperMemoItem {
  front: string
  back: string
  dueDate?: string;
}
