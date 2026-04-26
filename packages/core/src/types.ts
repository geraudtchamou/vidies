/**
 * Video format and quality types
 */

export interface VideoFormat {
  id: string;
  extension: 'mp4' | 'webm' | 'mkv' | 'avi' | 'mov';
  quality: '360p' | '480p' | '720p' | '1080p' | '1440p' | '2160p' | '4K';
  resolution: {
    width: number;
    height: number;
  };
  filesize?: number; // in bytes
  hasAudio: boolean;
  codec: string;
  url?: string;
}

export interface AudioFormat {
  id: string;
  extension: 'mp3' | 'wav' | 'aac' | 'flac' | 'ogg';
  bitrate: '128k' | '192k' | '256k' | '320k';
  filesize?: number; // estimated in bytes
}

export interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: number; // in seconds
  author: string;
  platform: 'youtube' | 'tiktok' | 'instagram' | 'local';
  formats: VideoFormat[];
  audioFormats: AudioFormat[];
}

export interface DownloadProgress {
  percentage: number;
  downloadedBytes: number;
  totalBytes: number;
  speed: number; // bytes per second
  eta: number; // estimated time in seconds
}

export interface ConversionProgress {
  percentage: number;
  currentFrame: number;
  totalFrames: number;
  eta: number;
}

export type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';

export interface TaskResult {
  id: string;
  status: TaskStatus;
  outputPath?: string;
  error?: string;
  originalSize?: number;
  finalSize?: number;
  createdAt: Date;
  completedAt?: Date;
}

// Platform detection
export function detectPlatform(url: string): 'youtube' | 'tiktok' | 'instagram' | 'unknown' {
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return 'youtube';
  }
  if (url.includes('tiktok.com')) {
    return 'tiktok';
  }
  if (url.includes('instagram.com')) {
    return 'instagram';
  }
  return 'unknown';
}

