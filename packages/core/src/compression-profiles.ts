/**
 * Compression profiles for different platforms and use cases
 */

import { CompressionProfile as BaseCompressionProfile, Codec, PlatformPreset, PlatformExportPreset } from './types';

export interface CompressionProfile extends BaseCompressionProfile {
  mode: 'quality-first' | 'size-first' | 'balanced';
  resolution?: {
    width: number;
    height: number;
  };
}

// Platform export presets with strict limits
export const PLATFORM_EXPORT_PRESETS: Record<string, PlatformExportPreset> = {
  instagram_story: {
    platform: 'instagram',
    maxDuration: 15,
    maxFileSize: 4 * 1024 * 1024, // 4MB
    resolution: '1080x1920',
    aspectRatio: '9:16',
    codec: 'h264',
    audioBitrate: '128k'
  },
  instagram_reel: {
    platform: 'instagram',
    maxDuration: 90,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    resolution: '1080x1920',
    aspectRatio: '9:16',
    codec: 'h264',
    audioBitrate: '128k'
  },
  instagram_post: {
    platform: 'instagram',
    maxDuration: 60,
    maxFileSize: 100 * 1024 * 1024,
    resolution: '1080x1080',
    aspectRatio: '1:1',
    codec: 'h264',
    audioBitrate: '128k'
  },
  tiktok: {
    platform: 'tiktok',
    maxDuration: 60,
    maxFileSize: 287 * 1024 * 1024, // 287MB
    resolution: '1080x1920',
    aspectRatio: '9:16',
    codec: 'h264',
    audioBitrate: '128k'
  },
  whatsapp: {
    platform: 'whatsapp',
    maxDuration: 30,
    maxFileSize: 16 * 1024 * 1024, // 16MB
    resolution: '720x1280',
    aspectRatio: '9:16',
    codec: 'h264',
    audioBitrate: '96k'
  },
  telegram: {
    platform: 'telegram',
    maxDuration: 600,
    maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB
    resolution: '1080x1920',
    aspectRatio: '9:16',
    codec: 'h264',
    audioBitrate: '128k'
  },
  youtube_short: {
    platform: 'youtube',
    maxDuration: 60,
    maxFileSize: 1024 * 1024 * 1024, // 1GB
    resolution: '1080x1920',
    aspectRatio: '9:16',
    codec: 'h264',
    audioBitrate: '128k'
  }
};

export const COMPRESSION_PROFILES: CompressionProfile[] = [
  // Platform presets
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Optimized for Instagram posts, stories, and reels',
    codec: 'h264',
    mode: 'balanced',
    resolution: { width: 1080, height: 1920 },
    bitrate: '5000k',
    audioBitrate: '128k',
    preset: 'medium',
    crf: 23,
    platform: 'instagram',
    maxDuration: 90,
    aspectRatio: '9:16'
  },
  {
    id: 'instagram-story',
    name: 'Instagram Story',
    description: '15-second optimized for Instagram Stories',
    codec: 'h264',
    mode: 'balanced',
    resolution: { width: 1080, height: 1920 },
    bitrate: '6000k',
    audioBitrate: '128k',
    preset: 'fast',
    crf: 22,
    platform: 'instagram',
    maxDuration: 15,
    aspectRatio: '9:16'
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Optimized for TikTok videos (up to 60s)',
    codec: 'h264',
    mode: 'balanced',
    resolution: { width: 1080, height: 1920 },
    bitrate: '6000k',
    audioBitrate: '128k',
    preset: 'medium',
    crf: 22,
    platform: 'tiktok',
    maxDuration: 60,
    aspectRatio: '9:16'
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    description: 'Compressed for WhatsApp sharing (16MB limit)',
    codec: 'h264',
    mode: 'size-first',
    resolution: { width: 720, height: 1280 },
    bitrate: '2500k',
    audioBitrate: '96k',
    preset: 'fast',
    crf: 28,
    platform: 'whatsapp',
    maxDuration: 30,
    aspectRatio: '9:16'
  },
  {
    id: 'telegram',
    name: 'Telegram',
    description: 'Good quality for Telegram (supports up to 2GB)',
    codec: 'h264',
    mode: 'balanced',
    resolution: { width: 1080, height: 1920 },
    bitrate: '4000k',
    audioBitrate: '128k',
    preset: 'medium',
    crf: 24,
    platform: 'telegram',
    maxDuration: 600,
    aspectRatio: '9:16'
  },
  {
    id: 'archive',
    name: 'Archive',
    description: 'High quality for long-term storage with HEVC',
    codec: 'h265',
    mode: 'quality-first',
    resolution: { width: 1920, height: 1080 },
    bitrate: '8000k',
    audioBitrate: '192k',
    preset: 'slow',
    crf: 18,
    platform: 'archive'
  },
  
  // Quality modes
  {
    id: 'quality-first',
    name: 'Quality First',
    description: 'Minimal loss, slight size reduction (~20-30%)',
    codec: 'h264',
    mode: 'quality-first',
    preset: 'slow',
    crf: 18
  },
  {
    id: 'balanced',
    name: 'Balanced',
    description: 'Good balance between quality and size (~40-50% reduction)',
    codec: 'h264',
    mode: 'balanced',
    preset: 'medium',
    crf: 23
  },
  {
    id: 'size-first',
    name: 'Size First',
    description: 'Aggressive compression, up to 70-90% smaller',
    codec: 'h265',
    mode: 'size-first',
    preset: 'fast',
    crf: 30
  },
  
  // Advanced codecs (Premium features)
  {
    id: 'av1-quality',
    name: 'AV1 High Quality',
    description: 'Next-gen codec, best quality/size ratio (slower encoding)',
    codec: 'av1',
    mode: 'quality-first',
    preset: 'medium',
    crf: 20,
    isPremium: true
  },
  {
    id: 'hevc-hdr',
    name: 'HEVC HDR',
    description: 'HDR10 support with H.265/HEVC',
    codec: 'h265',
    mode: 'quality-first',
    preset: 'medium',
    crf: 18,
    isPremium: true
  }
];

