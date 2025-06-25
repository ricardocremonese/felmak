import { supabase } from '@/integrations/supabase/client';

export async function createDemoUser() {
  try {
    console.log('Criando usuário de demonstração...');
    
    // Primeiro, verificar se o usuário já existe
    const existingUser = await checkDemoUserExists();
    if (existingUser.exists) {
      console.log('Usuário demo já existe');
      return {
        success: true,
        message: 'Usuário de demonstração já existe!',
        user: existingUser.user
      };
    }

    // Tentar criar o usuário com confirmação automática
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: 'demo@mydearcrm.com.br',
      password: 'teste12345',
      options: {
        data: {
          full_name: 'Usuário Demonstração',
          role: 'demo'
        },
        emailRedirectTo: `${window.location.origin}/login`,
      }
    });

    if (authError) {
      console.error('Erro ao criar usuário:', authError);
      
      // Se o erro for de usuário já existente, tentar fazer login
      if (authError.message?.includes('already registered') || authError.message?.includes('already been registered')) {
        console.log('Usuário já existe, tentando fazer login...');
        const loginResult = await loginDemoUser();
        return loginResult;
      }
      
      throw authError;
    }

    if (authData.user) {
      console.log('Usuário criado com sucesso:', authData.user.id);

      // Criar perfil na tabela profiles
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
        // Não vamos falhar se o perfil já existir
        if (!profileError.message?.includes('duplicate key')) {
          throw profileError;
        }
      }

      console.log('Perfil criado com sucesso!');
      
      // Tentar fazer login imediatamente após criar
      const loginResult = await loginDemoUser();
      return {
        success: true,
        user: authData.user,
        message: 'Usuário de demonstração criado com sucesso!',
        loginResult
      };
    }

  } catch (error) {
    console.error('Erro geral:', error);
    return {
      success: false,
      error: error,
      message: 'Erro ao criar usuário de demonstração'
    };
  }
}

// Função para fazer login do usuário demo
export async function loginDemoUser() {
  try {
    console.log('Tentando fazer login do usuário demo...');
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'demo@mydearcrm.com.br',
      password: 'teste12345'
    });

    if (error) {
      console.error('Erro ao fazer login:', error);
      
      // Se o erro for de email não confirmado, tentar criar novamente
      if (error.message?.includes('Email not confirmed') || error.message?.includes('not confirmed')) {
        console.log('Email não confirmado, tentando criar usuário com confirmação...');
        return await createConfirmedDemoUser();
      }
      
      throw error;
    }

    console.log('Login do usuário demo realizado com sucesso!');
    return {
      success: true,
      user: data.user,
      message: 'Login do usuário demo realizado com sucesso!'
    };

  } catch (error) {
    console.error('Erro no login do usuário demo:', error);
    return {
      success: false,
      error: error,
      message: 'Erro ao fazer login do usuário demo'
    };
  }
}

// Função alternativa para criar usuário demo confirmado
async function createConfirmedDemoUser() {
  try {
    console.log('Criando usuário demo com confirmação...');
    
    // Esta função seria chamada se o usuário já existe mas não está confirmado
    // Em produção, você pode precisar usar a API do Supabase para confirmar o email
    
    return {
      success: false,
      message: 'Usuário demo criado mas precisa de confirmação de email. Em produção, use o painel do Supabase para confirmar o email.',
      needsConfirmation: true
    };
  } catch (error) {
    console.error('Erro ao criar usuário confirmado:', error);
    return {
      success: false,
      error: error,
      message: 'Erro ao criar usuário demo confirmado'
    };
  }
}

// Função para verificar se o usuário demo já existe
export async function checkDemoUserExists() {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'demo@mydearcrm.com.br')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      throw error;
    }

    return {
      exists: !!data,
      user: data
    };
  } catch (error) {
    console.error('Erro ao verificar usuário demo:', error);
    return {
      exists: false,
      error: error
    };
  }
}

