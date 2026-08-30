/**
 * Utilitaire de compression vidéo côté client (navigateur)
 * Utilise l'API MediaRecorder pour réduire la taille des vidéos avant upload.
 * 
 * Usage dans un composant Angular:
 *   const compressedFile = await VideoCompressor.compress(file, { maxMB: 25 });
 */

export interface CompressionOptions {
  maxMB?: number;        // Taille cible en MB (défaut: 25)
  maxWidth?: number;     // Largeur max (défaut: 1280)
  maxHeight?: number;    // Hauteur max (défaut: 720)
  quality?: number;      // 0.0 à 1.0 (défaut: 0.7)
}

export class VideoCompressor {
  
  /**
   * Compresse un fichier vidéo pour qu'il soit sous la taille cible.
   * Retourne le fichier original si déjà assez petit.
   */
  static async compress(file: File, options: CompressionOptions = {}): Promise<File> {
    const { maxMB = 25, quality = 0.7 } = options;
    
    // Si le fichier est déjà sous la limite, pas besoin de compresser
    if (file.size <= maxMB * 1024 * 1024) {
      return file;
    }

    // Vérifier si c'est une vidéo
    if (!file.type.startsWith('video/')) {
      return file;
    }

    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.muted = true;
      video.playsInline = true;

      const url = URL.createObjectURL(file);
      video.src = url;

      video.onloadedmetadata = () => {
        // Calculer le bitrate cible pour atteindre la taille souhaitée
        const duration = video.duration;
        const targetSizeBits = maxMB * 1024 * 1024 * 8 * 0.9; // 90% de la marge
        const targetBitrate = Math.floor(targetSizeBits / duration);
        
        // Limiter le bitrate (min 500kbps, max 4Mbps)
        const bitrate = Math.max(500000, Math.min(targetBitrate, 4000000));
        
        // Canvas pour le redimensionnement
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculer les dimensions (max 720p)
        let { videoWidth: w, videoHeight: h } = video;
        const maxDim = 1280;
        if (w > maxDim || h > maxDim) {
          const ratio = Math.min(maxDim / w, maxDim / h);
          w = Math.floor(w * ratio);
          h = Math.floor(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;

        // MediaRecorder pour la compression
        const stream = canvas.captureStream(30);
        
        // Ajouter l'audio si présent
        if ((video as any).captureStream) {
          const videoStream = (video as any).captureStream();
          const audioTracks = videoStream.getAudioTracks();
          audioTracks.forEach((track: MediaStreamTrack) => stream.addTrack(track));
        }

        const mimeType = this.getSupportedMimeType();
        const mediaRecorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: bitrate,
        });

        const chunks: Blob[] = [];
        mediaRecorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunks.push(e.data);
        };

        mediaRecorder.onstop = () => {
          URL.revokeObjectURL(url);
          const blob = new Blob(chunks, { type: mimeType });
          const ext = mimeType.includes('webm') ? 'webm' : 'mp4';
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^.]+$/, `_compressed.${ext}`),
            { type: mimeType }
          );
          
          console.log(`📹 Compression: ${(file.size / 1024 / 1024).toFixed(1)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(1)}MB`);
          resolve(compressedFile);
        };

        mediaRecorder.onerror = (e: any) => {
          URL.revokeObjectURL(url);
          reject(new Error(`Erreur MediaRecorder: ${e.error?.message || e.message}`));
        };

        // Démarrer l'enregistrement
        mediaRecorder.start();
        video.play();

        video.onended = () => {
          mediaRecorder.stop();
        };

        // Timeout de sécurité (2x la durée de la vidéo)
        setTimeout(() => {
          if (mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
          }
        }, duration * 2 * 1000);
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('Impossible de charger la vidéo pour compression'));
      };
    });
  }

  /**
   * Retourne le MIME type supporté par le navigateur
   */
  private static getSupportedMimeType(): string {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm;codecs=vp9',
      'video/webm;codecs=vp8',
      'video/webm',
      'video/mp4;codecs=h264,aac',
      'video/mp4',
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    return 'video/webm'; // Fallback
  }

  /**
   * Estime la taille finale approximative d'une vidéo compressée
   */
  static estimateCompressedSize(durationSec: number, maxMB: number = 25): string {
    const targetBits = maxMB * 1024 * 1024 * 8 * 0.9;
    const bitrate = Math.max(500000, Math.min(targetBits / durationSec, 4000000));
    const estimatedSize = (bitrate * durationSec) / 8 / 1024 / 1024;
    return `~${estimatedSize.toFixed(1)} MB`;
  }
}
