import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function TeamRegistration() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    captain_name: '',
    captain_phone: '',
    logo_url: ''
  });

  const [previewImage, setPreviewImage] = useState(null);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const API_URL = import.meta.env.VITE_API_URL || '';

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 250;
        const MAX_HEIGHT = 250;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setPreviewImage(dataUrl);
        setFormData(prev => ({ ...prev, logo_url: dataUrl }));
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) return;

    // Strict validation for required fields
    if (!formData.name.trim() || !formData.category || !formData.captain_name.trim() || !formData.captain_phone.trim()) {
      setError('Por favor, completa todos los campos del formulario.');
      return;
    }

    if (!formData.logo_url) {
      setError('La foto o logo del equipo es obligatorio. Por favor, selecciona una imagen.');
      // Scroll up to the logo section
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const API_URL = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_URL}/api/teams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          user_email: currentUser.email
        })
      });

      if (!response.ok) {
        throw new Error('Error al enviar la inscripción. Intente nuevamente.');
      }

      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center animate-in zoom-in duration-500 py-20">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(16,185,129,0.3)]">
          <span className="material-symbols-outlined text-5xl text-emerald-400">check_circle</span>
        </div>
        <h2 className="text-4xl font-black text-white mb-4">¡Inscripción Recibida!</h2>
        <p className="text-on-surface-variant mb-10">Tu equipo <strong>{formData.name}</strong> ha sido enviado a la presidencia del torneo. Está en proceso de revisión.</p>
        
        <button 
          onClick={() => { 
            setSuccess(false); 
            setFormData({name:'', category:'', captain_name:'', captain_phone:'', logo_url:''}); 
            setPreviewImage(null);
          }}
          className="px-8 py-3 bg-surface-container rounded-xl font-bold text-white hover:bg-surface-container-highest transition-colors"
        >
          Inscribir otro equipo
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in duration-700">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-6">
          <span className="material-symbols-outlined text-3xl text-primary">sports_soccer</span>
        </div>
        <h1 className="text-3xl md:text-5xl font-black font-headline tracking-tighter mb-4 text-white">
          Únete a la Liga
        </h1>
        <p className="text-on-surface-variant text-sm md:text-base font-manrope max-w-lg mx-auto">
          Inscribe a tu equipo en el próximo torneo oficial. Completa los datos requeridos para asegurar tu cupo.
        </p>
        
        {currentUser && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <span className="px-4 py-2 bg-surface-container-highest border border-emerald-500/30 rounded-full text-xs font-bold text-emerald-300">
               Sesión activa como: {currentUser.email}
            </span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-3xl p-6 md:p-10 border border-outline-variant/20 shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/20 blur-[80px] -z-10 rounded-full"></div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl mb-8 flex items-center gap-3">
             <span className="material-symbols-outlined">error</span>
             <p className="text-sm font-bold">{error}</p>
          </div>
        )}

        <div className="space-y-8 z-10 relative">
          {/* Logo Upload Section */}
          <div className="flex flex-col items-center justify-center mb-8">
            <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4 text-center">Foto / Logo del Equipo/Escuela *</label>
            <div className="relative group cursor-pointer w-32 h-32 rounded-full overflow-hidden border-2 border-dashed border-outline-variant/30 hover:border-primary transition-colors bg-surface-container">
              {previewImage ? (
                <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                  <span className="material-symbols-outlined text-3xl mb-1">add_photo_alternate</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider">Subir</span>
                </div>
              )}
              <input 
                type="file" 
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
            </div>
            <p className="text-[10px] text-on-surface-variant mt-3 text-center max-w-xs">Se optimizará automáticamente a un tamaño ideal.</p>
          </div>

          {/* Section 1 */}
          <div>
            <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2 mb-6 tracking-tight">
              <span className="material-symbols-outlined text-sm">info</span>
              Información del Equipo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Nombre del Equipo *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Ej. Escuela Mahanaym" 
                  className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-white placeholder-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Categoría *</label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-white focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface transition-all outline-none appearance-none"
                >
                  <option value="" disabled>Seleccione categoría...</option>
                  <option value="sub-8">Sub 8</option>
                  <option value="sub-10">Sub 10</option>
                  <option value="sub-12">Sub 12</option>
                  <option value="sub-14">Sub 14</option>
                  <option value="sub-16">Sub 16</option>
                  <option value="sub-18">Sub 18</option>
                </select>
              </div>
            </div>
          </div>

          <div className="h-px bg-outline-variant/10 w-full"></div>

          {/* Section 2 */}
          <div>
            <h3 className="text-lg font-bold text-emerald-300 flex items-center gap-2 mb-6 tracking-tight">
              <span className="material-symbols-outlined text-sm">badge</span>
              Representante / Capitán
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Nombre Completo *</label>
                <input 
                  type="text" 
                  name="captain_name"
                  value={formData.captain_name}
                  onChange={handleInputChange}
                  required
                  placeholder="Juan Pérez" 
                  className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-white placeholder-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">Teléfono / WhatsApp *</label>
                <input 
                  type="tel" 
                  name="captain_phone"
                  value={formData.captain_phone}
                  onChange={handleInputChange}
                  required
                  placeholder="+1 234 567 890" 
                  className="w-full bg-surface-container-highest border border-outline-variant/30 rounded-xl px-4 py-3 text-sm text-white placeholder-on-surface-variant/50 focus:border-primary focus:ring-1 focus:ring-primary focus:bg-surface transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading || !currentUser}
              className={`w-full py-4 ${loading ? 'bg-emerald-700 text-gray-400' : 'bg-primary hover:bg-emerald-400 text-black'} font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(107,254,156,0.2)] hover:shadow-[0_0_30px_rgba(107,254,156,0.4)] active:scale-[0.98] flex items-center justify-center gap-2`}
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  Procesando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">how_to_reg</span>
                  Enviar Solicitud
                </>
              )}
            </button>
            <p className="text-center text-xs text-on-surface-variant mt-4">Al enviar, aceptas el reglamento oficial del torneo.</p>
          </div>
        </div>
      </form>
    </div>
  );
}
