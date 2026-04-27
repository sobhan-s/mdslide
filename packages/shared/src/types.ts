export type SlideType =
  | 'title'
  | 'bullets'
  | 'content'
  | 'code'
  | 'visual'
  | 'table'
  | 'quote'
  | 'statement';

export interface SlideNode {
  type: string;
  value?: string;
  children?: SlideNode[];
  lang?: string;
  ordered?: boolean;
  url?: string;
  alt?: string;
  header?: boolean;
}

export interface Slide {
  id: string;
  type: SlideType;
  title?: string;
  content: SlideNode[];
  notes?: string;
  layoutOverride?: string;
}

export interface SlideDeck {
  meta: Record<string, unknown>;
  slides: Slide[];
}
