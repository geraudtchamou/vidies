# VideoTools - Cross-Platform Video Processing App

A privacy-first, cross-platform application for downloading videos, converting to audio, and compressing videos efficiently.

## 🌟 Features

### Video Downloader
- Paste URLs from YouTube, TikTok, Instagram Reels, and more
- Upload local video files
- Detect and show available formats (720p, 1080p, 4K)
- Download in multiple formats (MP4, WebM, MKV)

### Video-to-Audio Converter
- Extract audio from any video
- Multiple output formats: MP3, WAV, AAC, FLAC, OGG
- Choose audio quality/bitrate (128-320 kbps)
- Estimated file size before processing

### Smart Video Compression
- Modern codecs: H.264, H.265/HEVC, AV1
- Compression modes:
  - **Quality-first**: Minimal loss, slight size reduction
  - **Size-first**: Aggressive compression (up to 90% smaller)
  - **Balanced**: Good quality/size ratio
- Platform presets: Instagram, TikTok, WhatsApp, Telegram, Archive
- Custom resolution, bitrate, and codec settings

## 🏗️ Architecture

```
videotools/
├── packages/
│   └── core/              # Shared TypeScript library
│       ├── types.ts       # Type definitions
│       ├── compression-profiles.ts  # Preset configurations
│       ├── video-downloader.ts      # URL parsing & format detection
│       └── video-converter.ts       # FFmpeg abstraction
├── apps/
│   ├── web/               # Next.js web application
│   │   ├── src/
│   │   │   ├── app/       # Next.js 13+ app router
│   │   │   └── components/# React components
│   │   └── public/
│   └── mobile/            # React Native + Expo app
│       ├── src/
│       │   ├── screens/   # Mobile screens
│       │   └── utils/     # Utilities (FFmpeg wrapper)
│       └── assets/
└── services/
    └── api/               # Optional Rust backend (future)
```

## 🚀 Getting Started

### Prerequisites
- Node.js >= 18.0.0
- Yarn >= 1.22.0
- For mobile: Expo CLI, Xcode (iOS), Android Studio (Android)

### Installation

```bash
# Install dependencies
yarn install

# Build the core library
yarn build:core
```

### Development

#### Web App
```bash
yarn dev:web
```
Opens at http://localhost:3000

#### Mobile App
```bash
yarn dev:mobile
```
Scan QR code with Expo Go app

### Building for Production

```bash
# Build all projects
yarn build

# Or build individually
yarn build:web
yarn build:mobile
```

## 🔒 Privacy First

- **Web**: All video processing happens in-browser using FFmpeg.wasm
- **Mobile**: Processing done on-device using native FFmpeg bindings
- Files never leave the user's device unless explicitly uploaded to cloud storage

## 📱 Platform-Specific Features

### Web
- FFmpeg.wasm for client-side processing
- Drag-and-drop file uploads
- Progress visualization with pause/cancel support
- Download history (stored in IndexedDB)

### Mobile (iOS & Android)
- Built-in browser for easy URL import
- Background download manager with notifications
- Save to camera roll / gallery
- Share sheet integration
- Offline access to processed files

## 🛠️ Tech Stack

### Shared Core
- TypeScript
- Common logic for video processing

### Web
- Next.js 14 (App Router)
- React 18
- TailwindCSS
- FFmpeg.wasm
- Zustand (state management)

### Mobile
- React Native
- Expo SDK 50
- ffmpeg-kit-react-native
- React Navigation
- AsyncStorage

## 📋 API Reference

### Core Library

```typescript
import { 
  videoDownloader, 
  COMPRESSION_PROFILES,
  detectPlatform,
  formatFileSize 
} from '@videotools/core';

// Fetch video info from URL
const videoInfo = await videoDownloader.fetchVideoInfo(url);

// Get compression profiles
const profiles = COMPRESSION_PROFILES;

// Format file sizes
const sizeStr = formatFileSize(1024 * 1024 * 50); // "50 MB"
```

### Compression Profiles

| Profile | Codec | Mode | Use Case |
|---------|-------|------|----------|
| Instagram | H.264 | Balanced | IG posts/stories |
| TikTok | H.264 | Balanced | TikTok videos |
| WhatsApp | H.264 | Size-first | Quick sharing |
| Archive | H.265 | Quality-first | Long-term storage |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## ⚠️ Legal Notice

This tool is intended for downloading content you have rights to or that is available under appropriate licenses. Always respect copyright laws and platform terms of service.

---

Built with ❤️ for creators everywhere
