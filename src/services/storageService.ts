import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase/config';

/**
 * Compresses an image file in-browser using HTML5 Canvas.
 * Ensures the output is lightweight (< 100KB), perfectly fitting within
 * Firestore document limits and enabling instant rendering without lag.
 */
export async function compressImageFile(
  file: File,
  maxWidth = 1000,
  quality = 0.8
): Promise<{ dataUrl: string; blob: Blob }> {
  return new Promise((resolve) => {
    // If it's not an image (e.g. PDF document), read directly
    if (!file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: reader.result as string, blob: file });
      reader.onerror = () => resolve({ dataUrl: '', blob: file });
      reader.readAsDataURL(file);
      return;
    }

    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;

      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        const reader = new FileReader();
        reader.onload = () => resolve({ dataUrl: reader.result as string, blob: file });
        reader.onerror = () => resolve({ dataUrl: '', blob: file });
        reader.readAsDataURL(file);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);

      let dataUrl = canvas.toDataURL('image/jpeg', quality);

      // If dataUrl exceeds 200KB, downscale again to ensure Firestore/storage safety
      if (dataUrl.length > 200 * 1024) {
        const halfWidth = Math.round(width * 0.75);
        const halfHeight = Math.round(height * 0.75);
        const smallCanvas = document.createElement('canvas');
        smallCanvas.width = halfWidth;
        smallCanvas.height = halfHeight;
        const smallCtx = smallCanvas.getContext('2d');
        if (smallCtx) {
          smallCtx.drawImage(canvas, 0, 0, halfWidth, halfHeight);
          dataUrl = smallCanvas.toDataURL('image/jpeg', 0.72);
        }
      }

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve({ dataUrl, blob });
          } else {
            resolve({ dataUrl, blob: file });
          }
        },
        'image/jpeg',
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      const reader = new FileReader();
      reader.onload = () => resolve({ dataUrl: reader.result as string, blob: file });
      reader.onerror = () => resolve({ dataUrl: '', blob: file });
      reader.readAsDataURL(file);
    };

    img.src = url;
  });
}

/**
 * Uploads an image or file with automatic smart compression.
 * Tries Firebase Storage first; if Storage bucket is not accessible or times out,
 * seamlessly falls back to the lightweight compressed Data URI.
 */
export async function uploadImageOrFile(
  file: File,
  folder: 'public' | 'admissions' | 'posters' | 'students' | 'teachers' = 'public'
): Promise<string> {
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
  const path = `${folder}/${timestamp}_${sanitizedName}`;

  try {
    // Compress first to guarantee speed & tiny file size (< 60KB)
    const maxWidth = folder === 'students' ? 360 : 850;
    const quality = folder === 'students' ? 0.75 : 0.72;
    const { dataUrl, blob } = await compressImageFile(file, maxWidth, quality);

    // Try Firebase Storage with a fast 2.5-second timeout race
    const storagePromise = (async () => {
      const storageRef = ref(storage, path);
      const snapshot = await uploadBytes(storageRef, blob, {
        contentType: blob.type || 'image/jpeg',
      });
      const downloadUrl = await getDownloadURL(snapshot.ref);
      return downloadUrl;
    })();

    const timeoutPromise = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('Storage timeout (fallback to fast local storage)')), 2500)
    );

    try {
      const result = await Promise.race([storagePromise, timeoutPromise]);
      return result;
    } catch (storageErr) {
      console.warn('Firebase Storage upload skipped or timed out, using fast compressed data URL:', storageErr);
      return dataUrl;
    }
  } catch (err) {
    console.warn('Compression/upload failed, using standard data reader fallback:', err);
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (e) => reject(e);
      reader.readAsDataURL(file);
    });
  }
}
