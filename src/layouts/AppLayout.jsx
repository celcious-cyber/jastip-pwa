import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';
import { HiOutlineHome, HiOutlineClipboardList, HiOutlineCube, HiOutlineChartBar } from 'react-icons/hi';

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 pb-24 font-poppins">
      {/* Header Sesuai Desain */}
      <header className="bg-[#FA4F82] text-white pt-10 pb-12 px-6 rounded-b-[2.5rem] shadow-lg">
        <h1 className="text-2xl font-bold uppercase tracking-wide italic">Jastip APP</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-80">Dashboard Admin</p>
      </header>

      {/* Konten Halaman */}
      <main className="p-5 -mt-6">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 w-full bg-white/90 backdrop-blur-lg flex justify-around py-4 border-t border-gray-100 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] rounded-t-[2.5rem] z-[100]">
        
        {/* Beranda: to="/" */}
        <NavLink to="/" className={({ isActive }) => 
          `flex flex-col items-center transition-all ${isActive ? 'text-[#FA4F82] scale-110' : 'text-gray-300'}`
        }>
          <HiOutlineHome size={24} />
          <span className="text-[9px] font-black uppercase mt-1">Beranda</span>
        </NavLink>

        {/* Pesanan: to="/pesanan" */}
        <NavLink to="/pesanan" className={({ isActive }) => 
          `flex flex-col items-center transition-all ${isActive ? 'text-[#FA4F82] scale-110' : 'text-gray-300'}`
        }>
          <HiOutlineClipboardList size={24} />
          <span className="text-[9px] font-black uppercase mt-1">Pesanan</span>
        </NavLink>

        {/* Inventaris: to="/inventaris" */}
        <NavLink to="/inventaris" className={({ isActive }) => 
          `flex flex-col items-center transition-all ${isActive ? 'text-[#FA4F82] scale-110' : 'text-gray-300'}`
        }>
          <HiOutlineCube size={24} />
          <span className="text-[9px] font-black uppercase mt-1">Barang</span>
        </NavLink>

        {/* Laporan: to="/laporan" */}
        <NavLink to="/laporan" className={({ isActive }) => 
          `flex flex-col items-center transition-all ${isActive ? 'text-[#FA4F82] scale-110' : 'text-gray-300'}`
        }>
          <HiOutlineChartBar size={24} />
          <span className="text-[9px] font-black uppercase mt-1">Cuan</span>
        </NavLink>

      </nav>
    </div>
  );
};

export default AppLayout;