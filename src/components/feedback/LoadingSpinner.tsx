interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'white' | 'neutral';
  fullScreen?: boolean;
  label?: string;
  className?: string;
}

const sizeStyles = {
  sm: 'w-5 h-5',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
};

const colorStyles = {
  primary: 'border-primary-500',
  white: 'border-white',
  neutral: 'border-neutral-400',
};

const LoadingSpinner = ({
  size = 'md',
  color = 'primary',
  fullScreen = false,
  label,
  className = '',
}: LoadingSpinnerProps) => {
  const spinner = (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      <div
        className={`
          ${sizeStyles[size]}
          border-2 border-neutral-200 rounded-full animate-spin
          ${colorStyles[color]}
          border-t-transparent
        `}
      />
      {label && (
        <p className={`text-sm ${color === 'white' ? 'text-white' : 'text-neutral-400'}`}>
          {label}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-[70] bg-white/80 flex items-center justify-center">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default LoadingSpinner;
