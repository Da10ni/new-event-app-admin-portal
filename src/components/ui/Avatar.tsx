import { useState } from 'react';

type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  className?: string;
}

const sizeStyles: Record<AvatarSize, string> = {
  xs: 'w-6 h-6 text-2xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const bgColors = [
  'bg-primary-500',
  'bg-secondary-500',
  'bg-success-500',
  'bg-warning-500',
  'bg-purple-500',
  'bg-indigo-500',
  'bg-pink-500',
  'bg-teal-500',
];

const getInitials = (name: string): string => {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getColorFromName = (name: string): string => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return bgColors[Math.abs(hash) % bgColors.length];
};

const Avatar = ({
  src,
  alt = '',
  name = '',
  size = 'md',
  className = '',
}: AvatarProps) => {
  const [imgError, setImgError] = useState(false);
  const showImage = src && !imgError;

  return (
    <div
      className={`
        ${sizeStyles[size]}
        rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden
        ${showImage ? '' : getColorFromName(name || alt || 'A')}
        ${className}
      `}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span className="text-white font-semibold leading-none">
          {name ? getInitials(name) : alt ? getInitials(alt) : '?'}
        </span>
      )}
    </div>
  );
};

export default Avatar;
