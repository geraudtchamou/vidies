# Performance Optimization Guide

## Hardware-Aware Processing

The MediaFlow application now automatically adapts compression and conversion speed based on the user's device capabilities (CPU, GPU, Memory) and network conditions.

### How It Works

#### 1. Device Capability Detection (`packages/core/src/device-capability.ts`)

The `DeviceCapabilityDetector` class analyzes:
- **CPU Cores**: Uses `navigator.hardwareConcurrency` to determine parallel processing capability
- **Memory**: Uses `navigator.deviceMemory` to estimate available RAM
- **GPU**: Detects WebGL support and GPU vendor/renderer for hardware acceleration potential
- **Threading Support**: Checks for `SharedArrayBuffer` availability (critical for multi-threaded FFmpeg.wasm)
- **Network Speed**: Uses Network Information API to detect connection quality

**Performance Scoring (0-100)**:
- CPU contribution: Up to 40 points (cores × 10)
- Memory contribution: Up to 30 points (GB × 5)
- GPU presence: 20 points
- Threading support: 10 points

#### 2. Adaptive Encoding Presets

Based on the performance score, the system automatically selects the optimal FFmpeg preset:

| Score Range | Preset | Use Case |
|-------------|--------|----------|
| 0-29 | `ultrafast` | Low-end devices, prioritize speed |
| 30-49 | `veryfast` | Budget devices |
| 50-69 | `faster` | Mid-range devices |
| 70-89 | `medium` | Good balance |
| 90+ | `slow` | High-end devices, better compression |

**Special Modes**:
- **Quality-First**: Uses slower presets when hardware allows (score > 70 → `slow`)
- **Size-First**: Maximizes compression on capable devices (score > 80 → `slower`)

#### 3. Dynamic Thread Allocation

Thread count is automatically calculated:
```typescript
threads = max(1, cpuCores - 1)
```
This leaves one core free for UI rendering to maintain responsiveness.

#### 4. Quality Adjustments (CRF)

The Constant Rate Factor (CRF) is adjusted based on device capability:
- **Low-end devices** (score < 40): CRF increased by 2 (faster encoding, slightly lower quality)
- **High-end devices** (score > 80) + Quality-First mode: CRF decreased by 2 (slower, better quality)

### Platform Implementations

#### Web (FFmpeg.wasm)
- **File**: `apps/web/src/lib/web-video-converter.ts`
- Detects SharedArrayBuffer support for multi-threading
- Loads appropriate worker threads based on CPU cores
- Processes entirely in-browser (privacy-first)

**Optimization Features**:
```typescript
// Multi-threading enabled only if supported
const useMultiThread = deviceProfile.supportsSharedArrayBuffer;

// Optimal thread count
const threads = Math.max(1, deviceProfile.cpuCores - 1);
```

#### Mobile (ffmpeg-kit)
- **File**: `apps/mobile/src/lib/mobile-video-converter.ts`
- Uses native hardware acceleration:
  - **iOS**: VideoToolbox (`-hwaccel videotoolbox`)
  - **Android**: MediaCodec (`-hwaccel mediacodec`)
- Statistics callback for real-time progress tracking

**Platform-Specific Optimizations**:
```typescript
if (Platform.OS === 'ios') {
  FFmpegKitConfig.setArgument('-hwaccel', 'videotoolbox');
} else if (Platform.OS === 'android') {
  FFmpegKitConfig.setArgument('-hwaccel', 'mediacodec');
}
```

### Usage Example

```typescript
import { webVideoConverter } from '@/lib/web-video-converter';
import { compressionProfiles } from '@mediaflow/core';

// Initialize (auto-detects device capabilities)
await webVideoConverter.initialize();

// Get detected device profile
const deviceProfile = webVideoConverter.getDeviceProfile();
console.log(`Performance Score: ${deviceProfile?.estimatedPerformanceScore}/100`);
console.log(`Recommended Preset: ${deviceProfile ? getAdaptivePreset(deviceProfile) : 'medium'}`);

// Convert with automatic optimization
await webVideoConverter.compress(
  videoFile,
  compressionProfiles.find(p => p.id === 'balanced')!,
  {
    onProgress: (progress) => {
      console.log(`${progress.progress}% - ${progress.message}`);
    },
    onComplete: (result) => {
      console.log('Conversion completed!', result);
    }
  }
);
```

### Benefits

1. **Faster Processing on Low-End Devices**: Automatically uses faster presets to avoid frustrating wait times
2. **Better Quality on High-End Devices**: Leverages powerful hardware for superior compression efficiency
3. **Responsive UI**: Reserves CPU cores for UI rendering during processing
4. **Battery Efficient**: Adapts to prevent thermal throttling and excessive battery drain
5. **Network Aware**: Can defer processing on slow connections (when combined with batch scheduling)

### Customization

Developers can override automatic settings:

```typescript
await converter.convert({
  input: file,
  profile: myProfile,
  customSettings: {
    preset: 'fast', // Override automatic preset
    crf: 20,        // Override automatic quality
  }
});
```

### Future Enhancements

- [ ] Real-time thermal throttling detection
- [ ] Battery level awareness (reduce intensity on low battery)
- [ ] Background/foreground state adaptation
- [ ] Machine learning-based ETA prediction
- [ ] Cloud vs local processing decision based on device capability
