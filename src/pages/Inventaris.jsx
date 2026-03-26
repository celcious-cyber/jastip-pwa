import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  HiOutlinePlus, HiOutlineCube, HiOutlineTrash, 
  HiOutlinePencilAlt, HiOutlineSearch, HiX 
} from 'react-icons/hi';

const Inventaris = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    nama_barang: '',
    nama_brand: '',
    hpp: 0,
    harga_jual: 0,
    stok: 0
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fungsi Filter Search
  useEffect(() => {
    const filtered = products.filter(p => 
      p.nama_barang.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.nama_brand.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchTerm, products]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error) {
      setProducts(data);
      setFilteredProducts(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();

    if (editId) {
      // LOGIKA EDIT (UPDATE)
      const { error } = await supabase
        .from('products')
        .update(formData)
        .eq('id', editId);
      if (error) alert(error.message);
    } else {
      // LOGIKA TAMBAH (INSERT)
      const { error } = await supabase
        .from('products')
        .insert([{ ...formData, user_id: user.id }]);
      if (error) alert(error.message);
    }

    closeModal();
    fetchProducts();
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setFormData({
      nama_barang: item.nama_barang,
      nama_brand: item.nama_brand,
      hpp: item.hpp,
      harga_jual: item.harga_jual,
      stok: item.stok
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Hapus produk ini dari rak?')) {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) alert(error.message);
      fetchProducts();
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setFormData({ nama_barang: '', nama_brand: '', hpp: 0, harga_jual: 0, stok: 0 });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20 px-2">
      {/* Header & Search */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-[#942E4D] mt-4">Stok Barang</h2>
        <button onClick={() => setShowModal(true)} className="bg-[#FA4F82] text-white p-3 rounded-2xl shadow-lg active:scale-90 transition-all">
          <HiOutlinePlus size={20} />
        </button>
      </div>

      <div className="relative">
        <HiOutlineSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="Cari barang atau brand..." 
          className="jastip-input pl-12 shadow-sm border-none bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* List Barang */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-20 text-gray-400 animate-pulse font-bold uppercase tracking-widest text-[10px]">Menghitung Stok...</div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2.5rem] border border-dashed border-gray-200">
             <HiOutlineCube className="mx-auto text-4xl text-gray-200 mb-2" />
             <p className="text-gray-400 text-xs font-bold uppercase">Barang Tidak Ditemukan</p>
          </div>
        ) : (
          filteredProducts.map((item) => (
            <div key={item.id} className="bg-white p-5 rounded-[2rem] shadow-sm border border-gray-50 flex justify-between items-center group active:scale-[0.98] transition-all">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#FA4F82]">
                  <HiOutlineCube size={24} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 text-sm leading-tight">{item.nama_barang}</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">{item.nama_brand} • {item.stok} Tersedia</p>
                  <p className="text-xs font-black text-[#FA4F82] mt-1">Rp {Number(item.harga_jual).toLocaleString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-2">
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

      {/* Modal CRUD */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-end sm:items-center justify-center">
          <div className="bg-white w-full max-w-md rounded-t-[3rem] sm:rounded-[3rem] p-8 animate-slide-up relative">
            <button onClick={closeModal} className="absolute top-6 right-8 text-gray-400"><HiX size={24}/></button>
            
            <h3 className="font-bold text-lg text-[#942E4D] mb-6">{editId ? 'Koreksi Stok' : 'Tambah Barang'}</h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" placeholder="Nama Barang" className="jastip-input" 
                value={formData.nama_barang} onChange={(e) => setFormData({...formData, nama_barang: e.target.value})} required 
              />
              <input 
                type="text" placeholder="Brand" className="jastip-input" 
                value={formData.nama_brand} onChange={(e) => setFormData({...formData, nama_brand: e.target.value})} 
              />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase ml-2 italic">Harga Modal</label>
                  <input type="number" className="jastip-input" value={formData.hpp} onChange={(e) => setFormData({...formData, hpp: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-400 uppercase ml-2 italic text-[#FA4F82]">Harga Jual</label>
                  <input type="number" className="jastip-input border-[#FA4F82]/30" value={formData.harga_jual} onChange={(e) => setFormData({...formData, harga_jual: e.target.value})} required />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-bold text-gray-400 uppercase ml-2 italic">Stok di Rak</label>
                <input type="number" className="jastip-input" value={formData.stok} onChange={(e) => setFormData({...formData, stok: e.target.value})} required />
              </div>
              
              <button type="submit" className="w-full btn-pink mt-4 shadow-xl shadow-pink-200">
                {editId ? 'UPDATE BARANG' : 'MASUKKAN KE RAK'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventaris;