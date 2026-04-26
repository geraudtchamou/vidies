'use client';

import React, { useState } from 'react';
import { BatchJob, IndividualJob, JobStatus } from '@videoproc/core';
import { getBatchProcessor } from '@videoproc/core';

interface BatchQueueProps {
  onJobSelect?: (job: IndividualJob) => void;
}

export default function BatchQueue({ onJobSelect }: BatchQueueProps) {
  const [batches, setBatches] = useState<BatchJob[]>([]);
  const [expandedBatch, setExpandedBatch] = useState<string | null>(null);

  // Refresh batches from processor
  const refreshBatches = () => {
    const processor = getBatchProcessor();
    setBatches(processor.getAllBatches());
  };

  const handlePause = (batchId: string) => {
    const processor = getBatchProcessor();
    processor.pauseBatch(batchId);
    refreshBatches();
  };

  const handleResume = (batchId: string) => {
    const processor = getBatchProcessor();
    processor.resumeBatch(batchId);
    refreshBatches();
  };

  const handleCancel = (batchId: string) => {
    if (confirm('Are you sure you want to cancel this batch?')) {
      const processor = getBatchProcessor();
      processor.cancelBatch(batchId);
      refreshBatches();
    }
  };

  const handleRetry = async (batchId: string) => {
    const processor = getBatchProcessor();
    await processor.retryFailedJobs(batchId);
    refreshBatches();
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: JobStatus) => {
    switch (status) {
      case 'completed': return '✓';
      case 'processing': return '⟳';
      case 'paused': return '⏸';
      case 'failed': return '✗';
      case 'cancelled': return '⊘';
      default: return '○';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold dark:text-white">Processing Queue</h2>
        <button
          onClick={refreshBatches}
          className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400"
        >
          Refresh
        </button>
      </div>

      {batches.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <p>No active jobs</p>
          <p className="text-sm mt-1">Add videos to start processing</p>
        </div>
      ) : (
        <div className="space-y-3">
          {batches.map((batch) => (
            <div
              key={batch.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden"
            >
              {/* Batch Header */}
              <div
                className="bg-gray-50 dark:bg-gray-700 px-4 py-3 cursor-pointer flex items-center justify-between"
                onClick={() => setExpandedBatch(expandedBatch === batch.id ? null : batch.id)}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-lg">{getStatusIcon(batch.status)}</span>
                  <div>
                    <h3 className="font-medium dark:text-white">{batch.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {batch.jobs.filter(j => j.status === 'completed').length}/{batch.jobs.length} completed
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(batch.status)}`}>
                    {batch.status}
                  </span>
                  
                  <div className="w-32 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${batch.overallProgress}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-600 dark:text-gray-400 w-12">
                    {batch.overallProgress}%
                  </span>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedBatch === batch.id && (
                <div className="p-4 bg-white dark:bg-gray-800">
                  <div className="space-y-2">
                    {batch.jobs.map((job) => (
                      <div
                        key={job.id}
                        className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded"
                      >
                        <div className="flex items-center space-x-3 flex-1">
                          <span className={`text-sm ${getStatusColor(job.status)} px-2 py-0.5 rounded`}>
                            {getStatusIcon(job.status)}
                          </span>
                          <span className="text-sm dark:text-white truncate">
                            {'localPath' in job.source 
                              ? job.source.localPath.split('/').pop()
                              : (job.source as any).filename || 'Unknown'}
                          </span>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-1.5">
                            <div
                              className="bg-blue-600 h-1.5 rounded-full"
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                          <span className="text-xs text-gray-500 dark:text-gray-400 w-10">
                            {job.progress}%
                          </span>
                          
                          {job.error && (
                            <span className="text-xs text-red-500" title={job.error}>
                              ⚠
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Batch Actions */}
                  <div className="mt-4 flex justify-end space-x-2">
                    {batch.status === 'processing' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handlePause(batch.id); }}
                        className="px-3 py-1.5 text-sm bg-yellow-500 text-white rounded hover:bg-yellow-600"
                      >
                        Pause
                      </button>
                    )}
                    
                    {batch.status === 'paused' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleResume(batch.id); }}
                        className="px-3 py-1.5 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Resume
                      </button>
                    )}
                    
                    {batch.status !== 'completed' && batch.status !== 'cancelled' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleCancel(batch.id); }}
                        className="px-3 py-1.5 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Cancel
                      </button>
                    )}
                    
                    {batch.jobs.some(j => j.status === 'failed') && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRetry(batch.id); }}
                        className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Retry Failed
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Scheduled Processing Info */}
      {batches.some(b => b.scheduledFor && b.scheduledFor > Date.now()) && (
        <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            ⏰ Some jobs are scheduled for processing when idle or on WiFi
          </p>
        </div>
      )}
    </div>
  );
}
