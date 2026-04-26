/**
 * Media Library Manager
 * Handles organization, folders, tags, search, filtering, and vault functionality
 */

import {
  MediaItem,
  Folder,
  Tag,
  MediaType,
  VaultConfig,
  PrivacySettings,
  JobProgress
} from './types';

export class MediaLibraryManager {
  private items: Map<string, MediaItem> = new Map();
  private folders: Map<string, Folder> = new Map();
  private tags: Map<string, Tag> = new Tag();
  private vault: VaultConfig = {
    isEnabled: false,
    isLocked: true,
    biometricEnabled: false,
    autoLockTimeout: 5,
    hiddenItemCount: 0
  };
  
  // Auto-lock timer
  private autoLockTimer?: NodeJS.Timeout;
  
  // Callbacks
  onLibraryChange?: () => void;
  onVaultLock?: () => void;
  onVaultUnlock?: () => void;

  constructor() {
    // Create default folders
    this.createDefaultFolders();
  }

  /**
   * Add a media item to the library
   */
  addMediaItem(item: Omit<MediaItem, 'id' | 'createdAt' | 'accessedAt'>): MediaItem {
    const id = this.generateId('media');
    const now = Date.now();
    
    const mediaItem: MediaItem = {
      ...item,
      id,
      createdAt: now,
      accessedAt: now,
      folderIds: item.folderIds || [],
      tagIds: item.tagIds || [],
      isFavorite: item.isFavorite || false,
      isHidden: item.isHidden || false,
      isInVault: item.isInVault || false
    };

    this.items.set(id, mediaItem);
    
    // Update folder counts
    item.folderIds?.forEach(folderId => {
      this.updateFolderItemCount(folderId);
    });

    this.notifyChange();
    return mediaItem;
  }

  /**
   * Get a media item by ID
   */
  getMediaItem(id: string): MediaItem | undefined {
    const item = this.items.get(id);
    if (item && !this.isItemInVault(item)) {
      // Update access time
      item.accessedAt = Date.now();
      this.items.set(id, item);
    }
    return item;
  }

  /**
   * Get all media items with optional filtering
   */
  getAllMediaItems(options?: {
    type?: MediaType;
    folderId?: string;
    tagId?: string;
    searchQuery?: string;
    format?: string;
    sortBy?: 'date' | 'name' | 'size' | 'duration';
    sortOrder?: 'asc' | 'desc';
    includeHidden?: boolean;
  }): MediaItem[] {
    let items = Array.from(this.items.values());

    // Filter out vault items unless unlocked
    if (this.vault.isLocked) {
      items = items.filter(item => !item.isInVault && !item.isHidden);
    } else if (!options?.includeHidden) {
      // Even when unlocked, don't show hidden unless explicitly requested
      items = items.filter(item => !item.isHidden);
    }

    // Apply filters
    if (options?.type) {
      items = items.filter(item => item.type === options.type);
    }

    if (options?.folderId) {
      items = items.filter(item => item.folderIds.includes(options.folderId!));
    }

    if (options?.tagId) {
      items = items.filter(item => item.tagIds.includes(options.tagId!));
    }

    if (options?.format) {
      items = items.filter(item => item.format.toLowerCase() === options.format!.toLowerCase());
    }

    if (options?.searchQuery) {
      const query = options.searchQuery.toLowerCase();
      items = items.filter(item => 
        item.title.toLowerCase().includes(query) ||
        item.format.toLowerCase().includes(query) ||
        item.metadata?.title?.toLowerCase().includes(query) ||
        item.metadata?.artist?.toLowerCase().includes(query)
      );
    }

    // Sort
    const sortBy = options?.sortBy || 'date';
    const sortOrder = options?.sortOrder || 'desc';
    
    items.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.createdAt - b.createdAt;
          break;
        case 'name':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'size':
          comparison = a.size - b.size;
          break;
        case 'duration':
          comparison = (a.duration || 0) - (b.duration || 0);
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return items;
  }

