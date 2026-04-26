import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL } from '@ffmpeg/util';
import { VideoConverter, ConversionOptions, ConversionCallbacks, TaskResult } from '@mediaflow/core';
import { deviceDetector, DeviceProfile } from '@mediaflow/core';

/**
 * WebVideoConverter - FFmpeg.wasm implementation for browser-based processing
 * Processes videos entirely client-side for privacy
 */
export class WebVideoConverter extends VideoConverter {
  private ffmpeg: FFmpeg | null = null;
  private isInitialized: boolean = false;
  private deviceProfile: DeviceProfile | null = null;

  /**
   * Initialize FFmpeg.wasm with optimal settings based on device capabilities
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    // Detect device capabilities first
    this.deviceProfile = await deviceDetector.detect();

    this.ffmpeg = new FFmpeg();

    // Check if SharedArrayBuffer is available (required for multi-threading)
    const useMultiThread = this.deviceProfile.supportsSharedArrayBuffer;

    // Load FFmpeg.wasm from CDN
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm';
    
    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: useMultiThread 
        ? await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript')
        : undefined,
    });

    // Set optimal thread count based on CPU cores
    if (useMultiThread && this.deviceProfile.cpuCores > 1) {
      const threads = Math.max(1, this.deviceProfile.cpuCores - 1);
      await this.ffmpeg?.setLogLevel(0); // Silent mode for performance
    }

    this.isInitialized = true;
  }

  /**
   * Process conversion using FFmpeg.wasm
   */
  protected async processConversion(
    options: ConversionOptions,
    callbacks?: ConversionCallbacks
  ): Promise<void> {
    if (!this.ffmpeg || !this.isInitialized) {
      await this.initialize();
    }

    if (!this.ffmpeg) {
      throw new Error('FFmpeg not initialized');
    }

    // Write input file to virtual filesystem
    const inputData = await this.readFileData(options.input);
    const inputFilename = `input_${Date.now()}`;
    const outputFilename = `output_${Date.now()}.${options.outputFormat || 'mp4'}`;

    await this.ffmpeg.writeFile(inputFilename, inputData);

    // Build FFmpeg arguments with device-aware optimization
    const args = this.buildFFmpegArgs({
      ...options,
      deviceProfile: this.deviceProfile || undefined,
    });

    // Replace input/output filenames for virtual FS
    const processedArgs = args.map(arg => {
      if (arg === 'input.file' || arg.includes('input.file')) {
        return inputFilename;
      }
      if (arg.startsWith('output.')) {
        return outputFilename;
      }
      return arg;
    });

    // Execute FFmpeg command with progress monitoring
    let lastProgress = 0;

    this.ffmpeg.on('progress', ({ progress, time }) => {
      const progressPercent = Math.round(progress * 100);
      
      if (progressPercent !== lastProgress) {
        lastProgress = progressPercent;
        callbacks?.onProgress?.({
          progress: progressPercent,
          status: 'processing',
          message: `Processing... ${progressPercent}%`,
          estimatedTimeRemaining: this.calculateETA(progressPercent),
        });
      }
    });

    try {
      await this.ffmpeg.exec(processedArgs);

      // Read output file
      const outputData = await this.ffmpeg.readFile(outputFilename);
      
      // Create download blob
      const blob = new Blob([outputData], { 
        type: this.getMimeType(options.outputFormat || 'mp4') 
      });

      // Trigger download or return result
      this.triggerDownload(blob, outputFilename);

      // Cleanup virtual filesystem
      await this.ffmpeg.deleteFile(inputFilename);
      await this.ffmpeg.deleteFile(outputFilename);

    } catch (error) {
      // Cleanup on error
      try {
        await this.ffmpeg.deleteFile(inputFilename);
        await this.ffmpeg.deleteFile(outputFilename);
      } catch {}
      throw error;
    }
  }

  /**
   * Cancel ongoing conversion
   */
  cancel(): void {
    super.cancel();
    // FFmpeg.wasm doesn't support true cancellation, but we can stop processing
    if (this.ffmpeg) {
      this.ffmpeg.terminate();
      this.isInitialized = false;
    }
  }

  /**
   * Check if FFmpeg.wasm is supported in this browser
   */
  isSupported(): boolean {
    return typeof WebAssembly !== 'undefined' && 
           typeof SharedArrayBuffer !== 'undefined';
  }

  /**
   * Get detected device profile for UI display
   */
  getDeviceProfile(): DeviceProfile | null {
    return this.deviceProfile;
  }

  /**
   * Estimate time remaining based on current progress
   */
  private calculateETA(progressPercent: number): number | null {
    // Simple estimation - can be improved with historical data
    if (progressPercent <= 0) return null;
    
    const elapsed = Date.now();
    const totalEstimated = (elapsed / progressPercent) * 100;
    const remaining = totalEstimated - elapsed;
    
    return Math.max(0, remaining);
  }

  /**
   * Read file data from File object or path
   */
  private async readFileData(input: File | string): Promise<Uint8Array> {
    if (input instanceof File) {
      const arrayBuffer = await input.arrayBuffer();
      return new Uint8Array(arrayBuffer);
    }
    throw new Error('File input required for web converter');
  }

  /**
   * Get MIME type for output format
   */
  private getMimeType(format: string): string {
    const mimeTypes: Record<string, string> = {
      mp4: 'video/mp4',
      webm: 'video/webm',
      mkv: 'video/x-matroska',
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      aac: 'audio/aac',
      flac: 'audio/flac',
      ogg: 'audio/ogg',
    };
    return mimeTypes[format] || 'application/octet-stream';
  }

  /**
   * Trigger browser download
   */
  private triggerDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}

// Singleton instance
export const webVideoConverter = new WebVideoConverter();
