import React from 'react';

interface AuthLayoutProps {
  children: React.ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  return (
    <div className="w-full max-w-md">
      {children}
    </div>
  );
};

export default AuthLayout;