// Função para testar o login do usuário demo com mais detalhes
export async function testDemoUserLoginDetailed() {
  try {
    console.log('=== TESTE DETALHADO DO LOGIN DO USUÁRIO DEMO ===');
    
    // 1. Verificar se o usuário existe na tabela profiles
    console.log('1. Verificando se o usuário existe na tabela profiles...');
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'demo@mydearcrm.com.br')
      .single();
    
    if (profileError) {
      console.error('Erro ao verificar perfil:', profileError);
      return {
        success: false,
        error: profileError,
        step: 'profile_check',
        message: 'Erro ao verificar perfil do usuário'
      };
    }
    
    console.log('Perfil encontrado:', profileData);
    
    // 2. Tentar fazer login
    console.log('2. Tentando fazer login...');
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'demo@mydearcrm.com.br',
      password: 'teste12345'
    });
    
    if (error) {
      console.error('Erro no login:', error);
      
      // Analisar o tipo de erro
      let errorType = 'unknown';
      let errorMessage = error.message;
      
      if (error.message?.includes('Invalid login credentials')) {
        errorType = 'invalid_credentials';
        errorMessage = 'Credenciais inválidas - verifique email e senha';
      } else if (error.message?.includes('Email not confirmed')) {
        errorType = 'email_not_confirmed';
        errorMessage = 'Email não confirmado - verifique no Supabase';
      } else if (error.message?.includes('Too many requests')) {
        errorType = 'rate_limit';
        errorMessage = 'Muitas tentativas - aguarde um pouco';
      }
      
      return {
        success: false,
        error: error,
        errorType: errorType,
        step: 'login',
        message: errorMessage
      };
    }
    
    console.log('Login bem-sucedido!', data);
    
    // 3. Verificar dados do usuário logado
    console.log('3. Verificando dados do usuário logado...');
    const { data: { user } } = await supabase.auth.getUser();
    console.log('Usuário logado:', user);
    
    // 4. Fazer logout
    console.log('4. Fazendo logout...');
    await supabase.auth.signOut();
    
    return {
      success: true,
      user: data.user,
      message: 'Login do usuário demo realizado com sucesso!'
    };
    
  } catch (error) {
    console.error('Erro geral no teste detalhado:', error);
    return {
      success: false,
      error: error,
      step: 'general',
      message: 'Erro inesperado no teste de login'
    };
  }
}

// Função para testar o login do usuário demo
export async function testDemoUserLogin() {
  try {
    console.log('Testando login do usuário demo...');
    
    const result = await loginDemoUser();
    
    if (result.success) {
      // Fazer logout após o teste
      await supabase.auth.signOut();
      console.log('Teste de login bem-sucedido!');
    }
    
    return result;
  } catch (error) {
    console.error('Erro no teste de login:', error);
    return {
      success: false,
      error: error,
      message: 'Erro no teste de login do usuário demo'
    };
  }
}

// Função para criar usuário demo diretamente (para desenvolvimento)
export async function createDemoUserDirect() {
  try {
    console.log('Criando usuário demo diretamente...');
    
    // Esta função seria usada apenas em desenvolvimento
    // Em produção, você deve usar o painel do Supabase
    
    return {
      success: false,
      message: 'Para criar usuário demo em produção, use o painel do Supabase ou configure a confirmação automática de email.'
    };
  } catch (error) {
    console.error('Erro ao criar usuário demo diretamente:', error);
    return {
      success: false,
      error: error,
      message: 'Erro ao criar usuário demo diretamente'
    };
  }
}

