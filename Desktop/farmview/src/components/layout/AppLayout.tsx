
import React from 'react';
import { Outlet } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopBar from './TopBar';
import Sidebar from './Sidebar';
import { SidebarProvider } from '@/components/ui/sidebar';

const AppLayout = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen bg-background text-foreground w-full">
        <TopBar />
        
        <div className="flex">
          <Sidebar />
          
          <motion.main 
            className="flex-1 pl-64 pt-16"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="container p-4 md:p-6 mx-auto">
              <Outlet />
            </div>
          </motion.main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;
