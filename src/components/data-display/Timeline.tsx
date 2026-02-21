import type { ReactNode } from 'react';
import { format } from 'date-fns';

type TimelineEventType = 'info' | 'success' | 'warning' | 'error' | 'default';

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  timestamp: string;
  type?: TimelineEventType;
  icon?: ReactNode;
}

interface TimelineProps {
  events: TimelineEvent[];
  className?: string;
}

const dotColors: Record<TimelineEventType, string> = {
  default: 'bg-neutral-300 ring-neutral-100',
  info: 'bg-blue-500 ring-blue-100',
  success: 'bg-success-500 ring-success-100',
  warning: 'bg-warning-500 ring-warning-100',
  error: 'bg-error-500 ring-error-100',
};

const iconBgColors: Record<TimelineEventType, string> = {
  default: 'bg-neutral-100 text-neutral-400',
  info: 'bg-blue-50 text-blue-500',
  success: 'bg-success-50 text-success-500',
  warning: 'bg-warning-50 text-warning-500',
  error: 'bg-error-50 text-error-500',
};

const Timeline = ({ events, className = '' }: TimelineProps) => {
  return (
    <div className={`relative ${className}`}>
      {events.map((event, idx) => {
        const type = event.type || 'default';
        const isLast = idx === events.length - 1;

        return (
          <div key={event.id} className="relative flex gap-4">
            {/* Vertical line */}
            {!isLast && (
              <div className="absolute left-[15px] top-8 bottom-0 w-px bg-neutral-200" />
            )}

            {/* Dot / Icon */}
            <div className="flex-shrink-0 mt-1">
              {event.icon ? (
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${iconBgColors[type]}`}
                >
                  {event.icon}
                </div>
              ) : (
                <div
                  className={`w-3 h-3 rounded-full ring-4 mt-1.5 ml-[2.5px] ${dotColors[type]}`}
                />
              )}
            </div>

            {/* Content */}
            <div className={`flex-1 ${isLast ? 'pb-0' : 'pb-6'}`}>
              <p className="text-sm font-medium text-neutral-600">{event.title}</p>
              {event.description && (
                <p className="text-xs text-neutral-400 mt-0.5">{event.description}</p>
              )}
              <p className="text-2xs text-neutral-300 mt-1">
                {format(new Date(event.timestamp), 'MMM d, yyyy h:mm a')}
              </p>
            </div>
          </div>
        );
      })}

      {events.length === 0 && (
        <p className="text-sm text-neutral-400 text-center py-8">No activity yet</p>
      )}
    </div>
  );
};

export default Timeline;