  /**
   * Update a media item
   */
  updateMediaItem(id: string, updates: Partial<MediaItem>): MediaItem | undefined {
    const item = this.items.get(id);
    if (!item) return undefined;

    const updatedItem = { ...item, ...updates };
    this.items.set(id, updatedItem);
    
    this.notifyChange();
    return updatedItem;
  }

  /**
   * Delete a media item
   */
  deleteMediaItem(id: string): boolean {
    const item = this.items.get(id);
    if (!item) return false;

    // Update folder counts
    item.folderIds.forEach(folderId => {
      this.updateFolderItemCount(folderId, -1);
    });

    this.items.delete(id);
    this.notifyChange();
    return true;
  }

  /**
   * Move item to folder
   */
  moveToFolder(mediaId: string, folderId: string): void {
    const item = this.items.get(mediaId);
    if (!item) return;

    const folder = this.folders.get(folderId);
    if (!folder) return;

    // Remove from old folders
    item.folderIds.forEach(oldFolderId => {
      this.updateFolderItemCount(oldFolderId, -1);
    });

    // Add to new folder
    item.folderIds = [folderId];
    this.updateFolderItemCount(folderId, 1);

    this.items.set(mediaId, item);
    this.notifyChange();
  }

  /**
   * Add tag to item
   */
  addTagToItem(mediaId: string, tagId: string): void {
    const item = this.items.get(mediaId);
    if (!item) return;

    if (!item.tagIds.includes(tagId)) {
      item.tagIds.push(tagId);
      this.items.set(mediaId, item);
      
      // Update tag usage count
      const tag = this.tags.get(tagId);
      if (tag) {
        tag.usageCount++;
        this.tags.set(tagId, tag);
      }
    }

    this.notifyChange();
  }

  /**
   * Remove tag from item
   */
  removeTagFromItem(mediaId: string, tagId: string): void {
    const item = this.items.get(mediaId);
    if (!item) return;

    const index = item.tagIds.indexOf(tagId);
    if (index > -1) {
      item.tagIds.splice(index, 1);
      this.items.set(mediaId, item);
      
      // Update tag usage count
      const tag = this.tags.get(tagId);
      if (tag && tag.usageCount > 0) {
        tag.usageCount--;
        this.tags.set(tagId, tag);
      }
    }

    this.notifyChange();
  }

  /**
   * Toggle favorite status
   */
  toggleFavorite(mediaId: string): void {
    const item = this.items.get(mediaId);
    if (!item) return;

    item.isFavorite = !item.isFavorite;
    this.items.set(mediaId, item);
    this.notifyChange();
  }

  // Folder Management

  /**
   * Create a new folder
   */
  createFolder(name: string, parentId?: string): Folder {
    const id = this.generateId('folder');
    
    const folder: Folder = {
      id,
      name,
      parentId,
      icon: this.getDefaultFolderIcon(name),
      color: this.getRandomColor(),
      createdAt: Date.now(),
      itemCount: 0
    };

    this.folders.set(id, folder);
    this.notifyChange();
    return folder;
  }

  /**
   * Get all folders
   */
  getAllFolders(): Folder[] {
    return Array.from(this.folders.values());
  }

  /**
   * Get folder by ID
   */
  getFolder(id: string): Folder | undefined {
    return this.folders.get(id);
  }

  /**
   * Update folder
   */
  updateFolder(id: string, updates: Partial<Folder>): Folder | undefined {
    const folder = this.folders.get(id);
    if (!folder) return undefined;

    const updatedFolder = { ...folder, ...updates };
    this.folders.set(id, updatedFolder);
    this.notifyChange();
    return updatedFolder;
  }

