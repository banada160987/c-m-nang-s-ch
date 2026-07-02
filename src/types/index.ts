export interface Book {
  id: string;
  title: string;
  author: string;
  cat?: string;
  desc?: string;
  age?: string;
  content?: string;
  pdfUrl?: string;
  index?: number; // for staggering animations
}

export interface UserStats {
  minutes: number;
  books: number;
}
