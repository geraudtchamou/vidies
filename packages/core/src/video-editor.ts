/**
 * Video Editor Module
 * Handles trimming, audio effects, watermarks, and metadata editing
 */

import {
  EditSettings,
  TrimSettings,
  WatermarkSettings,
  AudioEffectSettings,
  MetadataSettings,
  CompressionProfile
} from './types';

export class VideoEditor {
  
  /**
   * Build FFmpeg arguments for trimming a video
   */
  buildTrimArgs(trim: TrimSettings): string[] {
    const args: string[] = [];
    
    if (trim.startTime !== undefined) {
      args.push('-ss', trim.startTime.toString());
    }
    
    if (trim.endTime !== undefined && trim.startTime !== undefined) {
      const duration = trim.endTime - trim.startTime;
      args.push('-t', duration.toString());
    } else if (trim.endTime !== undefined) {
      args.push('-to', trim.endTime.toString());
    }
    
    return args;
  }

  /**
   * Build FFmpeg arguments for adding watermark
   */
  buildWatermarkArgs(watermark: WatermarkSettings, videoWidth: number, videoHeight: number): string[] {
    const args: string[] = [];
    
    if (watermark.text) {
      // Text watermark using drawtext filter
      const position = this.getTextWatermarkPosition(watermark.position, videoWidth, videoHeight, watermark.fontSize || 24);
      
      const drawtextFilter = `drawtext=text='${this.escapeFFmpegText(watermark.text)}':fontsize=${watermark.fontSize || 24}:fontcolor=${watermark.color || 'white'}:x=${position.x}:y=${position.y}`;
      
      if (watermark.opacity !== undefined && watermark.opacity < 1) {
        args.push('-vf', `${drawtextFilter}:alpha=${watermark.opacity}`);
      } else {
        args.push('-vf', drawtextFilter);
      }
    } else if (watermark.imagePath) {
      // Image/logo watermark using overlay filter
      const position = this.getImageWatermarkPosition(watermark.position, videoWidth, videoHeight);
      
      const overlayFilter = `overlay=${position.x}:${position.y}`;
      
      if (watermark.opacity !== undefined && watermark.opacity < 1) {
        args.push('-vf', `${overlayFilter}:format=auto:enable='between(t,0,99999)'`);
        args.push('-filter_complex', `[1:v]format=rgba,geq=a='val()*${watermark.opacity}'[wm];[0:v][wm]overlay=${position.x}:${position.y}`);
      } else {
        args.push('-i', watermark.imagePath, '-vf', overlayFilter);
      }
    }
    
    return args;
  }

  /**
   * Build FFmpeg arguments for audio effects
   */
  buildAudioEffectsArgs(effects: AudioEffectSettings, duration: number): string[] {
    const args: string[] = [];
    const filters: string[] = [];

    // Volume adjustment
    if (effects.volume !== undefined && effects.volume !== 0) {
      filters.push(`volume=${1 + effects.volume}`);
    }

    // Normalize audio
    if (effects.normalize) {
      filters.push('loudnorm=I=-16:TP=-1.5:LRA=11');
    }

    // Fade in
    if (effects.fadeIn && effects.fadeIn > 0) {
      filters.push(`afade=t=in:st=0:d=${effects.fadeIn}`);
    }

    // Fade out
    if (effects.fadeOut && effects.fadeOut > 0) {
      const fadeStart = duration - effects.fadeOut;
      filters.push(`afade=t=out:st=${fadeStart}:d=${effects.fadeOut}`);
    }

    // Equalizer presets
    if (effects.equalizer && effects.equalizer !== 'flat') {
      const eqFilter = this.buildEqualizerFilter(effects.equalizer);
      if (eqFilter) {
        filters.push(eqFilter);
      }
    }

    if (filters.length > 0) {
      args.push('-af', filters.join(','));
    }

    return args;
  }

  /**
   * Build FFmpeg arguments for metadata
   */
  buildMetadataArgs(metadata: MetadataSettings): string[] {
    const args: string[] = [];

    if (metadata.title) {
      args.push('-metadata', `title=${metadata.title}`);
    }

    if (metadata.artist) {
      args.push('-metadata', `artist=${metadata.artist}`);
    }

    if (metadata.album) {
      args.push('-metadata', `album=${metadata.album}`);
    }

    if (metadata.comment) {
      args.push('-metadata', `comment=${metadata.comment}`);
    }

    if (metadata.year) {
      args.push('-metadata', `date=${metadata.year}`);
    }

    if (metadata.genre) {
      args.push('-metadata', `genre=${metadata.genre}`);
    }

    return args;
  }

