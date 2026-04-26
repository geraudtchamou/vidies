'use client';

import React, { useState, useEffect } from 'react';
import { MediaItem, Folder, Tag, MediaType } from '@videoproc/core';
import { getMediaLibrary } from '@videoproc/core';

interface MediaLibraryProps {
  onItemSelect?: (item: MediaItem) => void;
}

export default function MediaLibrary({ onItemSelect }: MediaLibraryProps) {
  const [activeTab, setActiveTab] = useState<'videos' | 'audios' | 'conversions'>('videos');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'size' | 'duration'>('date');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const library = getMediaLibrary();

  const loadLibrary = () => {
    const loadedItems = library.getAllMediaItems({
      type: activeTab === 'conversions' ? undefined : (activeTab as MediaType),
      folderId: selectedFolder || undefined,
      searchQuery: searchQuery || undefined,
      sortBy,
      sortOrder: 'desc'
    });
    
    // Filter conversions tab
    if (activeTab === 'conversions') {
      setItems(loadedItems.filter(i => i.compressionRatio !== undefined));
    } else {
      setItems(loadedItems);
    }
    
    setFolders(library.getAllFolders());
    setTags(library.getAllTags());
  };

  useEffect(() => {
    loadLibrary();
    
    const unsubscribe = () => {
      library.onLibraryChange = undefined;
    };
    
    library.onLibraryChange = loadLibrary;
    
    return unsubscribe;
  }, [activeTab, selectedFolder, searchQuery, sortBy]);

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this item?')) {
      library.deleteMediaItem(id);
      loadLibrary();
    }
  };

  const handleToggleFavorite = (id: string) => {
    library.toggleFavorite(id);
    loadLibrary();
  };

  const handleAddToVault = (id: string) => {
    library.addToVault(id);
    loadLibrary();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const stats = library.getStatistics();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      {/* Header Stats */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{stats.totalItems}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Items</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{formatFileSize(stats.spaceSaved)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Space Saved</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-purple-600">{stats.favoritesCount}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Favorites</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
            >
              ⊞
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-100 text-blue-600' : 'text-gray-600 dark:text-gray-400'}`}
            >
              ☰
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {(['videos', 'audios', 'conversions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'border-b-2 border-blue-600 text-blue-600 dark:text-blue-400'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Search and Filters */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by title, format..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 min-w-[200px] px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="date">Date</option>
            <option value="name">Name</option>
            <option value="size">Size</option>
            <option value="duration">Duration</option>
          </select>
          
          <select
            value={selectedFolder || ''}
            onChange={(e) => setSelectedFolder(e.target.value || null)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="">All Folders</option>
            {folders.map(folder => (
              <option key={folder.id} value={folder.id}>{folder.name}</option>
            ))}
          </select>
        </div>
        
        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {tags.map(tag => (
              <span
                key={tag.id}
                className="px-2 py-1 rounded-full text-xs"
                style={{ backgroundColor: tag.color + '20', color: tag.color }}
              >
                {tag.name} ({tag.usageCount})
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Items Grid/List */}
      <div className="p-4">
        {items.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No items found</p>
            <p className="text-sm mt-1">Process some videos to see them here</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {items.map(item => (
              <div
                key={item.id}
                className="group relative bg-gray-50 dark:bg-gray-700 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onItemSelect?.(item)}
              >
                {/* Thumbnail */}
                <div className="aspect-video bg-gray-200 dark:bg-gray-600 relative">
                  {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-4xl">
                      {item.type === 'video' ? '🎬' : '🎵'}
                    </div>
                  )}
                  
                  {/* Duration badge */}
                  {item.duration && (
                    <span className="absolute bottom-1 right-1 px-1.5 py-0.5 bg-black/70 text-white text-xs rounded">
                      {formatDuration(item.duration)}
                    </span>
                  )}
                  
                  {/* Compression ratio badge */}
                  {item.compressionRatio !== undefined && (
                    <span className="absolute top-1 left-1 px-1.5 py-0.5 bg-green-500 text-white text-xs rounded">
                      -{Math.round(item.compressionRatio)}%
                    </span>
                  )}
                </div>
                
                {/* Info */}
                <div className="p-3">
                  <h3 className="font-medium text-sm dark:text-white truncate" title={item.title}>
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>{item.format.toUpperCase()}</span>
                    <span>{formatFileSize(item.size)}</span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="absolute top-2 right-2 flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(item.id); }}
                    className={`p-1.5 rounded-full ${item.isFavorite ? 'bg-yellow-500 text-white' : 'bg-white/80 text-gray-700'}`}
                  >
                    {item.isFavorite ? '★' : '☆'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleAddToVault(item.id); }}
                    className="p-1.5 bg-white/80 rounded-full text-gray-700"
                    title="Hide in vault"
                  >
                    🔒
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="p-1.5 bg-red-500 rounded-full text-white"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {items.map(item => (
              <div
                key={item.id}
                className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                onClick={() => onItemSelect?.(item)}
              >
                <div className="w-16 h-12 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center mr-3">
                  {item.type === 'video' ? '🎬' : '🎵'}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm dark:text-white truncate">{item.title}</h3>
                  <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
                    <span>{item.format.toUpperCase()}</span>
                    <span>{formatFileSize(item.size)}</span>
                    {item.duration && <span>{formatDuration(item.duration)}</span>}
                    {item.compressionRatio !== undefined && (
                      <span className="text-green-600">-{Math.round(item.compressionRatio)}%</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleFavorite(item.id); }}
                    className={`text-lg ${item.isFavorite ? 'text-yellow-500' : 'text-gray-400'}`}
                  >
                    {item.isFavorite ? '★' : '☆'}
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                    className="text-red-500 hover:text-red-700"
                  >
                    🗑
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
