import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://bxgypzvxhxuphemwdohu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z3lwenZ4aHh1cGhlbXdkb2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDA3OTUsImV4cCI6MjA3MzYxNjc5NX0.Z3LAIyZOJYNI-Phfz6vSlPT3H3RWGheKoolbFHPA5gE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('🔍 Testando conexão com o Supabase...');
    
    // Testar conexão básica
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro ao acessar tabela ordens_servico:', error.message);
      console.log('📝 Código do erro:', error.code);
      
      if (error.code === 'PGRST205') {
        console.log('💡 A tabela ordens_servico não existe.');
        console.log('📋 Execute o script create-tables.sql no SQL Editor do Supabase Dashboard');
        console.log('🔗 Acesse: https://supabase.com/dashboard/project/bxgypzvxhxuphemwdohu/sql');
      }
    } else {
      console.log('✅ Conexão com Supabase funcionando!');
      console.log('📊 Dados encontrados:', data);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

testConnection();
