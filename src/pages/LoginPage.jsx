import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert('Login Gagal: ' + error.message);
    } else {
      // Jika berhasil, arahkan ke Beranda
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className="w-full max-w-sm px-4">
      {/* Kartu Putih Melengkung (Main Card) */}
      <div className="bg-white rounded-[2.5rem] shadow-2xl p-10 flex flex-col items-center text-gray-800 animate-fade-in">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
            Selamat Datang
          </p>
          <h1 className="font-['Poetsen_One'] text-4xl tracking-tighter text-[#942E4D]">
            JASTIP APP
          </h1>
          <p className="text-[10px] italic text-gray-400 mt-2 font-medium">
            "Solusi Cepat untuk Semua Titipan"
          </p>
        </div>

        {/* Form Login */}
        <form onSubmit={handleLogin} className="w-full space-y-4">
          <div className="relative">
            <input 
              type="email" 
              placeholder="Email / Username" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-full py-4 px-7 text-sm outline-none focus:ring-2 focus:ring-[#FA4F82] transition-all placeholder:text-gray-300"
              required
            />
          </div>

          <div className="relative">
            <input 
              type="password" 
              placeholder="Password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-full py-4 px-7 text-sm outline-none focus:ring-2 focus:ring-[#FA4F82] transition-all placeholder:text-gray-300"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={loading}
            className={`w-full ${loading ? 'bg-gray-400' : 'bg-[#FA4F82]'} text-white font-bold py-4 rounded-full shadow-lg shadow-pink-200 transition-all active:scale-95 mt-6 uppercase text-xs tracking-widest`}
          >
            {loading ? 'Memproses...' : 'Login Sekarang'}
          </button>
        </form>

        {/* Link Tambahan */}
        <div className="mt-10 flex flex-col items-center space-y-3">
          <p className="text-[10px] font-bold text-[#942E4D] cursor-pointer hover:opacity-70 transition-opacity">
            LUPA PASSWORD?
          </p>
          <div className="flex items-center space-x-1">
            <p className="text-[10px] text-gray-400">Belum punya akun?</p>
            <p className="text-[10px] font-bold text-[#FA4F82] cursor-pointer hover:underline">
              <Link 
      to="/register" 
      className="text-[10px] font-bold text-[#FA4F82] hover:underline uppercase transition-all">
            Daftar Disini
            </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;