import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useNavigate, Link } from 'react-router-dom';
import { 
  HiOutlineCube, HiOutlineUsers, HiOutlineClipboardList, 
  HiOutlineDocumentText, HiOutlineChartBar, HiOutlineCog,
  HiLogout 
} from 'react-icons/hi';

const Beranda = () => {
  const [userName, setUserName] = useState('Admin');
  const [summary, setSummary] = useState({
    pendapatan: 0,
    pesananSelesai: 0,
    stokHabis: 0,
    totalPelanggan: 0
  });
  const navigate = useNavigate();

  useEffect(() => {
    getUserData();
    fetchSummaryData();
  }, []);

  const getUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUserName(user.user_metadata?.full_name || 'User');
    }
  };

  const fetchSummaryData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // 1. Ambil Pendapatan & Pesanan Selesai
    const { data: orders } = await supabase
      .from('orders')
      .select('total_harga, status')
      .eq('user_id', user.id);

    // 2. Ambil Stok Habis (Produk yang stoknya 0)
    const { count: countStok } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('stok', 0);

    // 3. Ambil Total Pelanggan
    const { count: countPelanggan } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id);

    if (orders) {
      const totalPendapatan = orders.reduce((sum, o) => sum + (Number(o.total_harga) || 0), 0);
      const totalSelesai = orders.filter(o => o.status === 'Selesai').length;

      setSummary({
        pendapatan: totalPendapatan,
        pesananSelesai: totalSelesai,
        stokHabis: countStok || 0,
        totalPelanggan: countPelanggan || 0
      });
    }
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) alert(error.message);
    navigate('/login');
  };

  const menus = [
    { title: 'Inventaris', path: '/inventaris', icon: <HiOutlineCube />, count: 'Stok Barang' },
    { title: 'Pelanggan', path: '/pelanggan', icon: <HiOutlineUsers />, count: 'Daftar Kontak' },
    { title: 'Pesanan', path: '/pesanan', icon: <HiOutlineClipboardList />, count: 'Buat Order' },
    { title: 'Invoice', path: '/invoice', icon: <HiOutlineDocumentText />, count: 'Riwayat' },
    { title: 'Laporan', path: '/laporan', icon: <HiOutlineChartBar />, count: 'Cek Cuan' },
    { title: 'Pengaturan', path: '/pengaturan', icon: <HiOutlineCog />, count: 'Profil Toko' },
  ];

  // Mapping data ke ringkasan cards
  const summaryCards = [
    { label: 'Pendapatan', val: `Rp. ${summary.pendapatan.toLocaleString()}`, color: 'border-[#FA4F82]' },
    { label: 'Pesanan Aktif', val: `${summary.pesananSelesai} Pesanan`, color: 'border-[#FA4F82]' },
    { label: 'Stok Habis', val: `${summary.stokHabis} Stok`, color: 'border-orange-400' },
    { label: 'Pelanggan', val: `${summary.totalPelanggan} Orang`, color: 'border-[#FA4F82]' }
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header User */}
      <div className="flex justify-between items-end px-2">
        <div>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-8">Selamat Datang,</p>
          <h2 className="text-xl font-bold text-[#942E4D] capitalize">{userName} 👋</h2>
        </div>
        <button 
          onClick={handleLogout}
          className="p-2 bg-pink-100 text-[#FA4F82] rounded-full active:scale-90 transition-all shadow-sm"
          title="Logout"
        >
          <HiLogout size={20} />
        </button>
      </div>

      {/* 4 Cards Ringkasan */}
      <div className="grid grid-cols-2 gap-3">
        {summaryCards.map((item, i) => (
          <div key={i} className={`bg-white p-4 rounded-3xl shadow-sm border-l-4 ${item.color}`}>
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{item.label}</p>
            <p className="text-[13px] font-bold text-[#942E4D] mt-1">{item.val}</p>
          </div>
        ))}
      </div>

      {/* Grid Menu Utama */}
      <div className="grid grid-cols-2 gap-4 mt-8 pb-10">
        {menus.map((item, index) => (
          <Link 
            to={item.path} 
            key={index} 
            className="bg-white p-6 rounded-[2.5rem] shadow-sm flex flex-col items-center justify-center space-y-2 border border-gray-50 active:scale-95 hover:shadow-md transition-all group"
          >
            <div className="text-3xl text-[#FA4F82] group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <p className="text-sm font-bold text-[#942E4D]">{item.title}</p>
            <p className="text-[9px] text-gray-300 font-bold uppercase tracking-tighter text-center">
              {item.count}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Beranda;