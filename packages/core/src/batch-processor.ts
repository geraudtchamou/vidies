/**
 * Batch Processing and Job Queue Management
 * Handles batch operations, scheduling, parallel jobs, and progress tracking
 */

import {
  BatchJob,
  IndividualJob,
  JobStatus,
  JobType,
  ProcessOptions,
  JobProgress,
  VideoInfo,
  PrivacySettings,
  UsageStats
} from './types';

export class BatchProcessor {
  private jobs: Map<string, IndividualJob> = new Map();
  private batches: Map<string, BatchJob> = new Map();
  private activeJobCount: number = 0;
  private maxConcurrentJobs: number = 3;
  private isProcessing: boolean = false;
  private wifiOnly: boolean = false;
  private processWhenIdle: boolean = false;
  
  // Callbacks
  onJobProgress?: (progress: JobProgress) => void;
  onJobComplete?: (job: IndividualJob) => void;
  onBatchComplete?: (batch: BatchJob) => void;
  onJobError?: (job: IndividualJob, error: Error) => void;

  constructor(options?: {
    maxConcurrentJobs?: number;
    wifiOnly?: boolean;
    processWhenIdle?: boolean;
  }) {
    this.maxConcurrentJobs = options?.maxConcurrentJobs ?? 3;
    this.wifiOnly = options?.wifiOnly ?? false;
    this.processWhenIdle = options?.processWhenIdle ?? false;
  }

  /**
   * Create a new batch job with multiple individual jobs
   */
  createBatch(name: string, sources: Array<VideoInfo | { localPath: string }>, options: ProcessOptions): BatchJob {
    const batchId = this.generateId('batch');
    const timestamp = Date.now();
    
    const individualJobs: IndividualJob[] = sources.map((source, index) => {
      const jobId = this.generateId('job');
      const job: IndividualJob = {
        id: jobId,
        batchId,
        source,
        options: { ...options, priority: options.priority || 'normal' },
        status: 'pending',
        progress: 0,
        retryCount: 0
      };
      
      this.jobs.set(jobId, job);
      return job;
    });

    const batch: BatchJob = {
      id: batchId,
      name,
      jobs: individualJobs,
      status: 'pending',
      overallProgress: 0,
      createdAt: timestamp,
      scheduledFor: options.scheduleForIdle ? this.calculateScheduleTime() : undefined,
      wifiOnly: options.wifiOnly ?? this.wifiOnly
    };

    this.batches.set(batchId, batch);
    return batch;
  }

  /**
   * Add a single job (not part of a batch)
   */
  addJob(source: VideoInfo | { localPath: string }, options: ProcessOptions): IndividualJob {
    const batch = this.createBatch('Single Job', [source], options);
    return batch.jobs[0];
  }

  /**
   * Start processing a batch
   */
  async startBatch(batchId: string): Promise<void> {
    const batch = this.batches.get(batchId);
    if (!batch) throw new Error(`Batch ${batchId} not found`);

    if (batch.scheduledFor && batch.scheduledFor > Date.now()) {
      batch.status = 'queued';
      this.scheduleBatchProcessing(batch);
      return;
    }

    batch.status = 'processing';
    batch.startedAt = Date.now();
    
    // Start processing pending jobs in the batch
    await this.processBatchJobs(batch);
  }

  /**
   * Start all pending batches
   */
  async startAllPending(): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    
    for (const batch of this.batches.values()) {
      if (batch.status === 'pending' || batch.status === 'paused') {
        // Check wifi-only constraint
        if (batch.wifiOnly && !await this.isWifiConnected()) {
          continue; // Skip until WiFi is available
        }
        
        await this.startBatch(batch.id);
      }
    }
    
