import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;

  constructor() {
    this.supabase = createClient(
      environment.supabaseUrl,
      environment.supabaseAnonKey
    );
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  /**
   * Get public URL for a file in storage
   * @param bucket Storage bucket name ('project-images' or 'blog-images')
   * @param path File path in the bucket
   * @returns Public URL to access the file
   */
  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Upload a file to Supabase Storage
   * @param bucket Storage bucket name
   * @param file File to upload
   * @param path Destination path in the bucket
   * @returns Promise with the public URL of the uploaded file
   */
  async uploadImage(bucket: string, file: File, path: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    return this.getPublicUrl(bucket, path);
  }

  /**
   * Delete a file from Supabase Storage
   * @param bucket Storage bucket name
   * @param path File path to delete
   */
  async deleteImage(bucket: string, path: string): Promise<void> {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) {
      throw error;
    }
  }
}
