interface ProgressBarProps {
  progress: number;
  className?: string;
  showPercentage?: boolean;
}

export function ProgressBar({ progress, className = '', showPercentage = false }: ProgressBarProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        ></div>
      </div>
      {showPercentage && (
        <div className="text-sm text-purple-600 font-medium text-center">
          {Math.round(progress)}%
        </div>
      )}
    </div>
  );
}
