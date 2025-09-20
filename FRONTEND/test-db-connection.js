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
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro ao acessar tabela ordens_servico:', error.message);
      
      if (error.code === 'PGRST205') {
        console.log('📝 A tabela ordens_servico não existe. Criando...');
        
        // Criar tabela ordens_servico
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS public.ordens_servico (
            id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
            numero_os SERIAL UNIQUE NOT NULL,
            cliente_nome VARCHAR(255) NOT NULL,
            cliente_telefone VARCHAR(20) NOT NULL,
            cliente_email VARCHAR(255),
            equipamento_tipo VARCHAR(100) NOT NULL,
            equipamento_marca VARCHAR(50) NOT NULL,
            equipamento_modelo VARCHAR(100),
            defeito_relatado TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'Em análise',
            data_entrada TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `;
        
        const { error: createError } = await supabase.rpc('exec_sql', {
          sql: createTableSQL
        });
        
        if (createError) {
          console.error('❌ Erro ao criar tabela:', createError);
          return;
        }
        
        console.log('✅ Tabela ordens_servico criada com sucesso!');
        
        // Inserir dados de exemplo
        const { error: insertError } = await supabase
          .from('ordens_servico')
          .insert([
            {
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
          console.error('❌ Erro ao inserir dados:', insertError);
        } else {
          console.log('✅ Dados de exemplo inseridos!');
        }
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
