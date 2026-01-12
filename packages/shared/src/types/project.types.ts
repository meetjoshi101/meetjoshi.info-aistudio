import { EditorJSData } from './editorjs.types';

export interface Project {
  id: string;
  slug: string;
  title: string;
  client?: string;
  year?: string;
  description: string;
  category: string;
  technologies: string[];
  imageUrl: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  content?: EditorJSData | null;
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateProjectDto {
  slug: string;
  title: string;
  client?: string;
  year?: string;
  description: string;
  category: string;
  technologies: string[];
  imageUrl: string;
  challenge?: string;
  solution?: string;
  outcome?: string;
  content?: EditorJSData | null;
  published?: boolean;
}

export interface UpdateProjectDto extends Partial<CreateProjectDto> {}
