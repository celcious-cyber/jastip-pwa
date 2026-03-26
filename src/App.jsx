import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabaseClient';

// Layouts
import AuthLayout from './layouts/AuthLayout';
import AppLayout from './layouts/AppLayout';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Beranda from './pages/Beranda';
import Inventaris from './pages/Inventaris';
import Pelanggan from './pages/Pelanggan';
import Pesanan from './pages/Pesanan';
import Laporan from './pages/Laporan';
import Pengaturan from './pages/Pengaturan';
import Invoice from './pages/Invoice';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FA4F82] flex items-center justify-center text-white">
        <p className="animate-pulse font-bold tracking-widest">JASTIPIN.SINI...</p>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        {/* GRUP AUTH: Tanpa Login */}
        <Route element={!session ? <AuthLayout /> : <Navigate to="/" replace />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* GRUP APP: Harus Login */}
        <Route element={session ? <AppLayout /> : <Navigate to="/login" replace />}>
          <Route index element={<Beranda />} />
          <Route path="inventaris" element={<Inventaris />} />
          <Route path="pelanggan" element={<Pelanggan />} />
          <Route path="pesanan" element={<Pesanan />} />
          <Route path="invoice" element={<Invoice />} />
          <Route path="laporan" element={<Laporan />} />
          <Route path="pengaturan" element={<Pengaturan />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;