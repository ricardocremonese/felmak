import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://bxgypzvxhxuphemwdohu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z3lwenZ4aHh1cGhlbXdkb2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDA3OTUsImV4cCI6MjA3MzYxNjc5NX0.Z3LAIyZOJYNI-Phfz6vSlPT3H3RWGheKoolbFHPA5gE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTableStructure() {
  try {
    console.log('🔍 Verificando estrutura da tabela ordens_servico...');
    
    // Tentar inserir com apenas os campos obrigatórios
    const { data, error } = await supabase
      .from('ordens_servico')
      .insert([
        {
          cliente_nome: 'João Silva',
          cliente_telefone: '(11) 99999-9999',
          equipamento_tipo: 'Notebook',
          equipamento_marca: 'Dell',
          defeito_relatado: 'Não liga'
        }
      ])
      .select();
    
    if (error) {
      console.error('❌ Erro ao inserir:', error);
      console.log('📋 Código do erro:', error.code);
      console.log('📋 Mensagem:', error.message);
    } else {
      console.log('✅ Dados inseridos com sucesso!');
      console.log('📊 Dados retornados:', data);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkTableStructure();
