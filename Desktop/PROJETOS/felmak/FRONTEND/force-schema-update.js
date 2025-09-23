import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://bxgypzvxhxuphemwdohu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z3lwenZ4aHh1cGhlbXdkb2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDA3OTUsImV4cCI6MjA3MzYxNjc5NX0.Z3LAIyZOJYNI-Phfz6vSlPT3H3RWGheKoolbFHPA5gE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function forceSchemaUpdate() {
  try {
    console.log('🔄 Forçando atualização do schema...');
    
    // Aguardar um pouco para o schema se atualizar
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Tentar fazer um select para forçar a atualização do cache
    const { data, error } = await supabase
      .from('ordens_servico')
      .select('id, created_at')
      .limit(1);
    
    if (error) {
      console.log('❌ Erro no select:', error.message);
      
      // Se ainda der erro, vamos tentar recriar a tabela
      console.log('🔧 Tentando recriar a tabela...');
      
      const { error: dropError } = await supabase.rpc('exec_sql', {
        sql: 'DROP TABLE IF EXISTS public.ordens_servico CASCADE;'
      });
      
      if (dropError) {
        console.log('❌ Erro ao dropar tabela:', dropError.message);
      } else {
        console.log('✅ Tabela removida, execute o script SQL novamente');
      }
      
    } else {
      console.log('✅ Schema atualizado! Dados encontrados:', data?.length || 0);
      
      // Tentar inserir dados agora
      const { data: insertData, error: insertError } = await supabase
        .from('ordens_servico')
        .insert([
          {
            cliente_nome: 'João Silva',
            equipamento_tipo: 'Notebook',
            defeito_relatado: 'Não liga'
          }
        ])
        .select();
      
      if (insertError) {
        console.log('❌ Erro ao inserir:', insertError.message);
      } else {
        console.log('✅ Dados inseridos com sucesso!');
        console.log('📊 Dados:', insertData);
      }
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

forceSchemaUpdate();
