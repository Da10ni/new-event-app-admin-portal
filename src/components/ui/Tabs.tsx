interface Tab {
  key: string;
  label: string;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (key: string) => void;
  className?: string;
}

const Tabs = ({
  tabs,
  activeTab,
  onChange,
  className = '',
}: TabsProps) => {
  return (
    <div className={`border-b border-neutral-200 ${className}`}>
      <nav className="flex gap-0 -mb-px overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              onClick={() => onChange(tab.key)}
              className={`
                relative px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors
                ${isActive
                  ? 'text-primary-500'
                  : 'text-neutral-400 hover:text-neutral-600'
                }
              `}
            >
              <span className="flex items-center gap-2">
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`
                      px-1.5 py-0.5 rounded-full text-2xs font-semibold
                      ${isActive
                        ? 'bg-primary-50 text-primary-500'
                        : 'bg-neutral-100 text-neutral-400'
                      }
                    `}
                  >
                    {tab.count}
                  </span>
                )}
              </span>
              {/* Active indicator */}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;
