export type SlideType = 'title' | 'bullets' | 'content';

export interface SlideNode {
  type: string;
  value?: string;
  children?: SlideNode[];
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
