import { Component, Input, ViewEncapsulation, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { EditorJSData } from '../types/editorjs.types';

@Component({
  selector: 'app-block-renderer',
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="editorjs-renderer prose prose-stone prose-lg md:prose-xl
                prose-headings:font-serif prose-headings:font-bold
                prose-p:text-stone-600 prose-p:leading-loose
                prose-a:text-gold-600 hover:prose-a:text-gold-500
                prose-img:rounded-xl prose-img:shadow-lg
                prose-code:bg-stone-100 prose-code:text-stone-800
                prose-pre:bg-stone-900 prose-pre:text-stone-100
                max-w-none">
      @if (content()) {
        @for (block of content()!.blocks; track block.id || $index) {
          @switch (block.type) {
            @case ('header') {
              <div [innerHTML]="renderHeader(block)"></div>
            }
            @case ('paragraph') {
              <div [innerHTML]="renderParagraph(block)"></div>
            }
            @case ('list') {
              <div [innerHTML]="renderList(block)"></div>
            }
            @case ('image') {
              <div [innerHTML]="renderImage(block)"></div>
            }
            @case ('code') {
              <div [innerHTML]="renderCode(block)"></div>
            }
            @case ('quote') {
              <div [innerHTML]="renderQuote(block)"></div>
            }
            @case ('delimiter') {
              <div [innerHTML]="renderDelimiter()"></div>
            }
            @case ('table') {
              <div [innerHTML]="renderTable(block)"></div>
            }
            @case ('embed') {
              <div [innerHTML]="renderEmbed(block)"></div>
            }
            @default {
              <!-- Unknown block type -->
              <div class="text-stone-400 text-sm italic">
                Unsupported block type: {{ block.type }}
              </div>
            }
          }
        }
      } @else {
        <p class="text-stone-400 italic">No content available</p>
      }
    </div>
  `,
  styles: [`
    .editorjs-renderer .ce-delimiter {
      text-align: center;
      line-height: 1.6em;
      margin: 2rem 0;
    }

    .editorjs-renderer .ce-delimiter::before {
      content: '***';
      display: inline-block;
      font-size: 30px;
      line-height: 65px;
      height: 30px;
      letter-spacing: 0.2em;
      color: #D6D3D1;
    }

    .editorjs-renderer table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
    }

    .editorjs-renderer table td,
    .editorjs-renderer table th {
      border: 1px solid #e7e7e7;
      padding: 8px 12px;
    }

    .editorjs-renderer table th {
      background-color: #f5f5f5;
      font-weight: 600;
    }

    .editorjs-renderer .image-caption {
      text-align: center;
      font-size: 0.9rem;
      color: #666;
      margin-top: 0.5rem;
    }

    .editorjs-renderer .embed-container {
      position: relative;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
      height: 0;
      overflow: hidden;
      margin: 2rem 0;
    }

    .editorjs-renderer .embed-container iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: 0;
    }

    .editorjs-renderer blockquote {
      border-left: 4px solid #D97706;
      padding-left: 1.5rem;
      font-style: italic;
      margin: 1.5rem 0;
    }
  `]
})
export class BlockRendererComponent {
  @Input() set data(value: EditorJSData | null | undefined) {
    this.content.set(value || null);
  }

  content = signal<EditorJSData | null>(null);

  constructor(private sanitizer: DomSanitizer) {}

  private sanitize(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  renderHeader(block: any): SafeHtml {
    const level = block.data.level || 2;
    const text = block.data.text || '';
    return this.sanitize(`<h${level}>${text}</h${level}>`);
  }

  renderParagraph(block: any): SafeHtml {
    const text = block.data.text || '';
    return this.sanitize(`<p>${text}</p>`);
  }

  renderList(block: any): SafeHtml {
    const style = block.data.style || 'unordered';
    const items = block.data.items || [];
    const tag = style === 'ordered' ? 'ol' : 'ul';
    const listItems = items.map((item: string) => `<li>${item}</li>`).join('');
    return this.sanitize(`<${tag}>${listItems}</${tag}>`);
  }

  renderImage(block: any): SafeHtml {
    const url = block.data.file?.url || '';
    const caption = block.data.caption || '';
    const withBorder = block.data.withBorder ? 'border border-stone-200' : '';
    const stretched = block.data.stretched ? 'w-full' : 'max-w-full mx-auto';
    const withBackground = block.data.withBackground ? 'bg-stone-50 p-4' : '';

    let html = `<figure class="${withBackground}">
      <img src="${url}" alt="${caption}" class="${stretched} ${withBorder} rounded-lg" loading="lazy" />`;

    if (caption) {
      html += `<figcaption class="image-caption">${caption}</figcaption>`;
    }

    html += `</figure>`;
    return this.sanitize(html);
  }

  renderCode(block: any): SafeHtml {
    const code = block.data.code || '';
    // Escape HTML in code
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');

    return this.sanitize(`<pre><code>${escapedCode}</code></pre>`);
  }

  renderQuote(block: any): SafeHtml {
    const text = block.data.text || '';
    const caption = block.data.caption || '';
    const alignment = block.data.alignment || 'left';

    let html = `<blockquote class="text-${alignment}">
      <p>${text}</p>`;

    if (caption) {
      html += `<cite>— ${caption}</cite>`;
    }

    html += `</blockquote>`;
    return this.sanitize(html);
  }

  renderDelimiter(): SafeHtml {
    return this.sanitize(`<div class="ce-delimiter"></div>`);
  }

  renderTable(block: any): SafeHtml {
    const content = block.data.content || [];
    const withHeadings = block.data.withHeadings || false;

    let html = '<table>';

    content.forEach((row: string[], index: number) => {
      const tag = withHeadings && index === 0 ? 'th' : 'td';
      const rowHtml = row.map(cell => `<${tag}>${cell}</${tag}>`).join('');
      html += `<tr>${rowHtml}</tr>`;
    });

    html += '</table>';
    return this.sanitize(html);
  }

  renderEmbed(block: any): SafeHtml {
    const embed = block.data.embed || '';
    const caption = block.data.caption || '';

    let html = `<div class="embed-container">
      ${embed}
    </div>`;

    if (caption) {
      html += `<p class="image-caption">${caption}</p>`;
    }

    return this.sanitize(html);
  }
}
