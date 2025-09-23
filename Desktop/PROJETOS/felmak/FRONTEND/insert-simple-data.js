import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://bxgypzvxhxuphemwdohu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z3lwenZ4aHh1cGhlbXdkb2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDA3OTUsImV4cCI6MjA3MzYxNjc5NX0.Z3LAIyZOJYNI-Phfz6vSlPT3H3RWGheKoolbFHPA5gE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function insertSimpleData() {
  try {
    console.log('🔍 Tentando inserir dados simples...');
    
    // Primeiro, vamos ver quais campos existem tentando fazer um select
    const { data: existingData, error: selectError } = await supabase
      .from('ordens_servico')
      .select('*')
      .limit(1);
    
    if (selectError) {
      console.log('❌ Erro ao fazer select:', selectError.message);
      return;
    }
    
    console.log('✅ Select funcionou, tentando inserir dados...');
    
    // Tentar inserir com apenas id e campos básicos
    const { data, error } = await supabase
      .from('ordens_servico')
      .insert([
        {
          id: 'test-1',
          cliente_nome: 'João Silva',
          equipamento_tipo: 'Notebook',
          defeito_relatado: 'Não liga'
        }
      ])
      .select();
    
    if (error) {
      console.error('❌ Erro ao inserir:', error);
    } else {
      console.log('✅ Dados inseridos com sucesso!');
      console.log('📊 Dados:', data);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

insertSimpleData();
