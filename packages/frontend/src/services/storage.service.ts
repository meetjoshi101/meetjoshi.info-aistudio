import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class StorageService {
  private apiService = inject(ApiService);

  /**
   * Upload a file to storage via backend API
   * @param bucket Storage bucket name ('project-images' or 'blog-images')
   * @param file File to upload
   * @returns Promise with the public URL of the uploaded file
   */
  async uploadImage(bucket: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);

    try {
      const response = await this.apiService.uploadFile<{ success: number; file: { url: string } }>(
        '/storage/upload',
        formData,
        true
      ).toPromise();

      if (!response || response.success !== 1) {
        throw new Error('Upload failed');
      }

      return response.file.url;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    }
  }

  /**
   * Delete a file from storage via backend API
   * @param bucket Storage bucket name
   * @param path File path to delete (filename only, not full URL)
   */
  async deleteImage(bucket: string, path: string): Promise<void> {
    try {
      await this.apiService.delete<{ success: boolean }>(
        `/storage/${bucket}/${path}`,
        true
      ).toPromise();
    } catch (error) {
      console.error('Delete error:', error);
      throw error;
    }
  }
}
