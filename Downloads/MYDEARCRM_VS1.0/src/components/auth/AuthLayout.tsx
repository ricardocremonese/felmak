
import React from "react";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-r from-[#e2e2e2] to-[#c9d6ff]">
      <div className="bg-white rounded-[30px] shadow-[0_5px_15px_rgba(0,0,0,0.35)] relative overflow-hidden w-[768px] max-w-full py-10 px-6 md:px-10">
        <div className="flex flex-col items-center">
          <img 
            src="/lovable-uploads/53d085a6-b570-4f97-b913-ce5a65b555aa.png" 
            alt="MyDear CRM Logo" 
            className="h-16 w-auto mb-6"
          />
          <h1 className="text-2xl font-bold mb-6">{title}</h1>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
