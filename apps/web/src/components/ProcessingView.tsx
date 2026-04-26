'use client';

type ActionType = 'download' | 'convert-audio' | 'compress';

interface ProcessingViewProps {
  actionType: ActionType;
  progress: number;
  status: string;
  eta?: number;
  onProcess: () => void;
  onCancel: () => void;
}

export default function ProcessingView({
  actionType,
  progress,
  status,
  eta,
  onProcess,
  onCancel
}: ProcessingViewProps) {
  const getActionTitle = () => {
    switch (actionType) {
      case 'download':
        return 'Downloading Video';
      case 'convert-audio':
        return 'Converting to Audio';
      case 'compress':
        return 'Compressing Video';
    }
  };

  const getActionIcon = () => {
    switch (actionType) {
      case 'download':
        return '⬇️';
      case 'convert-audio':
        return '🎵';
      case 'compress':
        return '📦';
    }
  };

  return (
    <div className="space-y-6 text-center py-8">
      {/* Icon */}
      <div className="text-6xl mb-4 animate-pulse">{getActionIcon()}</div>

      {/* Title */}
      <h3 className="text-xl font-semibold">{getActionTitle()}</h3>

      {/* Progress Bar */}
      <div className="relative pt-1">
        <div className="flex mb-2 items-center justify-between">
          <div>
            <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-blue-600 bg-blue-200 dark:text-blue-400 dark:bg-blue-900/30">
              {progress}%
            </span>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold inline-block text-gray-600 dark:text-gray-400">
              {status}
            </span>
          </div>
        </div>
        <div className="overflow-hidden h-3 mb-4 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
          <div
            style={{ width: `${progress}%` }}
            className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
          ></div>
        </div>

        {/* ETA */}
        {eta !== undefined && eta > 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Estimated time remaining: {Math.ceil(eta)}s
          </p>
        )}
      </div>

      {/* Status Message */}
      <p className="text-gray-600 dark:text-gray-400 text-sm">
        {progress === 0 ? 'Ready to start...' : progress < 100 ? 'Processing... Please wait.' : 'Complete!'}
      </p>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-6 justify-center">
        {progress > 0 && progress < 100 ? (
          <>
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-xl font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled
              className="px-6 py-3 bg-gray-400 text-white font-semibold rounded-xl cursor-not-allowed opacity-50"
            >
              Processing...
            </button>
          </>
        ) : progress === 0 ? (
          <button
            onClick={onProcess}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
          >
            Start Processing
          </button>
        ) : null}
      </div>

      {/* Privacy Notice */}
      <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
        <p className="text-sm text-blue-700 dark:text-blue-400">
          🔒 Your file is being processed locally in your browser. It never leaves your device.
        </p>
      </div>
    </div>
  );
}
