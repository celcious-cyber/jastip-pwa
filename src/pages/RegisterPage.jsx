import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. Daftarkan User ke Auth Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      alert('Pendaftaran Gagal: ' + error.message);
    } else {
      alert('Berhasil! Silakan cek email kamu untuk konfirmasi atau langsung coba login.');
      navigate('/login');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm px-4 animate-fade-in">
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center text-gray-800">
        
        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
            Gabung Sekarang
          </p>
          <h1 className="font-['Poetsen_One'] text-3xl tracking-tighter text-[#942E4D]">
            BUAT AKUN
          </h1>
          <div className="h-1 w-12 bg-[#FA4F82] mx-auto mt-2 rounded-full"></div>
        </div>

        {/* Form Register */}
        <form onSubmit={handleRegister} className="w-full space-y-4">
          <input 
            type="text" 
            placeholder="Nama Lengkap" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="jastip-input" 
            required 
          />
          <input 
            type="email" 
            placeholder="Email Aktif" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="jastip-input" 
            required 
          />
          <input 
            type="password" 
            placeholder="Buat Password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="jastip-input" 
            required 
          />
          
          <button 
            type="submit"
            disabled={loading}
            className={`btn-pink mt-4 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? 'Mendaftarkan...' : 'Daftar Akun'}
          </button>
        </form>

        {/* Link Balik ke Login */}
        <div className="mt-8 flex items-center space-x-1">
          <p className="text-[10px] text-gray-400">Sudah punya akun?</p>
          <Link to="/login" className="text-[10px] font-bold text-[#FA4F82] hover:underline uppercase">
            Login Saja
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;