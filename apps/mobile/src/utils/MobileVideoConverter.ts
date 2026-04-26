import { FFmpegKit, FFprobeKit, ReturnCode } from 'ffmpeg-kit-react-native';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import type { VideoConverter, ConversionOptions, ConversionCallbacks, TaskResult } from '@videotools/core';

/**
 * MobileVideoConverter - Native FFmpeg implementation for React Native
 * Uses ffmpeg-kit-react-native for high-performance video processing
 */
export class MobileVideoConverter extends VideoConverter {
  /**
   * Initialize FFmpeg and load necessary libraries
   */
  async initialize(): Promise<void> {
    // FFmpeg Kit auto-initializes on first use
    console.log('FFmpeg Kit initialized');
  }

  /**
   * Process conversion using native FFmpeg
   */
  protected async processConversion(
    options: ConversionOptions,
    callbacks?: ConversionCallbacks
  ): Promise<void> {
    const inputPath = typeof options.input === 'string' 
      ? options.input 
      : await this.saveFileToTemp(options.input);

    const outputPath = `${FileSystem.cacheDirectory}/${this.taskId}_output.${options.outputFormat || 'mp4'}`;
    
    const ffmpegArgs = this.buildFFmpegArgs(options);
    
    // Replace input/output placeholders with actual paths
    const args = ffmpegArgs.map(arg => {
      if (arg === 'input.file') return inputPath;
      if (arg.startsWith('output.')) return outputPath;
      return arg;
    });

    const command = args.join(' ');

    return new Promise((resolve, reject) => {
      FFmpegKit.execute(command).then(async (session) => {
        const returnCode = await session.getReturnCode();

        if (ReturnCode.isSuccess(returnCode)) {
          // Success
          callbacks?.onProgress?.({ percentage: 100, currentFrame: 0, totalFrames: 0, eta: 0 });
          resolve();
        } else if (ReturnCode.isCancel(returnCode)) {
          reject(new Error('Conversion cancelled'));
        } else {
          const failStackTrace = await session.getFailStackTrace();
          reject(new Error(failStackTrace || 'Conversion failed'));
        }
      }).catch(reject);
    });
  }

  /**
   * Extract audio with progress tracking
   */
  async extractAudioWithProgress(
    input: File | string,
    format: 'mp3' | 'wav' | 'aac' | 'flac' | 'ogg',
    bitrate: string,
    callbacks?: ConversionCallbacks
  ): Promise<TaskResult> {
    return this.extractAudio(input, format, bitrate, callbacks);
  }

  /**
   * Get video metadata using FFprobe
   */
  async getVideoMetadata(filePath: string): Promise<{
    duration: number;
    width: number;
    height: number;
    bitrate: number;
    codec: string;
  } | null> {
    try {
      const session = await FFprobeKit.execute(`-v quiet -print_format json -show_format -show_streams "${filePath}"`);
      const output = await session.getOutput();
      const metadata = JSON.parse(output);
      
      const videoStream = metadata.streams?.find((s: any) => s.codec_type === 'video');
      const format = metadata.format;

      return {
        duration: parseFloat(format?.duration || '0'),
        width: videoStream?.width || 0,
        height: videoStream?.height || 0,
        bitrate: parseInt(format?.bit_rate || '0'),
        codec: videoStream?.codec_name || 'unknown'
      };
    } catch (error) {
      console.error('Error getting metadata:', error);
      return null;
    }
  }

  /**
   * Save uploaded file to temporary location
   */
  private async saveFileToTemp(file: File): Promise<string> {
    // In React Native, files are typically already in the filesystem
    // This is a placeholder for handling blob uploads
    const filename = `${Date.now()}_${file.name}`;
    const path = `${FileSystem.cacheDirectory}${filename}`;
    
    // Write file to cache directory
    // Note: Actual implementation depends on how files are received
    return path;
  }

  /**
   * Cancel ongoing conversion
   */
  cancel(): void {
    super.cancel();
    FFmpegKit.cancel();
  }

  /**
   * Check if hardware acceleration is available
   */
  async hasHardwareAcceleration(): Promise<boolean> {
    // FFmpeg Kit automatically uses hardware acceleration when available
    // This can be enhanced with specific codec checks
    return Platform.OS === 'ios' || Platform.OS === 'android';
  }

  /**
   * Get supported codecs
   */
  async getSupportedCodecs(): Promise<string[]> {
    return ['h264', 'h265', 'vp9', 'av1', 'mp3', 'aac', 'opus', 'flac'];
  }
}

// Singleton instance
export const mobileVideoConverter = new MobileVideoConverter();
