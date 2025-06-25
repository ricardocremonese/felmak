
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Sun, 
  Moon, 
  Languages, 
  Info
} from "lucide-react";
import { useTheme } from "@/context/ThemeContext";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const SystemConfig = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [language, setLanguage] = useState("pt-BR");
  const systemVersion = "1.0";

  const handleThemeChange = (value: "light" | "dark") => {
    setTheme(value);
    toast({
      title: value === "dark" ? "Modo escuro ativado" : "Modo claro ativado",
      description: value === "dark" 
        ? "O sistema agora está usando o tema escuro" 
        : "O sistema agora está usando o tema claro",
    });
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    
    let languageName = "";
    switch(value) {
      case "pt-BR":
        languageName = "Português do Brasil";
        break;
      case "en":
        languageName = "English";
        break;
      case "fr":
        languageName = "Français";
        break;
      case "de":
        languageName = "Deutsch";
        break;
    }
    
    toast({
      title: "Idioma alterado",
      description: `O idioma do sistema foi alterado para ${languageName}`,
    });
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-8 pt-6 overflow-auto ml-0 lg:ml-64">
        <div className="flex items-center mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-2" 
            onClick={() => navigate("/administration")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-2xl font-bold dark:text-white">Configuração do Sistema</h1>
        </div>

        <div className="grid gap-6">
          {/* Tema do Sistema */}
          <Card className="dark:bg-gray-800">
            <CardHeader>
              <div className="flex items-center">
                {theme === "dark" ? (
                  <Moon className="h-5 w-5 mr-2 text-blue-500" />
                ) : (
                  <Sun className="h-5 w-5 mr-2 text-yellow-500" />
                )}
                <CardTitle className="dark:text-white">Tema</CardTitle>
              </div>
              <CardDescription className="dark:text-gray-400">
                Escolha entre o modo claro e escuro para o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup 
                defaultValue={theme} 
                onValueChange={(value) => handleThemeChange(value as "light" | "dark")}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="light" id="light" />
                  <Label htmlFor="light" className="cursor-pointer dark:text-white">
                    <div className="flex items-center">
                      <Sun className="h-4 w-4 mr-2 text-yellow-500" />
                      Modo Claro
                    </div>
                  </Label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="dark" id="dark" />
                  <Label htmlFor="dark" className="cursor-pointer dark:text-white">
                    <div className="flex items-center">
                      <Moon className="h-4 w-4 mr-2 text-blue-500" />
                      Modo Escuro
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Versão do Sistema */}
          <Card className="dark:bg-gray-800">
            <CardHeader>
              <div className="flex items-center">
                <Info className="h-5 w-5 mr-2 text-green-500" />
                <CardTitle className="dark:text-white">Versão do Sistema</CardTitle>
              </div>
              <CardDescription className="dark:text-gray-400">
                Informações sobre a versão atual do MyDearCRM
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2 dark:text-white">
                <span className="font-semibold">Versão:</span>
                <span>{systemVersion}</span>
              </div>
            </CardContent>
          </Card>

          {/* Idioma do Sistema */}
          <Card className="dark:bg-gray-800">
            <CardHeader>
              <div className="flex items-center">
                <Languages className="h-5 w-5 mr-2 text-purple-500" />
                <CardTitle className="dark:text-white">Idioma</CardTitle>
              </div>
              <CardDescription className="dark:text-gray-400">
                Selecione o idioma para o sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select defaultValue={language} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-full sm:w-72 dark:bg-gray-700 dark:text-white dark:border-gray-600">
                  <SelectValue placeholder="Selecione um idioma" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700">
                  <SelectItem value="pt-BR">Português do Brasil</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="de">Deutsch</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SystemConfig;
