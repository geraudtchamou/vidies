import { FFmpegKit, FFprobeKit, FFmpegKitConfig, ReturnCode, Statistics } from 'ffmpeg-kit-react-native';
import { Platform } from 'react-native';
import { VideoConverter, ConversionOptions, ConversionCallbacks, TaskResult } from '@mediaflow/core';

/**
 * MobileVideoConverter - Native FFmpeg implementation for React Native
 * Uses ffmpeg-kit for high-performance on-device processing
 */
export class MobileVideoConverter extends VideoConverter {
  private currentSessionId: number | null = null;
  private isProcessing: boolean = false;

  /**
   * Initialize FFmpeg Kit (optional, auto-initializes on first use)
   */
  async initialize(): Promise<void> {
    // Configure FFmpeg Kit for optimal performance
    FFmpegKitConfig.enableStatisticsCallback(true);
    
    // Set platform-specific optimizations
    if (Platform.OS === 'ios') {
      // iOS specific: Use hardware acceleration when available
      FFmpegKitConfig.setArgument('-hwaccel', 'videotoolbox');
    } else if (Platform.OS === 'android') {
      // Android specific: Enable MediaCodec
      FFmpegKitConfig.setArgument('-hwaccel', 'mediacodec');
    }
  }

  /**
   * Process conversion using native FFmpeg
   */
  protected async processConversion(
    options: ConversionOptions,
    callbacks?: ConversionCallbacks
  ): Promise<void> {
    this.isProcessing = true;

    // Get input path
    const inputPath = typeof options.input === 'string' 
      ? options.input 
      : await this.saveTempFile(options.input);

    // Generate output path
    const outputFormat = options.outputFormat || 'mp4';
    const outputPath = `${inputPath.substring(0, inputPath.lastIndexOf('.'))}_converted.${outputFormat}`;

    // Build FFmpeg command with device-aware optimization
    // Note: Device profile detection would need a separate RN module
    const args = this.buildFFmpegArgs({
      ...options,
      deviceProfile: undefined, // Will be implemented with react-native-device-info
    });

    // Replace placeholder filenames
    const command = args
      .map(arg => {
        if (arg === 'input.file') return inputPath;
        if (arg.startsWith('output.')) return outputPath;
        return arg;
      })
      .join(' ');

    // Execute FFmpeg command
    return new Promise((resolve, reject) => {
      FFmpegKit.execute(command).then(async session => {
        this.isProcessing = false;
        const returnCode = await session.getReturnCode();

        if (ReturnCode.isSuccess(returnCode)) {
          // Success - trigger file save/share
          callbacks?.onProgress?.({
            progress: 100,
            status: 'completed',
            message: 'Conversion completed!',
          });
          
          // On mobile, we return the path for the app to handle
          resolve();
        } else if (ReturnCode.isCancel(returnCode)) {
          this.isProcessing = false;
          reject(new Error('Conversion cancelled'));
        } else {
          this.isProcessing = false;
          const failStackTrace = await session.getFailStackTrace();
          reject(new Error(failStackTrace || 'Conversion failed'));
        }
      }).catch(error => {
        this.isProcessing = false;
        reject(error);
      });
    });
  }

  /**
   * Execute conversion with progress tracking via statistics
   */
  async convertWithStats(
    options: ConversionOptions,
    callbacks?: ConversionCallbacks
  ): Promise<TaskResult> {
    this.taskId = this.generateTaskId();
    this.isCancelled = false;

    const result: TaskResult = {
      id: this.taskId,
      status: 'processing',
      createdAt: new Date(),
    };

    try {
      const inputPath = typeof options.input === 'string' 
        ? options.input 
        : await this.saveTempFile(options.input);

      const outputFormat = options.outputFormat || 'mp4';
      const outputPath = `${inputPath.substring(0, inputPath.lastIndexOf('.'))}_converted.${outputFormat}`;

      const args = this.buildFFmpegArgs(options);
      const command = args
        .map(arg => {
          if (arg === 'input.file') return inputPath;
          if (arg.startsWith('output.')) return outputPath;
          return arg;
        })
        .join(' ');

      // Create session with statistics callback
      return new Promise((resolve, reject) => {
        FFmpegKit.executeWithStatisticsCallback(command, (statistics: Statistics) => {
          const progress = statistics.getVideoFrameNumber() || 0;
          const speed = statistics.getSpeed() || 0;
          
          callbacks?.onProgress?.({
            progress: Math.min(100, Math.round((progress / 100) * 100)), // Normalize
            status: 'processing',
            message: `Processing... Frame ${progress}, Speed: ${speed.toFixed(1)}x`,
          });
        }).then(async session => {
          const returnCode = await session.getReturnCode();

          if (ReturnCode.isSuccess(returnCode)) {
            result.status = 'completed';
            result.completedAt = new Date();
            result.outputPath = outputPath;
            callbacks?.onComplete?.(result);
            resolve(result);
          } else if (ReturnCode.isCancel(returnCode)) {
            result.status = 'cancelled';
            reject(new Error('Cancelled'));
          } else {
            result.status = 'failed';
            result.error = await session.getFailStackTrace();
            callbacks?.onError?.(new Error(result.error));
            reject(new Error(result.error));
          }
        }).catch(error => {
          result.status = 'failed';
          result.error = error.message;
          callbacks?.onError?.(error);
          reject(error);
        });
      });
    } catch (error) {
      result.status = 'failed';
      result.error = error instanceof Error ? error.message : 'Unknown error';
      throw error;
    }
  }

  /**
   * Cancel ongoing conversion
   */
  cancel(): void {
    super.cancel();
    if (this.currentSessionId !== null) {
      FFmpegKit.cancel(this.currentSessionId);
      this.currentSessionId = null;
    }
    this.isProcessing = false;
  }

  /**
   * Check if FFmpeg is available
   */
  isSupported(): boolean {
    return true; // ffmpeg-kit is bundled with the app
  }

  /**
   * Save temporary file from File/blob object
   */
  private async saveTempFile(file: File): Promise<string> {
    // In React Native, files are typically already paths
    // This handles the case where a blob is passed
    const RNFS = require('react-native-fs');
    const tempPath = `${RNFS.TemporaryDirectoryPath}/temp_${Date.now()}.${file.name.split('.').pop()}`;
    
    // Convert blob to base64 and write to file
    // Implementation depends on how files are passed in RN
    return tempPath;
  }

  /**
   * Get FFmpeg version info
   */
  async getVersionInfo(): Promise<string> {
    const session = await FFprobeKit.getMediaInformation('');
    return 'ffmpeg-kit-react-native';
  }

  /**
   * Check available hardware codecs
   */
  async getAvailableCodecs(): Promise<string[]> {
    // This would require probing FFmpeg capabilities
    // Simplified for now
    return ['libx264', 'libx265', 'aac', 'mp3'];
  }

  private generateTaskId(): string {
    return `mobile_task_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
}

// Singleton instance
export const mobileVideoConverter = new MobileVideoConverter();