  /**
   * Build complete FFmpeg filter chain for all edit operations
   */
  buildCompleteFilterChain(
    edit: EditSettings,
    videoWidth: number,
    videoHeight: number,
    duration: number
  ): { videoFilters: string[]; audioFilters: string[]; extraArgs: string[] } {
    const videoFilters: string[] = [];
    const audioFilters: string[] = [];
    const extraArgs: string[] = [];

    // Trim is handled with -ss and -t flags, not filters
    if (edit.trim) {
      extraArgs.push(...this.buildTrimArgs(edit.trim));
    }

    // Watermark (video filter)
    if (edit.watermark) {
      const watermarkArgs = this.buildWatermarkArgs(edit.watermark, videoWidth, videoHeight);
      const vfIndex = watermarkArgs.indexOf('-vf');
      if (vfIndex !== -1 && vfIndex + 1 < watermarkArgs.length) {
        videoFilters.push(watermarkArgs[vfIndex + 1]);
      }
      
      // Check for filter_complex for image watermarks
      const fcIndex = watermarkArgs.indexOf('-filter_complex');
      if (fcIndex !== -1 && fcIndex + 1 < watermarkArgs.length) {
        extraArgs.push('-filter_complex', watermarkArgs[fcIndex + 1]);
      }
      
      // Add image input if present
      const inputIndex = watermarkArgs.indexOf('-i');
      if (inputIndex !== -1 && inputIndex + 1 < watermarkArgs.length && watermarkArgs[inputIndex + 1].endsWith('.png')) {
        extraArgs.unshift('-i', watermarkArgs[inputIndex + 1]);
      }
    }

    // Audio effects
    if (edit.audioEffects) {
      const audioArgs = this.buildAudioEffectsArgs(edit.audioEffects, duration);
      const afIndex = audioArgs.indexOf('-af');
      if (afIndex !== -1 && afIndex + 1 < audioArgs.length) {
        audioFilters.push(audioArgs[afIndex + 1]);
      }
    }

    return { videoFilters, audioFilters, extraArgs };
  }

  /**
   * Estimate output file size after editing
   */
  estimateOutputSize(
    originalSize: number,
    originalDuration: number,
    edit: EditSettings,
    profile?: CompressionProfile
  ): number {
    let estimatedSize = originalSize;

    // Adjust for trim
    if (edit.trim) {
      const trimDuration = (edit.trim.endTime || originalDuration) - (edit.trim.startTime || 0);
      const ratio = trimDuration / originalDuration;
      estimatedSize *= ratio;
    }

    // Adjust for compression profile
    if (profile) {
      const reductionFactors: Record<string, number> = {
        'quality-first': 0.7,
        'balanced': 0.5,
        'size-first': 0.2
      };
      
      const baseFactor = reductionFactors[profile.mode] || 0.5;
      
      const codecFactors: Record<string, number> = {
        'h264': 1.0,
        'h265': 0.7,
        'av1': 0.6,
        'vp9': 0.75
      };
      
      const codecFactor = codecFactors[profile.codec] || 1.0;
      estimatedSize *= baseFactor * codecFactor;
    }

    // Watermark adds negligible size
    // Audio effects don't significantly change size

    return Math.floor(estimatedSize);
  }

  /**
   * Validate edit settings
   */
  validateEditSettings(edit: EditSettings, duration: number): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate trim
    if (edit.trim) {
      if (edit.trim.startTime < 0) {
        errors.push('Trim start time cannot be negative');
      }
      
      if (edit.trim.endTime && edit.trim.endTime > duration) {
        errors.push(`Trim end time cannot exceed video duration (${duration}s)`);
      }
      
      if (edit.trim.endTime && edit.trim.startTime >= edit.trim.endTime) {
        errors.push('Trim start time must be before end time');
      }
    }

    // Validate watermark
    if (edit.watermark) {
      if (!edit.watermark.text && !edit.watermark.imagePath) {
        errors.push('Watermark must have either text or image path');
      }
      
      if (edit.watermark.opacity !== undefined && (edit.watermark.opacity < 0 || edit.watermark.opacity > 1)) {
        errors.push('Watermark opacity must be between 0 and 1');
      }
    }