// Função para criar o perfil do usuário demo na tabela profiles
export async function createDemoUserProfile() {
  try {
    console.log('=== CRIANDO PERFIL DO USUÁRIO DEMO ===');
    
    // Primeiro, vamos tentar fazer login para obter o ID do usuário
    console.log('1. Fazendo login para obter ID do usuário...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'demo@mydearcrm.com.br',
      password: 'teste12345'
    });
    
    if (authError) {
      console.error('Erro ao fazer login:', authError);
      return {
        success: false,
        error: authError,
        message: 'Não foi possível fazer login para obter o ID do usuário'
      };
    }
    
    const userId = authData.user.id;
    console.log('ID do usuário obtido:', userId);
    
    // Verificar se o perfil já existe
    console.log('2. Verificando se o perfil já existe...');
    const { data: existingProfile, error: profileCheckError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (profileCheckError && profileCheckError.code !== 'PGRST116') {
      console.error('Erro ao verificar perfil:', profileCheckError);
      return {
        success: false,
        error: profileCheckError,
        message: 'Erro ao verificar perfil existente'
      };
    }
    
    if (existingProfile) {
      console.log('Perfil já existe:', existingProfile);
      // Fazer logout
      await supabase.auth.signOut();
      return {
        success: true,
        message: 'Perfil do usuário demo já existe!',
        profile: existingProfile
      };
    }
    
    // Criar o perfil
    console.log('3. Criando perfil...');
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          full_name: 'Usuário Demonstração',
          email: 'demo@mydearcrm.com.br',
          is_first_login: false
        }
      ])
      .select()
      .single();
    
    if (createError) {
      console.error('Erro ao criar perfil:', createError);
      // Fazer logout
      await supabase.auth.signOut();
      return {
        success: false,
        error: createError,
        message: 'Erro ao criar perfil do usuário demo'
      };
    }
    
    // Fazer logout
    await supabase.auth.signOut();
    
    console.log('Perfil criado com sucesso:', newProfile);
    
    return {
      success: true,
      message: 'Perfil do usuário demo criado com sucesso!',
      profile: newProfile
    };
    
  } catch (error) {
    console.error('Erro geral ao criar perfil:', error);
    return {
      success: false,
      error: error,
      message: 'Erro inesperado ao criar perfil'
    };
  }
}

// Função alternativa para criar perfil usando RLS (Row Level Security)
export async function createDemoUserProfileAlternative() {
  try {
    console.log('=== CRIANDO PERFIL ALTERNATIVO ===');
    
    // Esta função tenta criar o perfil de forma diferente
    // Primeiro, vamos tentar fazer login para obter o ID do usuário
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'demo@mydearcrm.com.br',
      password: 'teste12345'
    });
    
    if (authError) {
      console.error('Erro ao fazer login:', authError);
      return {
        success: false,
        error: authError,
        message: 'Não foi possível fazer login para obter o ID do usuário'
      };
    }
    
    const userId = authData.user.id;
    console.log('ID do usuário obtido:', userId);
    
    // Agora criar o perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: userId,
          full_name: 'Usuário Demonstração',
          email: 'demo@mydearcrm.com.br',
          is_first_login: false
        }
      ])
      .select()
      .single();
    
    if (profileError) {
      console.error('Erro ao criar perfil:', profileError);
      return {
        success: false,
        error: profileError,
        message: 'Erro ao criar perfil do usuário demo'
      };
    }
    
    // Fazer logout
    await supabase.auth.signOut();
    
    console.log('Perfil criado com sucesso:', profile);
    
    return {
      success: true,
      message: 'Perfil do usuário demo criado com sucesso!',
      profile: profile
    };
    
  } catch (error) {
    console.error('Erro geral ao criar perfil alternativo:', error);
    return {
      success: false,
      error: error,
      message: 'Erro inesperado ao criar perfil alternativo'
    };
  }
}