    this.isProcessing = false;
  }

  /**
   * Pause a batch
   */
  pauseBatch(batchId: string): void {
    const batch = this.batches.get(batchId);
    if (!batch) return;

    batch.status = 'paused';
    batch.jobs.forEach(job => {
      if (job.status === 'processing') {
        job.status = 'paused';
      }
    });
  }

  /**
   * Resume a paused batch
   */
  async resumeBatch(batchId: string): Promise<void> {
    const batch = this.batches.get(batchId);
    if (!batch || batch.status !== 'paused') return;

    await this.startBatch(batchId);
  }

  /**
   * Cancel a batch
   */
  cancelBatch(batchId: string): void {
    const batch = this.batches.get(batchId);
    if (!batch) return;

    batch.status = 'cancelled';
    batch.jobs.forEach(job => {
      if (job.status === 'pending' || job.status === 'processing' || job.status === 'paused') {
        job.status = 'cancelled';
      }
    });
  }

  /**
   * Get progress for a specific job
   */
  getJobProgress(jobId: string): JobProgress | null {
    const job = this.jobs.get(jobId);
    if (!job) return null;

    return {
      jobId: job.id,
      progress: job.progress,
      status: job.status,
      message: this.getStatusMessage(job),
      currentFile: this.getJobFilename(job)
    };
  }

  /**
   * Get overall batch progress
   */
  getBatchProgress(batchId: string): JobProgress | null {
    const batch = this.batches.get(batchId);
    if (!batch) return null;

    const completedJobs = batch.jobs.filter(j => j.status === 'completed').length;
    const failedJobs = batch.jobs.filter(j => j.status === 'failed').length;
    const totalJobs = batch.jobs.length;
    
    // Calculate weighted progress
    const totalProgress = batch.jobs.reduce((sum, job) => sum + job.progress, 0);
    const averageProgress = totalProgress / totalJobs;

    return {
      jobId: batch.id,
      progress: Math.round(averageProgress),
      status: batch.status,
      message: `${completedJobs}/${totalJobs} completed`,
      totalFiles: totalJobs,
      processedFiles: completedJobs + failedJobs
    };
  }

  /**
   * Update job progress
   */
  updateJobProgress(jobId: string, progress: number, status?: JobStatus): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.progress = Math.min(100, Math.max(0, progress));
    if (status) job.status = status;

    if (job.progress === 100 && job.status === 'processing') {
      job.status = 'completed';
      job.result = {
        id: job.id,
        status: 'completed',
        createdAt: new Date(),
        completedAt: new Date()
      };
      this.onJobComplete?.(job);
    }

    // Update batch progress
    if (job.batchId) {
      this.updateBatchProgress(job.batchId);
    }

    this.onJobProgress?.(this.getJobProgress(jobId)!);
  }

  /**
   * Mark job as failed
   */
  failJob(jobId: string, error: string): void {
    const job = this.jobs.get(jobId);
    if (!job) return;

    job.status = 'failed';
    job.error = error;
    job.retryCount++;

    this.onJobError?.(job, new Error(error));

    if (job.batchId) {
      this.updateBatchProgress(job.batchId);
    }
  }

  /**
   * Get all active jobs
   */
  getActiveJobs(): IndividualJob[] {
    return Array.from(this.jobs.values()).filter(
      job => job.status === 'processing' || job.status === 'pending' || job.status === 'paused'
    );
  }

  /**
   * Get all batches
   */
  getAllBatches(): BatchJob[] {
    return Array.from(this.batches.values());
  }

  /**
   * Get completed jobs count
   */
  getCompletedJobsCount(): number {
    return Array.from(this.jobs.values()).filter(job => job.status === 'completed').length;
  }

  /**
   * Retry failed jobs in a batch
   */
  async retryFailedJobs(batchId: string): Promise<void> {
    const batch = this.batches.get(batchId);
    if (!batch) return;

    const failedJobs = batch.jobs.filter(job => job.status === 'failed');
    failedJobs.forEach(job => {
      job.status = 'pending';
      job.progress = 0;
      job.error = undefined;
    });

    await this.startBatch(batchId);
  }

  /**
   * Clear completed jobs
   */
  clearCompleted(): void {
    for (const [jobId, job] of this.jobs.entries()) {
      if (job.status === 'completed' || job.status === 'cancelled' || job.status === 'failed') {
        this.jobs.delete(jobId);
      }
    }

    for (const [batchId, batch] of this.batches.entries()) {
      if (batch.status === 'completed' || batch.status === 'cancelled') {
        this.batches.delete(batchId);
      }
    }
  }

  /**
   * Set privacy settings that affect processing
   */
  applyPrivacySettings(settings: PrivacySettings): void {
    this.wifiOnly = settings.localOnlyMode;
    if (settings.autoDeleteAfterProcessing) {
      // Mark all jobs for auto-deletion
      for (const job of this.jobs.values()) {
        job.options.autoDeleteOriginal = true;
      }
    }
  }

  /**
   * Get usage statistics
   */
  getUsageStats(): UsageStats {
    const completedJobs = Array.from(this.jobs.values()).filter(j => j.status === 'completed');
    
    const stats: UsageStats = {
      totalFilesProcessed: completedJobs.length,
      totalSpaceSaved: 0,
      totalDownloaded: 0,
      conversionsByType: {
        download: 0,
        'convert-audio': 0,
        compress: 0,
        batch: 0
      },
      favoriteFormats: {},
      averageCompressionRatio: 0,
      lastProcessedAt: undefined
    };

    let totalCompressionRatio = 0;
    let compressionCount = 0;

    completedJobs.forEach(job => {
      // Count by type
      const action = job.options.action;
      stats.conversionsByType[action] = (stats.conversionsByType[action] || 0) + 1;

      // Track formats
      const format = job.options.targetFormat || 'unknown';
      stats.favoriteFormats[format] = (stats.favoriteFormats[format] || 0) + 1;

      // Calculate space saved
      if (job.result?.originalSize && job.result?.finalSize) {
        const saved = job.result.originalSize - job.result.finalSize;
        stats.totalSpaceSaved += saved;
        totalCompressionRatio += (saved / job.result.originalSize) * 100;
        compressionCount++;
      }

      // Track last processed
      if (job.result?.completedAt) {
        const timestamp = job.result.completedAt.getTime();
        if (!stats.lastProcessedAt || timestamp > stats.lastProcessedAt) {
          stats.lastProcessedAt = timestamp;
        }
      }
    });

    if (compressionCount > 0) {
      stats.averageCompressionRatio = Math.round(totalCompressionRatio / compressionCount);
    }

    return stats;
  }

  // Private helper methods

  private async processBatchJobs(batch: BatchJob): Promise<void> {
    const pendingJobs = batch.jobs.filter(j => j.status === 'pending');
    
    for (const job of pendingJobs) {
      // Check concurrency limit
      while (this.activeJobCount >= this.maxConcurrentJobs) {
        await this.sleep(100);
      }

      // Check wifi constraint
      if (batch.wifiOnly && !await this.isWifiConnected()) {
        await this.waitForWifi();
      }

      this.activeJobCount++;
      job.status = 'processing';

      try {
        // Simulate processing (in real implementation, this would call the actual processor)
        await this.simulateJobProcessing(job);
      } catch (error) {
        this.failJob(job.id, error instanceof Error ? error.message : 'Unknown error');
      } finally {
        this.activeJobCount--;
      }
    }

    // Check if batch is complete
    const allComplete = batch.jobs.every(j => 
      j.status === 'completed' || j.status === 'failed' || j.status === 'cancelled'
    );

    if (allComplete) {
      const hasFailures = batch.jobs.some(j => j.status === 'failed');
      batch.status = hasFailures ? 'completed' : 'completed';
      batch.completedAt = Date.now();
      this.onBatchComplete?.(batch);
    }
  }

  private async simulateJobProcessing(job: IndividualJob): Promise<void> {
    // Simulate progress updates
    for (let progress = 0; progress <= 100; progress += 10) {
      if (job.status === 'paused' || job.status === 'cancelled') {
        break;
      }
      
      this.updateJobProgress(job.id, progress);
      await this.sleep(200); // Simulate work
    }

    if (job.status !== 'cancelled') {
      this.updateJobProgress(job.id, 100, 'completed');
    }
  }

  private updateBatchProgress(batchId: string): void {
    const batch = this.batches.get(batchId);
    if (!batch) return;

    const totalJobs = batch.jobs.length;
    const completedJobs = batch.jobs.filter(j => j.status === 'completed').length;
    const failedJobs = batch.jobs.filter(j => j.status === 'failed').length;
    
    if (completedJobs + failedJobs === totalJobs) {
      batch.status = 'completed';
      batch.completedAt = Date.now();
      batch.overallProgress = 100;
    } else {
      const totalProgress = batch.jobs.reduce((sum, job) => sum + job.progress, 0);
      batch.overallProgress = Math.round(totalProgress / totalJobs);
    }
  }

  private calculateScheduleTime(): number {
    const now = new Date();
    const scheduleTime = new Date(now);
    
    // Schedule for 2 hours from now or next day if late
    if (now.getHours() > 22) {
      scheduleTime.setDate(scheduleTime.getDate() + 1);
      scheduleTime.setHours(8, 0, 0, 0);
    } else {
      scheduleTime.setHours(now.getHours() + 2, 0, 0, 0);
    }
    
    return scheduleTime.getTime();
  }

  private scheduleBatchProcessing(batch: BatchJob): void {
    if (!batch.scheduledFor) return;

    const delay = batch.scheduledFor - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        this.startBatch(batch.id);
      }, delay);
    }
  }

  private async isWifiConnected(): Promise<boolean> {
    // In real implementation, check actual network status
    // For now, return true after a delay to simulate check
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 100);
    });
  }

  private async waitForWifi(): Promise<void> {
    // Poll every 5 seconds until WiFi is available
    while (!await this.isWifiConnected()) {
      await this.sleep(5000);
    }
  }

  private getStatusMessage(job: IndividualJob): string {
    switch (job.status) {
      case 'pending': return 'Waiting to start...';
      case 'queued': return 'Queued for processing';
      case 'processing': return `Processing... ${job.progress}%`;
      case 'paused': return 'Paused';
      case 'completed': return 'Completed';
      case 'failed': return `Failed: ${job.error}`;
      case 'cancelled': return 'Cancelled';
      default: return '';
    }
  }

  private getJobFilename(job: IndividualJob): string {
    if ('localPath' in job.source) {
      return job.source.localPath.split('/').pop() || 'Unknown';
    }
    return (job.source as VideoInfo).filename || 'Unknown';
  }

  private generateId(prefix: string): string {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance for app-wide use
let batchProcessorInstance: BatchProcessor | null = null;

export function getBatchProcessor(options?: {
  maxConcurrentJobs?: number;
  wifiOnly?: boolean;
  processWhenIdle?: boolean;
}): BatchProcessor {
  if (!batchProcessorInstance) {
    batchProcessorInstance = new BatchProcessor(options);
  }
  return batchProcessorInstance;
}

export function resetBatchProcessor(): void {
  batchProcessorInstance = null;
}
