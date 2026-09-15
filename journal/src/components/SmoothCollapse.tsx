import React from 'react';

/** Height + opacity animate open/close (grid 0fr ↔ 1fr). */
export const SmoothCollapse: React.FC<{
  open: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ open, children, className }) => {
  return (
    <div
      className={className}
      aria-hidden={!open}
      style={{
        display: 'grid',
        gridTemplateRows: open ? '1fr' : '0fr',
        transition: 'grid-template-rows 320ms ease',
      }}
    >
      <div
        className="min-h-0"
        style={{
          overflow: 'hidden',
          opacity: open ? 1 : 0,
          transition: 'opacity 280ms ease',
        }}
      >
        {children}
      </div>
    </div>
  );
};
