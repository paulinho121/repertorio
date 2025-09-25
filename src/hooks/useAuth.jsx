import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';

// Contexto de autenticação
const AuthContext = createContext();

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Provider de autenticação
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getSession();
      setUser(data.session?.user ?? null);
      setLoading(false);
    }

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Função para fazer login
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
      if (error.message === 'Email not confirmed') {
        return { success: false, error: 'Seu email ainda não foi confirmado. Por favor, verifique sua caixa de entrada e clique no link de confirmação.' };
      }
      return { success: false, error: 'Email ou senha incorretos.' };
    }

    if (data.user && !data.session) {
        return { success: false, error: 'Seu email ainda não foi confirmado. Por favor, verifique sua caixa de entrada e clique no link de confirmação.' };
    }
    
    return { success: true, user: data.user };
  };

  // Função para registrar novo usuário
  const register = async (email, password, nome) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: {
        data: {
          full_name: nome,
        }
      }
    });
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, user: data.user };
  };

  // Função para fazer logout
  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