// Format utilities
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  
  if (h > 0) {
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export function estimateAudioSize(durationSeconds: number, bitrate: string): number {
  const bitrateNum = parseInt(bitrate.replace('k', '')) * 1000; // convert to bits per second
  return Math.floor((durationSeconds * bitrateNum) / 8); // convert to bytes
}

/**
 * Compression profiles and codec types
 */
export type Codec = 'h264' | 'h265' | 'av1' | 'vp9';
export type CompressionMode = 'quality-first' | 'size-first' | 'balanced';
export type PlatformPreset = 'instagram' | 'tiktok' | 'whatsapp' | 'telegram' | 'archive' | 'youtube-story';

export interface CompressionProfile {
  id: string;
  name: string;
  description: string;
  codec: Codec;
  crf?: number; // Constant Rate Factor (lower = better quality, 0-51)
  bitrate?: string; // e.g., "2M", "500k"
  maxResolution?: string;
  audioBitrate?: string;
  preset?: 'ultrafast' | 'fast' | 'medium' | 'slow' | 'veryslow';
  platform?: PlatformPreset;
  maxDuration?: number; // seconds, for platform limits
  aspectRatio?: string; // e.g., "9:16", "1:1", "16:9"
}

/**
 * Video editing settings
 */
export interface TrimSettings {
  startTime: number; // seconds
  endTime: number; // seconds
}

export interface WatermarkSettings {
  text?: string;
  position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
  fontSize?: number;
  color?: string;
  opacity?: number; // 0-1
  imagePath?: string; // path to logo image
}

export interface AudioEffectSettings {
  normalize: boolean;
  fadeIn?: number; // seconds
  fadeOut?: number; // seconds
  equalizer: 'flat' | 'bass-boost' | 'vocal-boost' | 'treble-boost' | 'podcast';
  volume?: number; // -1 to 1
}

export interface MetadataSettings {
  title?: string;
  artist?: string;
  album?: string;
  comment?: string;
  year?: number;
  genre?: string;
}

export interface EditSettings {
  trim?: TrimSettings;
  watermark?: WatermarkSettings;
  audioEffects?: AudioEffectSettings;
  metadata?: MetadataSettings;
}

/**
 * Batch processing and job management
 */
export type JobStatus = 'pending' | 'queued' | 'processing' | 'paused' | 'completed' | 'failed' | 'cancelled';
export type JobType = 'download' | 'convert-audio' | 'compress' | 'batch';
export type ProcessPriority = 'low' | 'normal' | 'high';

export interface ProcessOptions {
  action: JobType;
  targetFormat?: string;
  profile?: CompressionProfile;
  qualityLevel?: number; // 1-100 for smart slider
  edit?: EditSettings;
  autoDeleteOriginal?: boolean;
  scheduleForIdle?: boolean;
  wifiOnly?: boolean;
  priority?: ProcessPriority;
}

export interface JobProgress {
  jobId: string;
  progress: number; // 0-100
  speed?: string;
  eta?: number; // seconds
  status: JobStatus;
  message?: string;
  currentFile?: string;
  totalFiles?: number;
  processedFiles?: number;
}

export interface BatchJob {
  id: string;
  name: string;
  jobs: IndividualJob[];
  status: JobStatus;
  overallProgress: number;
  createdAt: number;
  startedAt?: number;
  completedAt?: number;
  scheduledFor?: number; // timestamp for scheduled processing
  wifiOnly: boolean;
}

export interface IndividualJob {
  id: string;
  batchId?: string;
  source: VideoInfo | { localPath: string };
  options: ProcessOptions;
  status: JobStatus;
  progress: number;
  result?: TaskResult & { outputUrl?: string; blob?: Blob };
  error?: string;
  retryCount: number;
}

/**
 * Media Library and Organization
 */
export interface Folder {
  id: string;
  name: string;
  parentId?: string;
  icon?: string;
  color?: string;
  createdAt: number;
  itemCount: number;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  usageCount: number;
}

export type MediaType = 'video' | 'audio' | 'image';

export interface MediaItem {
  id: string;
  jobId: string;
  title: string;
  type: MediaType;
  format: string;
  size: number;
  duration?: number; // seconds
  path: string; // Local path or Blob URL
  thumbnail?: string;
  folderIds: string[];
  tagIds: string[];
  isFavorite: boolean;
  isHidden: boolean; // For vault
  isInVault: boolean;
  originalSize?: number; // For compression stats
  compressionRatio?: number; // percentage saved
  platform?: string;
  createdAt: number;
  accessedAt: number;
  metadata?: MetadataSettings;
}

export interface MediaLibrary {
  items: MediaItem[];
  folders: Folder[];
  tags: Tag[];
  vault: VaultConfig;
}

/**
 * Privacy and Security
 */
export interface VaultConfig {
  isEnabled: boolean;
  isLocked: boolean;
  passwordHash?: string;
  biometricEnabled: boolean;
  autoLockTimeout: number; // minutes, 0 = never
  hiddenItemCount: number;
}

export interface PrivacySettings {
  localOnlyMode: boolean;
  autoDeleteAfterProcessing: boolean;
  clearHistoryOnExit: boolean;
  incognitoMode: boolean;
  analyticsEnabled: boolean;
}

/**
 * Sharing and Export
 */
export interface ShareTarget {
  id: string;
  name: string;
  icon: string;
  type: 'app' | 'cloud' | 'link' | 'qr';
  platforms?: string[]; // ['ios', 'android', 'web']
  action: (file: MediaItem) => Promise<void>;
}

export interface PlatformExportPreset {
  platform: string;
  maxDuration: number; // seconds
  maxFileSize: number; // bytes
  resolution: string;
  aspectRatio: string;
  codec: Codec;
  audioBitrate: string;
}

/**
 * Analytics and Usage Stats
 */
export interface UsageStats {
  totalFilesProcessed: number;
  totalSpaceSaved: number; // bytes
  totalDownloaded: number; // bytes
  conversionsByType: Record<JobType, number>;
  favoriteFormats: Record<string, number>;
  averageCompressionRatio: number;
  lastProcessedAt?: number;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  defaultDownloadPath?: string;
  maxConcurrentJobs: number;
  defaultAction: JobType;
  showAdvancedOptions: boolean;
  notificationsEnabled: boolean;
  privacy: PrivacySettings;
  usageStats: UsageStats;
}

/**
 * QR Code and Link Sharing
 */
export interface ShareLink {
  id: string;
  shortCode: string;
  fileId: string;
  expiresAt: number;
  downloadCount: number;
  maxDownloads?: number;
  password?: string;
  qrCodeDataUrl?: string;
}
