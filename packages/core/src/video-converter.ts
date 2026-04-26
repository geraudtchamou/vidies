import { CompressionProfile } from './compression-profiles';
import { ConversionProgress, TaskResult } from './types';

/**
 * VideoConverter - Abstracts FFmpeg-based conversion and compression
 * Platform-specific implementations will use:
 * - Web: FFmpeg.wasm for client-side processing
 * - Mobile: ffmpeg-kit for native processing
 */

export interface ConversionOptions {
  input: File | string; // Blob/File on web, file path on mobile
  outputFormat?: 'mp4' | 'webm' | 'mkv' | 'mp3' | 'wav' | 'aac' | 'flac' | 'ogg';
  profile?: CompressionProfile;
  customSettings?: {
    codec?: string;
    bitrate?: string;
    resolution?: { width: number; height: number };
    crf?: number;
    preset?: string;
  };
}

export interface ConversionCallbacks {
  onProgress?: (progress: ConversionProgress) => void;
  onComplete?: (result: TaskResult) => void;
  onError?: (error: Error) => void;
}

export abstract class VideoConverter {
  protected taskId: string = '';
  protected isCancelled: boolean = false;

  /**
   * Convert/compress video with specified options
   */
  async convert(options: ConversionOptions, callbacks?: ConversionCallbacks): Promise<TaskResult> {
    this.taskId = this.generateTaskId();
    this.isCancelled = false;

    const result: TaskResult = {
      id: this.taskId,
      status: 'processing',
      createdAt: new Date()
    };

    try {
      await this.processConversion(options, callbacks);
      
      result.status = 'completed';
      result.completedAt = new Date();
      callbacks?.onComplete?.(result);
    } catch (error) {
      if (this.isCancelled) {
        result.status = 'cancelled';
      } else {
        result.status = 'failed';
        result.error = error instanceof Error ? error.message : 'Unknown error';
      }
      callbacks?.onError?.(error as Error);
    }

    return result;
  }

  /**
   * Cancel ongoing conversion
   */
  cancel(): void {
    this.isCancelled = true;
  }

  /**
   * Extract audio from video
   */
  async extractAudio(
    input: File | string,
    format: 'mp3' | 'wav' | 'aac' | 'flac' | 'ogg',
    bitrate: string,
    callbacks?: ConversionCallbacks
  ): Promise<TaskResult> {
    return this.convert(
      {
        input,
        outputFormat: format,
        customSettings: {
          bitrate
        }
      },
      callbacks
    );
  }

  /**
   * Compress video using a preset profile
   */
  async compress(
    input: File | string,
    profile: CompressionProfile,
    callbacks?: ConversionCallbacks
  ): Promise<TaskResult> {
    return this.convert(
      {
        input,
        profile
      },
      callbacks
    );
  }

  /**
   * Build FFmpeg command arguments based on options
   */
  protected buildFFmpegArgs(options: ConversionOptions): string[] {
    const args: string[] = [];
    
    // Input file
    args.push('-i', typeof options.input === 'string' ? options.input : 'input.file');

    // Output format
    if (options.outputFormat) {
      switch (options.outputFormat) {
        case 'mp3':
        case 'wav':
        case 'aac':
        case 'flac':
        case 'ogg':
          // Audio extraction
          args.push('-vn'); // No video
          break;
        default:
          // Video formats
          break;
      }
    }

    // Profile settings
    if (options.profile) {
      const { profile } = options;
      
      // Codec
      if (profile.codec === 'h264') {
        args.push('-c:v', 'libx264');
      } else if (profile.codec === 'h265') {
        args.push('-c:v', 'libx265');
      } else if (profile.codec === 'av1') {
        args.push('-c:v', 'libaom-av1');
      }

      // CRF (quality)
      if (profile.crf !== undefined) {
        args.push('-crf', profile.crf.toString());
      }

      // Preset (speed vs compression)
      if (profile.preset) {
        args.push('-preset', profile.preset);
      }

      // Bitrate
      if (profile.bitrate) {
        args.push('-b:v', profile.bitrate);
      }

      // Audio bitrate
      if (profile.audioBitrate) {
        args.push('-b:a', profile.audioBitrate);
      }

      // Resolution
      if (profile.resolution) {
        args.push('-vf', `scale=${profile.resolution.width}:${profile.resolution.height}`);
      }
    }

    // Custom settings override profile
    if (options.customSettings) {
      const { customSettings } = options;
      
      if (customSettings.codec) {
        args.push('-c:v', customSettings.codec);
      }
      if (customSettings.bitrate) {
        args.push('-b:v', customSettings.bitrate);
      }
      if (customSettings.crf !== undefined) {
        args.push('-crf', customSettings.crf.toString());
      }
      if (customSettings.preset) {
        args.push('-preset', customSettings.preset);
      }
      if (customSettings.resolution) {
        args.push('-vf', `scale=${customSettings.resolution.width}:${customSettings.resolution.height}`);
      }
    }

    // Output file
    args.push('output.' + (options.outputFormat || 'mp4'));

    return args;
  }

  /**
   * Abstract method to be implemented by platform-specific converters
   */
  protected abstract processConversion(
    options: ConversionOptions,
    callbacks?: ConversionCallbacks
  ): Promise<void>;

  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Export for use in platform-specific implementations
export { VideoConverter as BaseVideoConverter };
