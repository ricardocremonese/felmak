
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface EarlyAccessButtonProps {
  onClick?: () => void;
  className?: string;
}

export const EarlyAccessButton: React.FC<EarlyAccessButtonProps> = ({ 
  onClick, 
  className = '' 
}) => {
  return (
    <a 
      href="#" 
      onClick={onClick}
      className={`
        relative inline-block px-6 py-3 
        text-white font-semibold 
        bg-[#9b87f5] hover:bg-[#8a75e6]
        rounded-lg 
        transition-all duration-300 
        group
        overflow-hidden
        ${className}
      `}
    >
      <span className="relative z-10 flex items-center gap-2">
        Get early access
        <ArrowRight 
          className="transition-transform group-hover:translate-x-1 size-4" 
        />
      </span>
      
      {/* Shine effect */}
      <span 
        className="
          absolute 
          top-0 left-0 
          w-full h-full 
          bg-white 
          opacity-20 
          animate-shine
          pointer-events-none
        "
      />
    </a>
  );
};
