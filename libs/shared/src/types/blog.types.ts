import { EditorJSData } from './editorjs.types';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: EditorJSData | null;
  date: string;
  category: string;
  readTime: string;
  imageUrl: string;
  author?: string;
  galleryImages?: string[];
  published?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateBlogPostDto {
  slug: string;
  title: string;
  excerpt: string;
  content?: EditorJSData | null;
  date: string;
  category: string;
  readTime: string;
  imageUrl: string;
  author?: string;
  galleryImages?: string[];
  published?: boolean;
}

export interface UpdateBlogPostDto extends Partial<CreateBlogPostDto> {}
