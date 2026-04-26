/**
 * DeviceCapabilityDetector
 * Analyzes user's hardware (CPU, GPU, Memory) and Network conditions
 * to recommend optimal processing settings.
 */

export interface DeviceProfile {
  cpuCores: number;
  logicalProcessors: number;
  memoryGB: number;
  hasHardwareConcurrency: boolean;
  gpuVendor: string | null;
  gpuRenderer: string | null;
  supportsWebGL: boolean;
  supportsSharedArrayBuffer: boolean; // Critical for multi-threaded FFmpeg.wasm
  networkSpeed: 'slow' | 'moderate' | 'fast' | 'unknown';
  estimatedPerformanceScore: number; // 0-100
}

export class DeviceCapabilityDetector {
  private navigator: Navigator;

  constructor() {
    this.navigator = navigator;
  }

  async detect(): Promise<DeviceProfile> {
    const cpuCores = this.navigator.hardwareConcurrency || 2;
    const memory = (this.navigator as any).deviceMemory || 4;
    const hasSharedArrayBuffer = typeof SharedArrayBuffer !== 'undefined';
    
    const gpuInfo = await this.detectGPU();
    const networkSpeed = await this.detectNetworkSpeed();

    // Calculate a performance score (0-100)
    let score = 0;
    score += Math.min(cpuCores * 10, 40); // Max 40 pts for CPU
    score += Math.min(memory * 5, 30);    // Max 30 pts for RAM
    score += gpuInfo.supportsWebGL ? 20 : 0; // 20 pts for GPU presence
    score += hasSharedArrayBuffer ? 10 : 0;  // 10 pts for threading support

    return {
      cpuCores,
      logicalProcessors: cpuCores,
      memoryGB: memory,
      hasHardwareConcurrency: !!this.navigator.hardwareConcurrency,
      gpuVendor: gpuInfo.vendor,
      gpuRenderer: gpuInfo.renderer,
      supportsWebGL: gpuInfo.supportsWebGL,
      supportsSharedArrayBuffer: hasSharedArrayBuffer,
      networkSpeed,
      estimatedPerformanceScore: Math.min(100, Math.round(score)),
    };
  }

  private async detectGPU(): Promise<{ vendor: string | null; renderer: string | null; supportsWebGL: boolean }> {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      
      if (!gl) {
        return { vendor: null, renderer: null, supportsWebGL: false };
      }

      const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info');
      let vendor = 'Unknown';
      let renderer = 'Unknown';

      if (debugInfo) {
        vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) || 'Unknown';
        renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || 'Unknown';
      }

      return { vendor, renderer, supportsWebGL: true };
    } catch (e) {
      return { vendor: null, renderer: null, supportsWebGL: false };
    }
  }

  private async detectNetworkSpeed(): Promise<'slow' | 'moderate' | 'fast' | 'unknown'> {
    if ('connection' in this.navigator) {
      const conn = (this.navigator as any).connection;
      const effectiveType = conn.effectiveType; // '2g', '3g', '4g', 'slow-2g'

      if (effectiveType === '4g' || conn.downlink > 10) return 'fast';
      if (effectiveType === '3g' || conn.downlink > 1.5) return 'moderate';
      return 'slow';
    }
    
    // Fallback: Simple latency check could be added here, but default to moderate
    return 'unknown';
  }

  /**
   * Returns optimal FFmpeg thread count based on CPU cores
   */
  getOptimalThreadCount(profile: DeviceProfile): number {
    // Leave 1 core free for UI rendering
    return Math.max(1, profile.cpuCores - 1);
  }

  /**
   * Determines if we should use high-quality slow presets or fast presets
   */
  getEncodingPreset(profile: DeviceProfile): 'ultrafast' | 'fast' | 'medium' | 'slow' {
    if (profile.estimatedPerformanceScore < 40) return 'ultrafast';
    if (profile.estimatedPerformanceScore < 70) return 'fast';
    if (profile.estimatedPerformanceScore < 90) return 'medium';
    return 'slow'; // High-end devices can afford slower, better compression
  }
}

// Singleton instance
export const deviceDetector = new DeviceCapabilityDetector();
