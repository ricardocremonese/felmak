import { createClient } from '@supabase/supabase-js';

// Configuração do Supabase
const supabaseUrl = 'https://bxgypzvxhxuphemwdohu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ4Z3lwenZ4aHh1cGhlbXdkb2h1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDA3OTUsImV4cCI6MjA3MzYxNjc5NX0.Z3LAIyZOJYNI-Phfz6vSlPT3H3RWGheKoolbFHPA5gE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  try {
    console.log('🔍 Verificando tabelas existentes...');
    
    // Verificar se a tabela profiles existe
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.log('❌ Tabela profiles não existe:', profilesError.message);
    } else {
      console.log('✅ Tabela profiles existe');
    }
    
    // Verificar se a tabela ordens_servico existe
    const { data: ordens, error: ordensError } = await supabase
      .from('ordens_servico')
      .select('*')
      .limit(1);
    
    if (ordensError) {
      console.log('❌ Tabela ordens_servico não existe:', ordensError.message);
    } else {
      console.log('✅ Tabela ordens_servico existe');
    }
    
    // Tentar listar todas as tabelas usando uma consulta de sistema
    const { data: tables, error: tablesError } = await supabase
      .rpc('get_tables')
      .select();
    
    if (tablesError) {
      console.log('❌ Erro ao listar tabelas:', tablesError.message);
    } else {
      console.log('📋 Tabelas encontradas:', tables);
    }
    
  } catch (error) {
    console.error('❌ Erro geral:', error);
  }
}

checkTables();
