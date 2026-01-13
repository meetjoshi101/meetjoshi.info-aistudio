export interface EditorJSData {
  time?: number;
  blocks: EditorJSBlock[];
  version?: string;
}

export interface EditorJSBlock {
  id?: string;
  type: string;
  data: any;
}
