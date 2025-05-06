
import React from 'react';
import { Globe, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

const TopBar = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useSettings();
  const navigate = useNavigate();

  const languages = [
    { code: 'en', name: t('settings.english') },
    { code: 'pt-BR', name: t('settings.portugueseBR') },
  ];

  const toggleLanguage = (langCode: string) => {
    setLanguage(langCode as 'en' | 'pt-BR');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="h-16 flex items-center px-4 justify-between">
        <div className="flex items-center">
          <img 
            src="/lovable-uploads/d64b8d4b-3420-45d3-8796-6f349f1ce868.png" 
            alt="Yote Farmview Logo" 
            className="h-10 w-auto" 
          />
        </div>
        
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Globe size={20} />
                <motion.div 
                  key={language}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] w-4 h-4 rounded-full flex items-center justify-center"
                >
                  {language === 'en' ? 'EN' : 'PT'}
                </motion.div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {languages.map((lang) => (
                <DropdownMenuItem 
                  key={lang.code} 
                  onClick={() => toggleLanguage(lang.code)}
                  className={language === lang.code ? "bg-muted" : ""}
                >
                  {lang.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            title={t('common.logout')}
          >
            <LogOut size={20} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TopBar;