  /**
   * Delete folder
   */
  deleteFolder(id: string): boolean {
    const folder = this.folders.get(id);
    if (!folder) return false;

    // Don't delete if it has items
    if (folder.itemCount > 0) {
      return false;
    }

    // Check for subfolders
    const hasSubfolders = Array.from(this.folders.values()).some(f => f.parentId === id);
    if (hasSubfolders) {
      return false;
    }

    this.folders.delete(id);
    this.notifyChange();
    return true;
  }

  // Tag Management

  /**
   * Create a new tag
   */
  createTag(name: string, color?: string): Tag {
    const id = this.generateId('tag');
    
    const tag: Tag = {
      id,
      name,
      color: color || this.getRandomColor(),
      usageCount: 0
    };

    this.tags.set(id, tag);
    this.notifyChange();
    return tag;
  }

  /**
   * Get all tags
   */
  getAllTags(): Tag[] {
    return Array.from(this.tags.values());
  }

  /**
   * Get tag by ID
   */
  getTag(id: string): Tag | undefined {
    return this.tags.get(id);
  }

  /**
   * Update tag
   */
  updateTag(id: string, updates: Partial<Tag>): Tag | undefined {
    const tag = this.tags.get(id);
    if (!tag) return undefined;

    const updatedTag = { ...tag, ...updates };
    this.tags.set(id, updatedTag);
    this.notifyChange();
    return updatedTag;
  }

  /**
   * Delete tag
   */
  deleteTag(id: string): boolean {
    const tag = this.tags.get(id);
    if (!tag) return false;

    // Don't delete if in use
    if (tag.usageCount > 0) {
      return false;
    }

    this.tags.delete(id);
    this.notifyChange();
    return true;
  }

  // Vault Management

  /**
   * Enable vault with password
   */
  enableVault(password: string): boolean {
    if (password.length < 4) {
      return false;
    }

    this.vault.isEnabled = true;
    this.vault.passwordHash = this.hashPassword(password);
    this.vault.isLocked = true;
    this.vault.hiddenItemCount = Array.from(this.items.values()).filter(i => i.isHidden).length;

    this.startAutoLockTimer();
    this.notifyChange();
    return true;
  }

  /**
   * Unlock vault with password
   */
  unlockVault(password: string): boolean {
    if (!this.vault.isEnabled || !this.vault.passwordHash) {
      return false;
    }

    if (this.hashPassword(password) === this.vault.passwordHash) {
      this.vault.isLocked = false;
      this.resetAutoLockTimer();
      this.onVaultUnlock?.();
      this.notifyChange();
      return true;
    }

    return false;
  }

  /**
   * Lock vault
   */
  lockVault(): void {
    if (!this.vault.isEnabled) return;

    this.vault.isLocked = true;
    this.clearAutoLockTimer();
    this.onVaultLock?.();
    this.notifyChange();
  }

  /**
   * Add item to vault (hide it)
   */
  addToVault(mediaId: string): void {
    const item = this.items.get(mediaId);
    if (!item) return;

    item.isHidden = true;
    item.isInVault = true;
    this.items.set(mediaId, item);
    
    this.vault.hiddenItemCount++;
    this.notifyChange();
  }

  /**
   * Remove item from vault
   */
  removeFromVault(mediaId: string, password: string): boolean {
    if (!this.unlockVault(password)) {
      return false;
    }

    const item = this.items.get(mediaId);
    if (!item) return false;

    item.isHidden = false;
    item.isInVault = false;
    this.items.set(mediaId, item);
    
    this.vault.hiddenItemCount--;
    this.notifyChange();
    return true;
  }

  /**
   * Get vault config
   */
  getVaultConfig(): VaultConfig {
    return { ...this.vault };
  }

  /**
   * Enable biometric authentication
   */
  enableBiometric(): void {
    this.vault.biometricEnabled = true;
    this.notifyChange();
  }

  /**
   * Disable biometric authentication
   */
  disableBiometric(): void {
    this.vault.biometricEnabled = false;
    this.notifyChange();
  }

  // Statistics

