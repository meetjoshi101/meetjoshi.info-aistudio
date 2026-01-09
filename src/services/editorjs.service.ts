import { Injectable, inject } from '@angular/core';
import EditorJS, { EditorConfig, OutputData } from '@editorjs/editorjs';
// @ts-ignore - EditorJS plugins don't always have perfect types
import Header from '@editorjs/header';
// @ts-ignore
import List from '@editorjs/list';
// @ts-ignore
import Image from '@editorjs/image';
// @ts-ignore
import Quote from '@editorjs/quote';
// @ts-ignore
import Code from '@editorjs/code';
// @ts-ignore
import Delimiter from '@editorjs/delimiter';
// @ts-ignore
import Table from '@editorjs/table';
// @ts-ignore
import Embed from '@editorjs/embed';
// @ts-ignore
import LinkTool from '@editorjs/link';
// @ts-ignore
import InlineCode from '@editorjs/inline-code';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root'
})
export class EditorJSService {
  private supabaseService = inject(SupabaseService);
  private currentBucket = 'blog-images'; // Default bucket

  /**
   * Set the current storage bucket for image uploads
   * @param bucket - The Supabase storage bucket name
   */
  setImageBucket(bucket: 'project-images' | 'blog-images'): void {
    this.currentBucket = bucket;
  }

  /**
   * Create EditorJS configuration with all plugins
   * @param holderId - ID of the HTML element to mount editor
   * @param data - Initial editor data (optional)
   * @param placeholder - Placeholder text
   * @param readOnly - Read-only mode
   */
  createEditorConfig(
    holderId: string,
    data?: OutputData,
    placeholder: string = 'Start writing your content...',
    readOnly: boolean = false
  ): EditorConfig {
    return {
      holder: holderId,
      data: data,
      placeholder: placeholder,
      readOnly: readOnly,
      minHeight: 300,

      tools: {
        // Header tool (H1-H3)
        header: {
          // @ts-ignore
          class: Header,
          config: {
            levels: [1, 2, 3],
            defaultLevel: 2,
            placeholder: 'Enter a heading'
          },
          inlineToolbar: true
        },

        // Paragraph tool (default, always available)
        paragraph: {
          inlineToolbar: true
        },

        // List tool (ordered/unordered)
        list: {
          // @ts-ignore
          class: List,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered'
          }
        },

        // Image tool with Supabase upload
        image: {
          // @ts-ignore
          class: Image,
          config: {
            uploader: {
              uploadByFile: async (file: File) => {
                return this.uploadImageToSupabase(file);
              }
            },
            captionPlaceholder: 'Enter caption (optional)',
            buttonContent: 'Select image',
            types: 'image/*'
          }
        },

        // Quote tool
        quote: {
          // @ts-ignore
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: 'Quote author'
          }
        },

        // Code block tool
        code: {
          // @ts-ignore
          class: Code,
          config: {
            placeholder: 'Enter code'
          }
        },

        // Inline code tool
        inlineCode: {
          // @ts-ignore
          class: InlineCode
        },

        // Delimiter tool
        // @ts-ignore
        delimiter: Delimiter,

        // Table tool
        table: {
          // @ts-ignore
          class: Table,
          inlineToolbar: true,
          config: {
            rows: 2,
            cols: 3
          }
        },

        // Embed tool (YouTube, Vimeo, etc.)
        embed: {
          // @ts-ignore
          class: Embed,
          config: {
            services: {
              youtube: true,
              vimeo: true,
              coub: true,
              codepen: {
                regex: /https?:\/\/codepen\.io\/([^\/\?\&]*)\/pen\/([^\/\?\&]*)/,
                embedUrl: 'https://codepen.io/<%= remote_id %>?height=300&theme-id=0&default-tab=css,result&embed-version=2',
                html: "<iframe height='300' scrolling='no' frameborder='no' allowtransparency='true' allowfullscreen='true' style='width: 100%;'></iframe>",
                height: 300,
                width: 600,
                id: (groups: string[]) => groups.join('/embed/')
              }
            }
          }
        },

        // Link preview tool
        linkTool: {
          // @ts-ignore
          class: LinkTool,
          config: {
            // Note: Link preview requires a backend endpoint
            // For now, links will work without rich previews
          }
        }
      },

      onReady: () => {
        console.log('EditorJS is ready');
      },

      onChange: (api, event) => {
        // Can be used for auto-save functionality in the future
        console.log('Content changed', event);
      }
    };
  }

  /**
   * Upload image to Supabase storage
   * @param file - Image file to upload
   * @returns Promise with success/failure and URL
   */
  private async uploadImageToSupabase(file: File): Promise<{
    success: 0 | 1;
    file?: { url: string };
    error?: string;
  }> {
    try {
      // Generate unique filename
      const timestamp = Date.now();
      const filename = `${timestamp}-${file.name}`;

      // Upload to Supabase using the current bucket
      const imageUrl = await this.supabaseService.uploadImage(this.currentBucket, file, filename);

      return {
        success: 1,
        file: {
          url: imageUrl
        }
      };
    } catch (error) {
      console.error('Image upload failed:', error);
      return {
        success: 0,
        error: 'Image upload failed'
      };
    }
  }

  /**
   * Initialize EditorJS instance
   * @param config - Editor configuration
   * @returns EditorJS instance
   */
  async initializeEditor(config: EditorConfig): Promise<EditorJS> {
    const editor = new EditorJS(config);
    await editor.isReady;
    return editor;
  }

  /**
   * Save editor data
   * @param editor - EditorJS instance
   * @returns Promise with editor output data
   */
  async saveEditorData(editor: EditorJS): Promise<OutputData> {
    return await editor.save();
  }

  /**
   * Destroy editor instance
   * @param editor - EditorJS instance
   */
  destroyEditor(editor: EditorJS): void {
    if (editor && typeof editor.destroy === 'function') {
      editor.destroy();
    }
  }
}
