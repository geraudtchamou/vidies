/**
 * Sharing and Export Manager
 * Handles direct sharing to platforms, cloud storage, QR codes, and link generation
 */

import { MediaItem, ShareTarget, ShareLink, PlatformExportPreset } from './types';
import { getPlatformExportPreset } from './compression-profiles';

export class SharingManager {
  private shareLinks: Map<string, ShareLink> = new Map();
  
  // Predefined share targets
  private appShareTargets: ShareTarget[] = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '📱',
      type: 'app',
      platforms: ['ios', 'android'],
      action: async (file) => this.shareToApp('whatsapp', file)
    },
    {
      id: 'instagram-story',
      name: 'Instagram Story',
      icon: '📸',
      type: 'app',
      platforms: ['ios', 'android'],
      action: async (file) => this.shareToApp('instagram-stories', file)
    },
    {
      id: 'instagram-reels',
      name: 'Instagram Reels',
      icon: '🎬',
      type: 'app',
      platforms: ['ios', 'android'],
      action: async (file) => this.shareToApp('instagram-reels', file)
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      icon: '🎵',
      type: 'app',
      platforms: ['ios', 'android'],
      action: async (file) => this.shareToApp('tiktok', file)
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: '✈️',
      type: 'app',
      platforms: ['ios', 'android', 'web'],
      action: async (file) => this.shareToApp('telegram', file)
    },
    {
      id: 'email',
      name: 'Email',
      icon: '📧',
      type: 'app',
      platforms: ['ios', 'android', 'web'],
      action: async (file) => this.shareViaEmail(file)
    },
    {
      id: 'messages',
      name: 'Messages',
      icon: '💬',
      type: 'app',
      platforms: ['ios', 'android'],
      action: async (file) => this.shareToApp('message', file)
    }
  ];

  private cloudShareTargets: ShareTarget[] = [
    {
      id: 'gdrive',
      name: 'Google Drive',
      icon: '☁️',
      type: 'cloud',
      platforms: ['ios', 'android', 'web'],
      action: async (file) => this.uploadToCloud('gdrive', file)
    },
    {
      id: 'dropbox',
      name: 'Dropbox',
      icon: '📦',
      type: 'cloud',
      platforms: ['ios', 'android', 'web'],
      action: async (file) => this.uploadToCloud('dropbox', file)
    },
    {
      id: 'onedrive',
      name: 'OneDrive',
      icon: '💾',
      type: 'cloud',
      platforms: ['ios', 'android', 'web'],
      action: async (file) => this.uploadToCloud('onedrive', file)
    }
  ];

  /**
   * Get all available share targets for a platform
   */
  getShareTargets(mediaType: 'video' | 'audio', platform?: string): ShareTarget[] {
    let targets = [...this.appShareTargets, ...this.cloudShareTargets];
    
    // Filter by media type
    if (mediaType === 'audio') {
      // Audio-specific targets
      targets = targets.filter(t => 
        ['email', 'telegram', 'messages', 'gdrive', 'dropbox', 'onedrive'].includes(t.id)
      );
    }
    
    // Filter by platform availability
    if (platform) {
      targets = targets.filter(t => 
        !t.platforms || t.platforms.includes(platform)
      );
    }
    
    return targets;
  }

  /**
   * Share file to a specific app
   */
  async shareToApp(appId: string, file: MediaItem): Promise<void> {
    // In real implementation, use native sharing APIs
    // Web: navigator.share() or Web Share Target API
    // Mobile: React Native Share module or native intents
    
    console.log(`Sharing ${file.title} to ${appId}`);
    
    // Simulate sharing
    await this.simulateShare();
    
    // On mobile, this would trigger:
    // iOS: UIDocumentInteractionController or UIActivityViewController
    // Android: Intent with ACTION_SEND
  }

  /**
   * Share via email
   */
  async shareViaEmail(file: MediaItem): Promise<void> {
    const subject = encodeURIComponent(file.title);
    const body = encodeURIComponent(`Check out this ${file.type}: ${file.title}`);
    
    // On mobile, open mail composer with attachment
    // On web, open mailto link (without attachment due to limitations)
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
    
    await this.simulateShare();
  }

  /**
   * Upload to cloud storage
   */
  async uploadToCloud(provider: string, file: MediaItem): Promise<void> {
    console.log(`Uploading ${file.title} to ${provider}`);
    
    // In real implementation:
    // - Google Drive: Use Google Drive API v3
    // - Dropbox: Use Dropbox API v2
    // - OneDrive: Use Microsoft Graph API
    
    await this.simulateUpload();
  }

  /**
   * Generate shareable link with QR code
   */
  async generateShareLink(
    file: MediaItem,
    options?: {
      expiresHours?: number;
      maxDownloads?: number;
      password?: string;
    }
  ): Promise<ShareLink> {
    const shortCode = this.generateShortCode();
    const expiresAt = Date.now() + (options?.expiresHours || 24) * 60 * 60 * 1000;
    
    const shareLink: ShareLink = {
      id: this.generateId('link'),
      shortCode,
      fileId: file.id,
      expiresAt,
      downloadCount: 0,
      maxDownloads: options?.maxDownloads,
      password: options?.password,
      qrCodeDataUrl: undefined
    };
    
    // Generate QR code data URL
    const linkUrl = `${window.location.origin}/download/${shortCode}`;
    shareLink.qrCodeDataUrl = await this.generateQRCode(linkUrl);
    
    this.shareLinks.set(shortCode, shareLink);
    
    return shareLink;
  }

  /**
   * Get share link by short code
   */
  getShareLink(shortCode: string): ShareLink | undefined {
    return this.shareLinks.get(shortCode);
  }

  /**
   * Increment download count for a link
   */
  incrementDownloadCount(shortCode: string): boolean {
    const link = this.shareLinks.get(shortCode);
    if (!link) return false;
    
    // Check if expired
    if (Date.now() > link.expiresAt) {
      return false;
    }
    
    // Check max downloads
    if (link.maxDownloads && link.downloadCount >= link.maxDownloads) {
      return false;
    }
    
    link.downloadCount++;
    this.shareLinks.set(shortCode, link);
    
    return true;
  }

  /**
   * Export to platform with automatic format conversion
   */
  async exportToPlatform(
    file: MediaItem,
    platform: string,
    type?: string,
    converter?: (file: MediaItem, preset: PlatformExportPreset) => Promise<MediaItem>
  ): Promise<{ success: boolean; error?: string }> {
    const preset = getPlatformExportPreset(platform, type);
    
    if (!preset) {
      return { success: false, error: 'Platform preset not found' };
    }
    
    // Validate file against platform requirements
    const validation = this.validateForPlatform(file, preset);
    if (!validation.valid) {
      return { success: false, error: validation.issues.join(', ') };
    }
    
    try {
      // Convert if needed
      let exportedFile = file;
      if (converter && !validation.matchesPreset) {
        exportedFile = await converter(file, preset);
      }
      
      // Share to platform
      const shareTarget = this.appShareTargets.find(t => t.id.startsWith(platform));
      if (shareTarget) {
        await shareTarget.action(exportedFile);
      } else {
        // Fallback to system share
        await this.systemShare(exportedFile);
      }
      
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Export failed' 
      };
    }
  }

  /**
   * Create one-tap export shortcuts for common platforms
   */
  getQuickExportShortcuts(file: MediaItem): Array<{
    platform: string;
    label: string;
    icon: string;
    action: () => Promise<{ success: boolean; error?: string }>;
  }> {
    return [
      {
        platform: 'instagram-story',
        label: 'Story (15s)',
        icon: '📸',
        action: () => this.exportToPlatform(file, 'instagram', 'story')
      },
      {
        platform: 'instagram-reel',
        label: 'Reel (90s)',
        icon: '🎬',
        action: () => this.exportToPlatform(file, 'instagram', 'reel')
      },
      {
        platform: 'tiktok',
        label: 'TikTok (60s)',
        icon: '🎵',
        action: () => this.exportToPlatform(file, 'tiktok')
      },
      {
        platform: 'whatsapp',
        label: 'WhatsApp',
        icon: '📱',
        action: () => this.exportToPlatform(file, 'whatsapp')
      },
      {
        platform: 'telegram',
        label: 'Telegram',
        icon: '✈️',
        action: () => this.exportToPlatform(file, 'telegram')
      }
    ];
  }

  /**
   * Clean up expired links
   */
  cleanupExpiredLinks(): void {
    const now = Date.now();
    
    for (const [code, link] of this.shareLinks.entries()) {
      if (now > link.expiresAt) {
        this.shareLinks.delete(code);
      }
    }
  }

  // Private helper methods

  private validateForPlatform(
    file: MediaItem,
    preset: PlatformExportPreset
  ): { valid: boolean; matchesPreset: boolean; issues: string[] } {
    const issues: string[] = [];
    let matchesPreset = true;
    
    // Check duration
    if (file.duration && file.duration > preset.maxDuration) {
      issues.push(`Duration exceeds ${preset.maxDuration}s limit`);
      matchesPreset = false;
    }
    
    // Check file size
    if (file.size > preset.maxFileSize) {
      const maxMB = Math.floor(preset.maxFileSize / (1024 * 1024));
      issues.push(`Size exceeds ${maxMB}MB limit`);
      matchesPreset = false;
    }
    
    // Check format
    if (file.format.toLowerCase() !== preset.codec.toLowerCase()) {
      matchesPreset = false;
    }
    
    return {
      valid: issues.length === 0,
      matchesPreset,
      issues
    };
  }

  private async systemShare(file: MediaItem): Promise<void> {
    // Use Web Share API if available
    if (navigator.share) {
      try {
        await navigator.share({
          title: file.title,
          text: `Check out this ${file.type}`,
          url: file.path
        });
        return;
      } catch (error) {
        console.log('Web Share failed:', error);
      }
    }
    
    // Fallback: trigger download
    this.triggerDownload(file);
  }

  private triggerDownload(file: MediaItem): void {
    const a = document.createElement('a');
    a.href = file.path;
    a.download = file.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  private async generateQRCode(url: string): Promise<string> {
    // In real implementation, use a QR code library like qrcode.js or qrious
    // For now, return a placeholder data URL
    
    // Simple QR code placeholder (in production, use actual QR generation)
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 200;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // White background
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 200, 200);
      
      // Draw simple pattern as placeholder
      ctx.fillStyle = '#000000';
      ctx.font = '20px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('QR Code', 100, 100);
    }
    
    return canvas.toDataURL('image/png');
  }

  private generateShortCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private simulateShare(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 500));
  }

  private simulateUpload(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 1000));
  }
}

// Singleton instance
let sharingManagerInstance: SharingManager | null = null;

export function getSharingManager(): SharingManager {
  if (!sharingManagerInstance) {
    sharingManagerInstance = new SharingManager();
  }
  return sharingManagerInstance;
}

export function resetSharingManager(): void {
  sharingManagerInstance = null;
}