  /**
   * Get library statistics
   */
  getStatistics(): {
    totalItems: number;
    totalVideos: number;
    totalAudios: number;
    totalSize: number;
    totalFolders: number;
    totalTags: number;
    spaceSaved: number;
    favoritesCount: number;
  } {
    const items = Array.from(this.items.values());
    
    return {
      totalItems: items.length,
      totalVideos: items.filter(i => i.type === 'video').length,
      totalAudios: items.filter(i => i.type === 'audio').length,
      totalSize: items.reduce((sum, i) => sum + i.size, 0),
      totalFolders: this.folders.size,
      totalTags: this.tags.size,
      spaceSaved: items.reduce((sum, i) => sum + ((i.originalSize || 0) - i.size), 0),
      favoritesCount: items.filter(i => i.isFavorite).length
    };
  }

  /**
   * Get items by type tab
   */
  getItemsByTab(tab: 'videos' | 'audios' | 'conversions'): MediaItem[] {
    switch (tab) {
      case 'videos':
        return this.getAllMediaItems({ type: 'video' });
      case 'audios':
        return this.getAllMediaItems({ type: 'audio' });
      case 'conversions':
        // Items that have compression ratio (were compressed)
        return this.getAllMediaItems({}).filter(i => i.compressionRatio !== undefined);
      default:
        return [];
    }
  }

  // Private helper methods

  private createDefaultFolders(): void {
    const defaultFolders = [
      { name: 'Music', icon: '🎵' },
      { name: 'Shorts', icon: '📱' },
      { name: 'Archives', icon: '📦' },
      { name: 'For Instagram', icon: '📸' },
      { name: 'For Podcast', icon: '🎙️' }
    ];

    defaultFolders.forEach(folder => {
      this.createFolder(folder.name);
    });
  }

  private updateFolderItemCount(folderId: string, delta: number = 0): void {
    const folder = this.folders.get(folderId);
    if (!folder) return;

    if (delta === 0) {
      // Recalculate count
      folder.itemCount = Array.from(this.items.values())
        .filter(item => item.folderIds.includes(folderId)).length;
    } else {
      folder.itemCount += delta;
    }

    this.folders.set(folderId, folder);
  }

  private isItemInVault(item: MediaItem): boolean {
    return this.vault.isLocked && (item.isInVault || item.isHidden);
  }

  private startAutoLockTimer(): void {
    if (this.vault.autoLockTimeout <= 0) return;

    this.resetAutoLockTimer();
  }

  private resetAutoLockTimer(): void {
    this.clearAutoLockTimer();
    
    if (this.vault.autoLockTimeout > 0) {
      this.autoLockTimer = setTimeout(() => {
        this.lockVault();
      }, this.vault.autoLockTimeout * 60 * 1000);
    }
  }

  private clearAutoLockTimer(): void {
    if (this.autoLockTimer) {
      clearTimeout(this.autoLockTimer);
      this.autoLockTimer = undefined;
    }
  }

  private hashPassword(password: string): string {
    // Simple hash for demo - in production use bcrypt or similar
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
      const char = password.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }

  private getDefaultFolderIcon(name: string): string {
    const icons: Record<string, string> = {
      'Music': '🎵',
      'Shorts': '📱',
      'Archives': '📦',
      'Instagram': '📸',
      'Podcast': '🎙️'
    };
    
    for (const [key, icon] of Object.entries(icons)) {
      if (name.toLowerCase().includes(key.toLowerCase())) {
        return icon;
      }
    }
    
    return '📁';
  }

  private getRandomColor(): string {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private notifyChange(): void {
    this.onLibraryChange?.();
  }
}

// Singleton instance
let mediaLibraryInstance: MediaLibraryManager | null = null;

export function getMediaLibrary(): MediaLibraryManager {
  if (!mediaLibraryInstance) {
    mediaLibraryInstance = new MediaLibraryManager();
  }
  return mediaLibraryInstance;
}

export function resetMediaLibrary(): void {
  mediaLibraryInstance = null;
}