    // Validate audio effects
    if (edit.audioEffects) {
      if (edit.audioEffects.fadeIn && edit.audioEffects.fadeIn < 0) {
        errors.push('Fade-in duration cannot be negative');
      }
      
      if (edit.audioEffects.fadeOut && edit.audioEffects.fadeOut < 0) {
        errors.push('Fade-out duration cannot be negative');
      }
      
      if (edit.audioEffects.fadeIn && edit.audioEffects.fadeOut) {
        if (edit.audioEffects.fadeIn + edit.audioEffects.fadeOut > duration) {
          errors.push('Total fade duration exceeds video length');
        }
      }
      
      if (edit.audioEffects.volume !== undefined && (edit.audioEffects.volume < -1 || edit.audioEffects.volume > 1)) {
        errors.push('Volume adjustment must be between -1 and 1');
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Get waveform data representation (for UI visualization)
   * In real implementation, this would analyze actual audio data
   */
  generateWaveformData(duration: number, samples: number = 100): number[] {
    const waveform: number[] = [];
    
    for (let i = 0; i < samples; i++) {
      // Generate pseudo-random waveform for visualization
      const time = (i / samples) * duration;
      // Combine multiple sine waves for more natural look
      const value = 
        Math.sin(time * 2) * 0.5 +
        Math.sin(time * 5) * 0.3 +
        Math.sin(time * 10) * 0.2;
      
      waveform.push(Math.abs(value));
    }
    
    return waveform;
  }

  // Private helper methods

  private getTextWatermarkPosition(
    position: string,
    videoWidth: number,
    videoHeight: number,
    fontSize: number
  ): { x: string; y: string } {
    const padding = 10;
    
    switch (position) {
      case 'top-left':
        return { x: `${padding}`, y: `${fontSize + padding}` };
      case 'top-right':
        return { x: `w-${padding}`, y: `${fontSize + padding}` };
      case 'bottom-left':
        return { x: `${padding}`, y: `h-${padding}` };
      case 'bottom-right':
      default:
        return { x: `w-${padding}`, y: `h-${padding}` };
    }
  }

  private getImageWatermarkPosition(
    position: string,
    videoWidth: number,
    videoHeight: number
  ): { x: string; y: string } {
    const padding = 10;
    
    switch (position) {
      case 'top-left':
        return { x: `${padding}`, y: `${padding}` };
      case 'top-right':
        return { x: `w-w_0-${padding}`, y: `${padding}` };
      case 'bottom-left':
        return { x: `${padding}`, y: `h-h_0-${padding}` };
      case 'bottom-right':
      default:
        return { x: `w-w_0-${padding}`, y: `h-h_0-${padding}` };
    }
  }

  private escapeFFmpegText(text: string): string {
    // Escape special characters for FFmpeg drawtext
    return text
      .replace(/%/g, '%{percent}')
      .replace(/:/g, '%{colon}')
      .replace(/'/g, "'\\''");
  }

  private buildEqualizerFilter(preset: string): string {
    const equalizers: Record<string, string> = {
      'bass-boost': 'bass=g=5:f=100:w=0.5',
      'vocal-boost': 'equalizer=f=1000:width_type=h:width=2000:g=3,equalizer=f=3000:width_type=h:width=2000:g=2',
      'treble-boost': 'treble=g=5:f=5000:w=0.5',
      'podcast': 'highpass=f=80,lowpass=f=8000,equalizer=f=1000:width_type=h:width=2000:g=2'
    };

    return equalizers[preset] || '';
  }

  /**
   * Create default edit settings template
   */
  static createDefaultEditSettings(): EditSettings {
    return {
      trim: undefined,
      watermark: undefined,
      audioEffects: {
        normalize: false,
        equalizer: 'flat'
      },
      metadata: {}
    };
  }

  /**
   * Create platform-specific edit preset
   */
  static createPlatformPreset(platform: string): EditSettings {
    const presets: Record<string, EditSettings> = {
      'instagram-story': {
        trim: { startTime: 0, endTime: 15 },
        watermark: undefined,
        audioEffects: {
          normalize: true,
          fadeIn: 0.5,
          fadeOut: 0.5,
          equalizer: 'flat'
        }
      },
      'tiktok': {
        trim: { startTime: 0, endTime: 60 },
        audioEffects: {
          normalize: true,
          equalizer: 'bass-boost'
        }
      },
      'podcast': {
        audioEffects: {
          normalize: true,
          fadeIn: 1,
          fadeOut: 2,
          equalizer: 'podcast'
        },
        metadata: {
          genre: 'Podcast'
        }
      }
    };

    return presets[platform] || VideoEditor.createDefaultEditSettings();
  }
}

// Singleton instance
let videoEditorInstance: VideoEditor | null = null;

export function getVideoEditor(): VideoEditor {
  if (!videoEditorInstance) {
    videoEditorInstance = new VideoEditor();
  }
  return videoEditorInstance;
}

export function resetVideoEditor(): void {
  videoEditorInstance = null;
}
