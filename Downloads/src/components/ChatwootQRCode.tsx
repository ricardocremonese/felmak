
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import chatwootService from "@/services/ChatwootService";

interface ChatwootQRCodeProps {
  onScan: () => void;
}

const ChatwootQRCode: React.FC<ChatwootQRCodeProps> = ({ onScan }) => {
  // Na integração real, o QR Code seria recuperado da API do Chatwoot
  const qrCodeSrc = chatwootService.generateQRCode();

  return (
    <Card className="p-6 max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Conecte seu WhatsApp</CardTitle>
        <CardDescription className="text-center mb-4">
          Escaneie o QR code abaixo com seu WhatsApp para integrar com o Chatwoot
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex justify-center">
        <div className="bg-white p-4 rounded-lg">
          <img 
            src={qrCodeSrc} 
            alt="QR Code WhatsApp" 
            className="w-64 h-64"
          />
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-4">
        <Button 
          className="w-full"
          onClick={onScan}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Gerar Novo QR Code
        </Button>
        
        <div className="text-sm text-gray-600">
          <p className="font-semibold mb-1">Dicas para conectar:</p>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Abra o WhatsApp no seu telefone</li>
            <li>Acesse Configurações &gt; Aparelhos conectados</li>
            <li>Toque em "Conectar um aparelho"</li>
            <li>Aponte a câmera para o QR Code acima</li>
          </ol>
        </div>
      </CardFooter>
    </Card>
  );
};

export default ChatwootQRCode;
