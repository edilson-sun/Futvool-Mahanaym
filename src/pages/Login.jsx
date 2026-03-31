import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';

export default function Login() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, signup, loginWithGoogle, currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || 'admin@mahanaym.com';

  // Si ya estaba logueado, redirigir
  if (currentUser) {
    if (currentUser.email === adminEmail) {
      navigate('/admin');
    } else {
      navigate('/registro');
    }
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegistering) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      
      // Navigate to admin if it's the admin email, otherwise to public registration
      if (email === adminEmail) {
        navigate('/admin');
      } else {
        navigate('/registro');
      }
    } catch (err) {
      setError(isRegistering ? 'Error al crear la cuenta. Intenta nuevamente.' : 'Fallo el inicio de sesión. Revisa tus credenciales.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    try {
      setError('');
      setLoading(true);
      const result = await loginWithGoogle();
      
      if (result.user.email === adminEmail) {
        navigate('/admin');
      } else {
        navigate('/registro');
      }
    } catch (err) {
      setError('Error al iniciar sesión con Google.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#121212] p-8 hero-gradient relative">
      <Link to="/" className="absolute top-8 left-8 text-neutral-400 hover:text-emerald-300 transition-colors flex items-center gap-2 font-manrope font-bold">
        <span className="material-symbols-outlined text-sm">arrow_back</span>
        Volver
      </Link>

      <div className="glass-card p-10 max-w-md w-full relative overflow-hidden rounded-3xl border border-outline-variant/20 shadow-2xl">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -z-10 rounded-full"></div>
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-surface-container border border-outline-variant/10 mb-4 text-emerald-400 shadow-[0_0_15px_rgba(107,254,156,0.1)]">
             <span className="material-symbols-outlined text-2xl">{isRegistering ? 'person_add' : 'lock'}</span>
          </div>
          <h2 className="text-3xl font-black text-white font-headline tracking-tighter mb-2">
            {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
          <p className="text-on-surface-variant font-manrope text-sm">
            {isRegistering ? 'Regístrate para inscribir a tu equipo' : 'Accede a tu cuenta o entra como Administrador'}
          </p>
        </div>

        {error && (
          <div className="bg-error/10 border border-error/50 text-error px-4 py-3 rounded-xl mb-6 text-sm font-bold flex items-center gap-2">
             <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Correo Electrónico</label>
            <input 
               type="email" 
               required
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               placeholder="tu@correo.com"
               className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-white placeholder-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface transition-all outline-none" 
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Contraseña</label>
            <input 
               type="password" 
               required
               value={password}
               onChange={(e) => setPassword(e.target.value)}
               placeholder="••••••••"
               className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-white placeholder-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface transition-all outline-none" 
            />
          </div>
          
          <button 
             disabled={loading} 
             className="w-full py-3.5 mt-2 bg-primary hover:bg-emerald-400 text-black font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(107,254,156,0.2)] hover:shadow-[0_0_30px_rgba(107,254,156,0.4)] disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center"
          >
            {isRegistering ? 'Registrarse' : 'Ingresar'}
          </button>
        </form>

        <div className="relative my-8">
           <div className="absolute inset-0 flex items-center">
             <div className="w-full border-t border-outline-variant/20"></div>
           </div>
           <div className="relative flex justify-center text-sm">
             <span className="px-3 bg-surface text-on-surface-variant uppercase tracking-widest text-[10px] font-bold">O continúa con</span>
           </div>
        </div>

        <button 
           onClick={handleGoogleSignIn}
           disabled={loading}
           type="button" 
           className="w-full py-3.5 bg-white text-black font-bold flex items-center justify-center gap-3 rounded-xl hover:bg-gray-100 transition-colors border border-transparent disabled:opacity-50"
        >
          <img src="https://fonts.gstatic.com/s/i/productlogos/googleg/v6/24px.svg" alt="Google" className="w-5 h-5"/>
          <span>Autenticar con Google</span>
        </button>

        <div className="mt-8 text-center">
          <button 
            type="button"
            onClick={() => setIsRegistering(!isRegistering)} 
            className="text-sm font-manrope font-bold text-on-surface-variant hover:text-white transition-colors"
          >
            {isRegistering ? '¿Ya tienes una cuenta? Inicia sesión' : '¿No tienes cuenta? Crea una aquí'}
          </button>
        </div>
      </div>
    </div>
  );
}
