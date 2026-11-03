import React from 'react';

interface NeumorphicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  inset?: boolean;
  hoverable?: boolean;
}

export const NeumorphicCard: React.FC<NeumorphicCardProps> = ({
  children,
  className = '',
  inset = false,
  hoverable = false,
  ...props
}) => {
  return (
    <div
      className={`
        p-6 rounded-[22px] transition-all duration-200
        ${inset ? 'neu-tab-active bg-[#E9EDF2] dark:bg-[#1C2534]' : 'neu-card'}
        ${hoverable ? 'hover:-translate-y-1 hover:shadow-neu-card-hover dark:hover:shadow-neu-dark-card-hover cursor-pointer' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

