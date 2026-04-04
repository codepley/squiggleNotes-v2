/**
 * MediaRecorder wrapper for audio capture.
 * Returns a clean interface consumed by useAudioRecorder hook.
 */

export interface RecorderOptions {
  onDataAvailable?: (blob: Blob) => void;
  onStop?: (blob: Blob) => void;
  mimeType?: string;
}

export class AudioRecorderManager {
  private mediaRecorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private stream: MediaStream | null = null;

  async start(options: RecorderOptions = {}): Promise<void> {
    this.chunks = [];
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    const mimeType =
      options.mimeType ??
      (MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4');

    this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) {
        this.chunks.push(e.data);
        options.onDataAvailable?.(e.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.chunks, { type: mimeType });
      options.onStop?.(blob);
      this.cleanup();
    };

    this.mediaRecorder.start(1000); // collect chunks every 1s
  }

  stop(): void {
    this.mediaRecorder?.stop();
  }

  pause(): void {
    if (this.mediaRecorder?.state === 'recording') {
      this.mediaRecorder.pause();
    }
  }

  resume(): void {
    if (this.mediaRecorder?.state === 'paused') {
      this.mediaRecorder.resume();
    }
  }

  get state(): RecordingState | null {
    return this.mediaRecorder?.state ?? null;
  }

  private cleanup(): void {
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    this.mediaRecorder = null;
  }
}

/**
 * Upload audio blob to /api/audio.
 * Returns the stored audio URL.
 */
export async function uploadAudioBlob(blob: Blob, noteId: string): Promise<string> {
  const formData = new FormData();
  formData.append('audio', blob, `note_${noteId}.webm`);
  formData.append('noteId', noteId);

  const res = await fetch('/api/audio', { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Audio upload failed');

  const { data } = await res.json();
  return data.url as string;
}
