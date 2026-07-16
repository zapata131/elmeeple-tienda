import React from 'react';

interface TactileSwitchProps {
  id?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}

export const TactileSwitch: React.FC<TactileSwitchProps> = ({ id, checked, onChange, label }) => {
  const switchId = id || `switch-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div
      role="switch"
      aria-checked={checked}
      tabIndex={0}
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      className="inline-flex items-center gap-3 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#8367C7]/40 rounded-full"
    >
      <div className="relative">
        <input
          id={switchId}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          onChange={(e) => {
            e.stopPropagation();
            onChange(e.target.checked);
          }}
          className="sr-only"
        />
        <div
          className={`w-12 h-6 rounded-full transition-colors duration-200 ease-in-out ${
            checked ? 'bg-[#8367C7]' : 'bg-gray-300'
          }`}
        >
          <div
            className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ease-in-out mt-0.5 ml-0.5 ${
              checked ? 'translate-x-6' : 'translate-x-0'
            }`}
          />
        </div>
      </div>
      <span className="text-sm font-medium text-[#3A3A3A]">{label}</span>
    </div>
  );
};
