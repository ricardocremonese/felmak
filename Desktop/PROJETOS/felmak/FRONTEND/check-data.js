import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://bxgypzvxhxuphemwdohu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z3lwenZ4aHh1cGhlbXdkb2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDA3OTUsImV4cCI6MjA3MzYxNjc5NX0.Z3LAIyZOJYNI-Phfz6vSlPT3H3RWGheKoolbFHPA5gE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
  try {
    console.log('🔍 Verificando dados na tabela ordens_servico...');
    
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('*');
    
    if (error) {
      console.error('❌ Erro:', error);
      return;
    }
    
    console.log('📊 Dados encontrados:', data?.length || 0, 'registros');
    
    if (data && data.length > 0) {
      console.log('📋 Primeiro registro:', data[0]);
    } else {
      console.log('📝 Inserindo dados de exemplo...');
      
      const { error: insertError } = await supabase
        .from('ordens_servico')
        .insert([
          {
            numero_os: 1,
            cliente_nome: 'João Silva',
            cliente_telefone: '(11) 99999-9999',
            cliente_email: 'joao@email.com',
            equipamento_tipo: 'Notebook',
            equipamento_marca: 'Dell',
            equipamento_modelo: 'Inspiron 15',
            defeito_relatado: 'Não liga',
            status: 'Em análise'
          },
          {
            numero_os: 2,
            cliente_nome: 'Maria Santos',
            cliente_telefone: '(11) 88888-8888',
            cliente_email: 'maria@email.com',
            equipamento_tipo: 'Desktop',
            equipamento_marca: 'HP',
            equipamento_modelo: 'Pavilion',
            defeito_relatado: 'Tela azul',
            status: 'Aguardando peças'
          }
        ]);
      
      if (insertError) {
        console.error('❌ Erro ao inserir:', insertError);
      } else {
        console.log('✅ Dados inseridos com sucesso!');
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkData();
