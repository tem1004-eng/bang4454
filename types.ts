export interface Field {
  id: string;
  value: string;
  top: string;
  left: string;
  width: string;
  height: string;
  placeholder: string;
  fontFamily: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
  color: string;
  checkedLines?: number[]; // Stores indices of lines that are checked
}

export interface Page {
  id: number;
  imageUrl: string;
  fields: Field[];
}

export interface Point {
  x: number;
  y: number;
}

export interface Path {
  points: Point[];
  color: string;
  lineWidth: number;
  mode: 'pen' | 'eraser';
}

export type Tool = 'pen' | 'eraser' | 'select';

export interface ScriptManifestItem {
  date: string;
  topic: string;
}

export interface SavedScriptData {
  broadcastDate: string;
  broadcastTopic: string;
  pages: Page[];
  drawings: Record<number, Path[]>;
}