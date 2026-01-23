// EditorJS Output Data Structure
export interface EditorJSData {
  time?: number;
  blocks: EditorJSBlock[];
  version?: string;
}

// Generic Block Structure
export interface EditorJSBlock {
  id?: string;
  type: string;
  data: any;
}

// Paragraph Block
export interface ParagraphBlock extends EditorJSBlock {
  type: 'paragraph';
  data: {
    text: string;
  };
}

// Header Block
export interface HeaderBlock extends EditorJSBlock {
  type: 'header';
  data: {
    text: string;
    level: 1 | 2 | 3 | 4 | 5 | 6;
  };
}

// List Block
export interface ListBlock extends EditorJSBlock {
  type: 'list';
  data: {
    style: 'ordered' | 'unordered';
    items: string[];
  };
}

// Image Block
export interface ImageBlock extends EditorJSBlock {
  type: 'image';
  data: {
    file: {
      url: string;
    };
    caption?: string;
    withBorder?: boolean;
    stretched?: boolean;
    withBackground?: boolean;
  };
}

// Code Block
export interface CodeBlock extends EditorJSBlock {
  type: 'code';
  data: {
    code: string;
  };
}

// Quote Block
export interface QuoteBlock extends EditorJSBlock {
  type: 'quote';
  data: {
    text: string;
    caption?: string;
    alignment?: 'left' | 'center';
  };
}

// Delimiter Block
export interface DelimiterBlock extends EditorJSBlock {
  type: 'delimiter';
  data: Record<string, never>; // Empty object
}

// Table Block
export interface TableBlock extends EditorJSBlock {
  type: 'table';
  data: {
    withHeadings?: boolean;
    content: string[][];
  };
}

// Embed Block (YouTube, Vimeo, etc.)
export interface EmbedBlock extends EditorJSBlock {
  type: 'embed';
  data: {
    service: string; // 'youtube' | 'vimeo' | etc.
    source: string;
    embed: string;
    width?: number;
    height?: number;
    caption?: string;
  };
}

// Link Tool Block
export interface LinkToolBlock extends EditorJSBlock {
  type: 'linkTool';
  data: {
    link: string;
    meta: {
      title?: string;
      description?: string;
      image?: {
        url: string;
      };
    };
  };
}
