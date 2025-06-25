import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const DemoSetup: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center">Configuração do Usuário Demo</CardTitle>
          <CardDescription className="text-center">
            Instruções para configurar o usuário de demonstração no Supabase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">Credenciais do Usuário Demo</h3>
            <div className="space-y-1 text-sm">
              <p><strong>Email:</strong> demo@mydearcrm.com.br</p>
              <p><strong>Senha:</strong> teste12345</p>
              <p><strong>Nome:</strong> Usuário Demonstração</p>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Passos para Configurar no Supabase:</h3>
            
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Badge variant="secondary" className="mt-1">1</Badge>
                <div>
                  <h4 className="font-medium">Acesse o Painel do Supabase</h4>
                  <p className="text-sm text-gray-600">Vá para <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">supabase.com/dashboard</a></p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Badge variant="secondary" className="mt-1">2</Badge>
                <div>
                  <h4 className="font-medium">Selecione o Projeto</h4>
                  <p className="text-sm text-gray-600">Escolha o projeto: <code className="bg-gray-100 px-1 rounded">ewbkurucdynoypfkpemf</code></p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Badge variant="secondary" className="mt-1">3</Badge>
                <div>
                  <h4 className="font-medium">Vá para Authentication</h4>
                  <p className="text-sm text-gray-600">No menu lateral, clique em "Authentication" → "Users"</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Badge variant="secondary" className="mt-1">4</Badge>
                <div>
                  <h4 className="font-medium">Criar Usuário Manualmente</h4>
                  <p className="text-sm text-gray-600">Clique em "Add User" e preencha:</p>
                  <ul className="text-sm text-gray-600 ml-4 mt-1">
                    <li>• Email: demo@mydearcrm.com.br</li>
                    <li>• Password: teste12345</li>
                    <li>• Marque "Email confirmed"</li>
                  </ul>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Badge variant="secondary" className="mt-1">5</Badge>
                <div>
                  <h4 className="font-medium">Adicionar ao Perfil</h4>
                  <p className="text-sm text-gray-600">Vá para "Table Editor" → "profiles" e adicione:</p>
                  <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
{`{
  "id": "ID_DO_USUARIO_CRIADO",
  "full_name": "Usuário Demonstração",
  "email": "demo@mydearcrm.com.br",
  "is_first_login": false
}`}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Importante</h3>
            <p className="text-sm text-yellow-700">
              Em produção, o Supabase requer confirmação de email por padrão. 
              Para o usuário demo funcionar, você precisa criar manualmente no painel 
              do Supabase ou configurar a confirmação automática de email.
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              variant="outline"
            >
              Abrir Supabase Dashboard
            </Button>
            
            <Button 
              onClick={() => window.open('https://mydearcrm2.vercel.app/login', '_blank')}
            >
              Testar Login
            </Button>
          </div>

          <div className="text-center text-sm text-gray-500">
            <p>Após configurar no Supabase, você poderá fazer login com as credenciais acima.</p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default DemoSetup; 