// AI-assisted compression profiles (Premium)
export const AI_COMPRESSION_PROFILES: CompressionProfile[] = [
  {
    id: 'ai-smart',
    name: 'AI Smart Compress',
    description: 'AI-analyzed scene detection for optimal compression',
    codec: 'h265',
    mode: 'balanced',
    preset: 'medium',
    crf: 22,
    isPremium: true,
    features: ['scene-detection', 'adaptive-bitrate', 'noise-reduction']
  },
  {
    id: 'ai-ultra',
    name: 'AI Ultra Compression',
    description: 'Maximum compression with AI quality preservation',
    codec: 'av1',
    mode: 'size-first',
    preset: 'slow',
    crf: 28,
    isPremium: true,
    features: ['scene-detection', 'adaptive-bitrate', 'super-resolution']
  }
];

export function getCompressionProfile(id: string): CompressionProfile | undefined {
  return COMPRESSION_PROFILES.find(profile => profile.id === id);
}

export function getProfilesByMode(mode: 'quality-first' | 'size-first' | 'balanced'): CompressionProfile[] {
  return COMPRESSION_PROFILES.filter(profile => profile.mode === mode);
}

export function getPlatformProfile(platform: string): CompressionProfile | undefined {
  return COMPRESSION_PROFILES.find(profile => profile.platform === platform.toLowerCase());
}

export function getPlatformExportPreset(platform: string, type?: string): PlatformExportPreset | undefined {
  const key = type ? `${platform}_${type}` : platform;
  return PLATFORM_EXPORT_PRESETS[key] || PLATFORM_EXPORT_PRESETS[platform];
}

export function estimateOutputSize(inputSize: number, profile: CompressionProfile): number {
  const reductionFactors: Record<string, number> = {
    'quality-first': 0.7,  // 30% reduction
    'balanced': 0.5,       // 50% reduction
    'size-first': 0.2      // 80% reduction
  };
  
  const baseFactor = reductionFactors[profile.mode] || 0.5;
  
  // Adjust based on codec efficiency
  const codecFactors: Record<string, number> = {
    'h264': 1.0,
    'h265': 0.7,  // 30% better than H.264
    'av1': 0.6,   // 40% better than H.264
    'vp9': 0.75
  };
  
  const codecFactor = codecFactors[profile.codec] || 1.0;
  
  return Math.floor(inputSize * baseFactor * codecFactor);
}

export function validateForPlatform(media: { duration: number; size: number }, platform: string): { valid: boolean; issues: string[] } {
  const preset = getPlatformExportPreset(platform);
  if (!preset) return { valid: true, issues: [] };
  
  const issues: string[] = [];
  
  if (media.duration > preset.maxDuration) {
    issues.push(`Duration ${Math.floor(media.duration)}s exceeds ${preset.maxDuration}s limit for ${platform}`);
  }
  
  if (media.size > preset.maxFileSize) {
    const maxMB = Math.floor(preset.maxFileSize / (1024 * 1024));
    issues.push(`File size exceeds ${maxMB}MB limit for ${platform}`);
  }
  
  return { valid: issues.length === 0, issues };
}