// Função de diagnóstico completo para o usuário demo
export async function diagnoseDemoUser() {
  try {
    console.log('=== DIAGNÓSTICO COMPLETO DO USUÁRIO DEMO ===');
    
    const diagnosis = {
      step: 'start',
      authUser: null,
      profileExists: false,
      profileData: null,
      loginTest: null,
      errors: []
    };
    
    // 1. Verificar se conseguimos fazer login
    console.log('1. Testando login...');
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: 'demo@mydearcrm.com.br',
        password: 'teste12345'
      });
      
      if (authError) {
        console.error('Erro no login:', authError);
        diagnosis.errors.push({
          step: 'login',
          error: authError.message,
          code: authError.status
        });
        diagnosis.loginTest = { success: false, error: authError };
      } else {
        console.log('Login bem-sucedido!', authData.user);
        diagnosis.authUser = authData.user;
        diagnosis.loginTest = { success: true, user: authData.user };
        
        // 2. Verificar perfil na tabela profiles
        console.log('2. Verificando perfil na tabela profiles...');
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .single();
        
        if (profileError) {
          console.error('Erro ao verificar perfil:', profileError);
          diagnosis.errors.push({
            step: 'profile_check',
            error: profileError.message,
            code: profileError.code
          });
          diagnosis.profileExists = false;
        } else {
          console.log('Perfil encontrado:', profileData);
          diagnosis.profileExists = true;
          diagnosis.profileData = profileData;
        }
        
        // 3. Verificar se o usuário tem sessão ativa
        console.log('3. Verificando sessão...');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Erro ao verificar sessão:', sessionError);
          diagnosis.errors.push({
            step: 'session_check',
            error: sessionError.message
          });
        } else {
          console.log('Sessão ativa:', !!session);
        }
        
        // 4. Fazer logout
        console.log('4. Fazendo logout...');
        await supabase.auth.signOut();
      }
      
    } catch (error) {
      console.error('Erro geral no diagnóstico:', error);
      diagnosis.errors.push({
        step: 'general',
        error: error.message
      });
    }
    
    console.log('Diagnóstico completo:', diagnosis);
    return {
      success: diagnosis.loginTest?.success || false,
      diagnosis: diagnosis,
      message: diagnosis.errors.length > 0 
        ? `Encontrados ${diagnosis.errors.length} problema(s)` 
        : 'Diagnóstico completo realizado'
    };
    
  } catch (error) {
    console.error('Erro fatal no diagnóstico:', error);
    return {
      success: false,
      error: error,
      message: 'Erro fatal no diagnóstico'
    };
  }
}

// Função para verificar a estrutura da tabela profiles
export async function checkProfilesTable() {
  try {
    console.log('=== VERIFICANDO ESTRUTURA DA TABELA PROFILES ===');
    
    // Tentar fazer login primeiro
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'demo@mydearcrm.com.br',
      password: 'teste12345'
    });
    
    if (authError) {
      return {
        success: false,
        error: authError,
        message: 'Não foi possível fazer login para verificar a tabela'
      };
    }
    
    // Verificar se a tabela profiles existe e sua estrutura
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*')
      .limit(1);
    
    if (profilesError) {
      console.error('Erro ao acessar tabela profiles:', profilesError);
      await supabase.auth.signOut();
      return {
        success: false,
        error: profilesError,
        message: 'Erro ao acessar tabela profiles'
      };
    }
    
    // Tentar inserir um perfil de teste
    const testProfile = {
      id: authData.user.id,
      full_name: 'Teste Perfil',
      email: 'teste@teste.com',
      is_first_login: false
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('profiles')
      .insert([testProfile])
      .select();
    
    await supabase.auth.signOut();
    
    if (insertError) {
      console.error('Erro ao inserir perfil de teste:', insertError);
      return {
        success: false,
        error: insertError,
        message: 'Erro ao inserir perfil de teste',
        tableStructure: {
          exists: true,
          accessible: true,
          insertable: false,
          error: insertError.message
        }
      };
    }
    
    return {
      success: true,
      message: 'Tabela profiles está funcionando corretamente',
      tableStructure: {
        exists: true,
        accessible: true,
        insertable: true
      },
      testInsert: insertData
    };
    
  } catch (error) {
    console.error('Erro ao verificar tabela profiles:', error);
    return {
      success: false,
      error: error,
      message: 'Erro ao verificar tabela profiles'
    };
  }
} 