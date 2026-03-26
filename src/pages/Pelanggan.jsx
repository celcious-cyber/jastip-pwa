import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  HiOutlinePlus, HiOutlineUsers, HiOutlineTrash, 
  HiOutlinePencilAlt, HiOutlineSearch, HiX, HiOutlinePhone, HiOutlineLocationMarker
} from 'react-icons/hi';

const Pelanggan = () => {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form State sesuai struktur tabel 'customers'
  const [formData, setFormData] = useState({
    nama_pelanggan: '',
    no_telpon: '',
    alamat: ''
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Live Search Filter
  useEffect(() => {
    const filtered = customers.filter(c => 
      c.nama_pelanggan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.no_telpon && c.no_telpon.includes(searchTerm))
    );
    setFilteredCustomers(filtered);
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('user_id', user.id)
      .order('nama_pelanggan', { ascending: true });

    if (!error) {
      setCustomers(data);
      setFilteredCustomers(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();

    if (editId) {
      // UPDATE PELANGGAN
      const { error } = await supabase
        .from('customers')
        .update(formData)
        .eq('id', editId);
      if (error) alert(error.message);
    } else {
      // TAMBAH PELANGGAN BARU
      const { error } = await supabase
        .from('customers')
        .insert([{ ...formData, user_id: user.id }]);
      if (error) alert(error.message);
    }

    closeModal();
    fetchCustomers();
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setFormData({
      nama_pelanggan: item.nama_pelanggan,
      no_telpon: item.no_telpon || '',
      alamat: item.alamat || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus pelanggan ini dari daftar kontak?')) {
      const { error } = await supabase.from('customers').delete().eq('id', id);
      if (error) alert(error.message);
      fetchCustomers();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({ nama_pelanggan: '', no_telpon: '', alamat: '' });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 px-2">
      {/* Header & Tombol Tambah */}
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-bold text-[#942E4D] mt-5">Daftar Pelanggan</h2>
        <button onClick={() => setShowModal(true)} className="bg-[#FA4F82] text-white p-3 rounded-2xl shadow-lg active:scale-90 transition-all">
          <HiOutlinePlus size={20} />
        </button>
      </div>

      {/* Bar Pencarian */}
      <div className="relative">
        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Cari nama atau nomor HP..." 
          className="jastip-input pl-12 shadow-sm border-none bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List Pelanggan */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-20 text-gray-400 animate-pulse font-bold uppercase tracking-widest text-[10px]">Memuat Kontak...</div>
        ) : filteredCustomers.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
             <HiOutlineUsers className="mx-auto text-4xl text-gray-200 mb-2" />
             <p className="text-gray-400 text-xs font-bold uppercase tracking-tight">Belum Ada Pelanggan</p>
          </div>
        ) : (
          filteredCustomers.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 flex justify-between items-center group active:scale-[0.98] transition-all">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#FA4F82]">
                  <HiOutlineUsers size={24} />
                </div>
                <div className="max-w-[150px]">
                  <h4 className="font-bold text-gray-800 text-sm leading-tight truncate">{item.nama_pelanggan}</h4>
                  <div className="flex items-center text-[10px] text-gray-400 mt-1 font-bold uppercase tracking-tighter">
                    <HiOutlinePhone className="mr-1" /> {item.no_telpon || '-'}
                  </div>
                  {item.alamat && (
                    <div className="flex items-center text-[10px] text-gray-400 mt-0.5 truncate">
                       <HiOutlineLocationMarker className="mr-1" /> {item.alamat}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-1">
                <button onClick={() => handleEdit(item)} className="p-2 text-blue-400 hover:bg-blue-50 rounded-xl transition-colors">
                  <HiOutlinePencilAlt size={18} />
                </button>
                <button onClick={() => handleDelete(item.id)} className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors">
                  <HiOutlineTrash size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal CRUD Pelanggan */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-8 animate-slide-up relative shadow-2xl">
            <button onClick={closeModal} className="absolute top-6 right-8 text-gray-400"><HiX size={24}/></button>
            
            <h3 className="font-bold text-lg text-[#942E4D] mb-6">{editId ? 'Ubah Kontak' : 'Pelanggan Baru'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-2 italic">Nama Lengkap</label>
                <input 
                  type="text" placeholder="Masukkan nama pelanggan" className="jastip-input" 
                  value={formData.nama_pelanggan} onChange={(e) => setFormData({...formData, nama_pelanggan: e.target.value})} required 
                />
              </div>
              
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-2 italic">No. WhatsApp/Telepon</label>
                <input 
                  type="tel" placeholder="0812xxxx" className="jastip-input" 
                  value={formData.no_telpon} onChange={(e) => setFormData({...formData, no_telpon: e.target.value})} 
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-2 italic text-[#FA4F82]">Alamat Lengkap (Opsional)</label>
                <textarea 
                  placeholder="Jl. Mawar No. 123..." rows="3" className="jastip-input resize-none py-3" 
                  value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} 
                />
              </div>
              
              <button type="submit" className="w-full btn-pink mt-4 py-4 rounded-3xl shadow-xl shadow-pink-100 flex items-center justify-center space-x-2">
                <span>{editId ? 'SIMPAN PERUBAHAN' : 'TAMBAHKAN KONTAK'}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pelanggan;