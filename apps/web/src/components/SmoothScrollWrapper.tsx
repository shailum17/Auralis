import React from 'react';

interface SmoothScrollWrapperProps {
  children: React.ReactNode;
}

const SmoothScrollWrapper: React.FC<SmoothScrollWrapperProps> = ({ children }) => {
  return (
    <div className="scroll-smooth">
      {children}
    </div>
  );
};

export default SmoothScrollWrapper;