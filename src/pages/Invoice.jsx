import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { sendWhatsAppInvoice } from '../utils/whatsappFormatter';
import { useNavigate } from 'react-router-dom';
import { 
  HiOutlineDocumentText, HiOutlineSearch, 
  HiOutlineChatAlt2, HiOutlineX, HiOutlineTrash,
  HiOutlinePencilAlt, HiOutlineCheckCircle
} from 'react-icons/hi';

const Invoice = () => {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState('Semua');

  useEffect(() => {
    fetchProfile();
    fetchInvoices();
  }, []);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    setProfile(data);
  };

  const fetchInvoices = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        customers (*),
        order_items (id, qty, harga_satuan, products(nama_barang))
      `)
      .eq('user_id', user.id)
      .order('id', { ascending: false });

    if (!error) setInvoices(data || []);
    setLoading(false);
  };

  const updateStatusSelesai = async (id) => {
    const { error } = await supabase
      .from('orders')
      .update({ status: 'Selesai' })
      .eq('id', id);

    if (!error) {
      setSelectedInvoice(null);
      fetchInvoices();
    }
  };

  const deleteInvoice = async (id) => {
    if (window.confirm("Hapus invoice ini?")) {
      await supabase.from('order_items').delete().eq('order_id', id);
      await supabase.from('orders').delete().eq('id', id);
      setSelectedInvoice(null);
      fetchInvoices();
    }
  };

  const handleEditKePesanan = (inv) => {
    navigate('/pesanan', { 
      state: { 
        isEdit: true, 
        orderId: inv.id,
        cartItems: inv.order_items.map(item => ({
          ...item.products,
          qty: item.qty,
          harga_jual: item.harga_satuan
        })),
        customerId: inv.customer_id
      } 
    });
  };

  const formatWhatsApp = (inv) => {
    sendWhatsAppInvoice(inv, profile);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.customers?.nama_pelanggan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'Semua') return matchesSearch;
    if (activeTab === 'Selesai') return matchesSearch && inv.status === 'Selesai';
    
    // Tab Pending: Menampilkan yang statusnya 'Pending' ATAU statusnya masih kosong/null
    if (activeTab === 'Pending') {
      return matchesSearch && inv.status !== 'Selesai';
    }

    return matchesSearch;
  });

  return (
    <div className="space-y-6 pb-20 px-2 overflow-x-hidden">
      
      {/* Header */}
      <div className="px-1">
        <h2 className="text-xl font-black text-[#942E4D] italic uppercase tracking-tighter">Riwayat Transaksi</h2>

        <div className="relative mt-3">
          <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Cari pelanggan..."
            className="jastip-input pl-12 bg-white border-none shadow-sm w-full py-3 rounded-2xl font-bold"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tab Filter */}
      <div className="flex gap-2 px-1 overflow-x-auto pb-2 scrollbar-hide">
        {['Semua', 'Pending', 'Selesai'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
              activeTab === tab 
              ? 'bg-[#942E4D] text-white shadow-lg shadow-pink-100 scale-105' 
              : 'bg-white text-gray-400 border border-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="space-y-3">
        {loading ? (
          <p className="text-center py-10 text-gray-300 text-[10px] font-black uppercase animate-pulse">Memuat...</p>
        ) : filteredInvoices.length === 0 ? (
          <p className="text-center py-10 text-gray-400 text-[10px] font-bold uppercase">Tidak ada data</p>
        ) : (
          filteredInvoices.map((inv) => (
            <div 
              key={inv.id}
              onClick={() => setSelectedInvoice(inv)}
              className={`bg-white p-5 rounded-[2.5rem] shadow-sm flex justify-between items-center active:scale-95 transition-all border border-transparent ${inv.status === 'Selesai' ? 'opacity-70' : 'active:border-[#FA4F82]'}`}
            >
              <div className="flex items-center space-x-4 min-w-0">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${inv.status === 'Selesai' ? 'bg-green-50 text-green-500' : 'bg-pink-50 text-[#FA4F82]'}`}>
                  <HiOutlineDocumentText size={22} />
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-gray-800 text-sm truncate">{inv.customers?.nama_pelanggan}</p>
                  <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{inv.invoice_number}</p>
                </div>
              </div>

              <div className="text-right ml-2">
                <p className="text-sm font-black text-[#FA4F82] whitespace-nowrap">
                  Rp {inv.total_harga?.toLocaleString()}
                </p>
                {inv.status === 'Selesai' && (
                  <span className="text-[8px] font-black text-green-500 uppercase tracking-tighter">Selesai</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODAL FLOATING STYLE */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedInvoice(null)}
          ></div>
          
          <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl relative z-10 animate-slide-up max-h-[85vh] overflow-y-auto flex flex-col scrollbar-hide">
            
            <div className="flex justify-center -mt-4 mb-6">
              <div className="w-12 h-1.5 bg-gray-200 rounded-full"></div>
            </div>

            <div className="text-center mb-6">
              <h3 className="text-xl font-black text-[#942E4D] uppercase italic tracking-tighter">
                {selectedInvoice.customers?.nama_pelanggan || 'Pelanggan'}
              </h3>
              <p className="text-[10px] font-black text-gray-400 tracking-[0.2em] uppercase">
                {selectedInvoice.invoice_number}
              </p>
            </div>

            {/* Total Highlight */}
            <div className="bg-[#942E4D] p-6 rounded-[2.2rem] text-white flex justify-between items-center mb-6 shadow-xl shadow-pink-100">
              <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Tagihan</span>
              <span className="text-xl font-black italic">
                Rp {selectedInvoice.total_harga?.toLocaleString()}
              </span>
            </div>

            {/* Items List */}
            <div className="space-y-3 mb-8 px-1">
              {selectedInvoice.order_items?.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs bg-gray-50 p-4 rounded-2xl border border-gray-100/50">
                  <span className="font-bold text-gray-700">
                    {item.products?.nama_barang} <span className="text-[#FA4F82] ml-1">x{item.qty}</span>
                  </span>
                  <span className="font-black text-gray-900">
                    Rp {(item.qty * item.harga_satuan).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Grid Tombol Aksi */}
            <div className="grid grid-cols-2 gap-3 mb-3">
              <button 
                onClick={() => handleEditKePesanan(selectedInvoice)}
                className="bg-gray-100 text-gray-800 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <HiOutlinePencilAlt size={18}/> Edit
              </button>

              <button 
                onClick={() => deleteInvoice(selectedInvoice.id)}
                className="bg-red-50 text-red-500 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all"
              >
                <HiOutlineTrash size={18}/> Hapus
              </button>
            </div>

            {/* Tombol Status Selesai */}
            {selectedInvoice.status !== 'Selesai' && (
              <button 
                onClick={() => updateStatusSelesai(selectedInvoice.id)}
                className="w-full mb-3 bg-blue-50 text-blue-600 py-4 rounded-2xl font-black text-[10px] uppercase flex items-center justify-center gap-2 active:scale-95 transition-all border border-blue-100"
              >
                <HiOutlineCheckCircle size={20}/> Tandai Selesai
              </button>
            )}

            <button 
              onClick={() => formatWhatsApp(selectedInvoice)}
              className="w-full bg-[#25D366] text-white py-5 rounded-2xl font-black text-[11px] uppercase flex items-center justify-center gap-3 shadow-xl shadow-green-100 active:scale-95 transition-all"
            >
              <HiOutlineChatAlt2 size={20}/> Kirim Pesan WhatsApp
            </button>

            <button 
              onClick={() => setSelectedInvoice(null)}
              className="mt-6 text-[10px] font-black text-gray-300 uppercase tracking-widest text-center"
            >
              Tutup Detail
            </button>

          </div>
        </div>
      )}
    </div>
  );
};

export default Invoice;