const { createClient } = require('@supabase/supabase-js');

// Configuração do Supabase
const SUPABASE_URL = "https://ewbkurucdynoypfkpemf.supabase.co";
const SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3Ymt1cnVjZHlub3lwZmtwZW1mIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0MzcwNDI3OSwiZXhwIjoyMDU5MjgwMjc5fQ.Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8Ej8"; // Você precisará da service key

// Criar cliente Supabase com service role (admin)
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function createDemoUser() {
  try {
    console.log('Criando usuário de demonstração...');
    
    // 1. Criar o usuário no sistema de autenticação do Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'demo@mydearcrm.com.br',
      password: 'teste12345',
      email_confirm: true, // Confirmar email automaticamente
      user_metadata: {
        full_name: 'Usuário Demonstração'
      }
    });

    if (authError) {
      console.error('Erro ao criar usuário:', authError);
      return;
    }

    console.log('Usuário criado com sucesso:', authData.user.id);

    // 2. Criar perfil na tabela profiles
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          full_name: 'Usuário Demonstração',
          email: 'demo@mydearcrm.com.br',
          is_first_login: false
        }
      ]);

    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
      return;
    }

    console.log('Perfil criado com sucesso!');
    console.log('\n=== USUÁRIO DE DEMONSTRAÇÃO CRIADO ===');
    console.log('Email: demo@mydearcrm.com.br');
    console.log('Senha: teste12345');
    console.log('ID do usuário:', authData.user.id);
    console.log('=====================================\n');

  } catch (error) {
    console.error('Erro geral:', error);
  }
}

// Executar o script
createDemoUser(); 