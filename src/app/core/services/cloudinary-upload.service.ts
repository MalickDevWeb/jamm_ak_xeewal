import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { firstValueFrom } from 'rxjs';

export interface UploadResult {
  success: boolean;
  url: string;
  duration?: number;
  bytes?: number;
}

@Injectable({ providedIn: 'root' })
export class CloudinaryUploadService {
  constructor(private http: HttpClient) {}

  /**
   * Upload direct vers Cloudinary depuis le navigateur.
   * Le backend génère une signature, puis le fichier va DIRECTEMENT
   * vers Cloudinary sans passer par Vercel → évite le timeout 504.
   */
  async uploadDirect(
    file: File | Blob,
    fileName: string,
    onProgress?: (percent: number) => void
  ): Promise<UploadResult> {
    const isVideo = (file as File).type?.startsWith('video/') ?? false;
    const resourceType = isVideo ? 'video' : 'image';

    // 1. Obtenir la signature du backend (rapide, < 1s)
    const sigData: any = await firstValueFrom(
      this.http.post(`${environment.apiUrl}/upload-signature`, {
        folder: 'jamm_activites',
        resource_type: resourceType,
      })
    );

    if (!sigData.success) {
      throw new Error('Impossible d\'obtenir la signature d\'upload.');
    }

    // 2. Upload direct vers Cloudinary via XHR (pour le suivi de progression)
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${sigData.cloudName}/${resourceType}/upload`;

    const formData = new FormData();
    formData.append('file', file, fileName);
    formData.append('api_key', sigData.apiKey);
    formData.append('timestamp', sigData.timestamp.toString());
    formData.append('signature', sigData.signature);
    formData.append('folder', sigData.folder);
    formData.append('tags', 'public,activite');

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 100);
            onProgress(percent);
          }
        });
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const result = JSON.parse(xhr.responseText);
          resolve({
            success: true,
            url: result.secure_url,
            duration: result.duration,
            bytes: result.bytes,
          });
        } else {
          let message = `Erreur Cloudinary (${xhr.status})`;
          try {
            const err = JSON.parse(xhr.responseText);
            message = err?.error?.message || message;
          } catch {}
          reject(new Error(message));
        }
      };

      xhr.onerror = () => reject(new Error('Erreur réseau lors de l\'upload vers Cloudinary.'));
      xhr.ontimeout = () => reject(new Error('Timeout lors de l\'upload vers Cloudinary.'));

      xhr.open('POST', cloudinaryUrl);
      xhr.send(formData);
    });
  }
}
