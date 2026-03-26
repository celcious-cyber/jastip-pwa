import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HiOutlinePlus, HiOutlineMinus, HiOutlineTrash, 
  HiOutlineShoppingCart, HiOutlineUser, HiOutlineCash,
  HiOutlineChevronUp
} from 'react-icons/hi';

const Pesanan = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State Utama
  const [products, setProducts] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [feePacking, setFeePacking] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // State UI
  const [isExpanded, setIsExpanded] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingOrderId, setEditingOrderId] = useState(null);

  useEffect(() => {
    fetchData();
    if (location.state?.isEdit) {
      setIsEditMode(true);
      setEditingOrderId(location.state.orderId);
      setCart(location.state.cartItems || []);
      setSelectedCustomer(location.state.customerId || '');
      setFeePacking(location.state.feePacking || 0);
    }
  }, [location.state]);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    const { data: p } = await supabase.from('products').select('*').eq('user_id', user.id);
    const { data: c } = await supabase.from('customers').select('*').eq('user_id', user.id);
    setProducts(p || []);
    setCustomers(c || []);
  };

  const addToCart = (product) => {
    const existing = cart.find((item) => item.id === product.id);
    if (existing) {
      setCart(cart.map((item) => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    setCart(cart.map((item) => {
      if (item.id === id) {
        const newQty = Math.max(1, item.qty + delta);
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.harga_jual * item.qty), 0);
  const totalAkhir = subtotal + Number(feePacking);

  const handleProsesOrder = async () => {
    if (!selectedCustomer) return alert("Pilih pelanggan!");
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let currentOrderId = editingOrderId;

      if (isEditMode) {
        // UPDATE: Masukkan fee_packing agar tidak hilang saat edit
        await supabase.from('orders').update({ 
          customer_id: selectedCustomer, 
          total_harga: totalAkhir,
          fee_packing: Number(feePacking) 
        }).eq('id', editingOrderId);
        
        await supabase.from('order_items').delete().eq('order_id', editingOrderId);
      } else {
        // INSERT: Pastikan fee_packing masuk ke kolom database
        const { data: newOrder, error: orderError } = await supabase.from('orders').insert([{
          user_id: user.id, 
          customer_id: selectedCustomer, 
          invoice_number: `INV-${Date.now()}`, 
          total_harga: totalAkhir, 
          fee_packing: Number(feePacking),
          status: 'Proses'
        }]).select().single();

        if (orderError) throw orderError;
        currentOrderId = newOrder.id;
      }

      const itemsToInsert = cart.map(item => ({
        order_id: currentOrderId, 
        product_id: item.id, 
        qty: item.qty, 
        harga_satuan: item.harga_jual
      }));

      await supabase.from('order_items').insert(itemsToInsert);
      navigate('/invoice');
    } catch (err) { 
      alert("Gagal simpan: " + err.message); 
    } finally { 
      setLoading(false); 
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-32 px-2 overflow-x-hidden">
      <div className="px-1 flex justify-between items-center">
        <h2 className="text-2xl font-black text-[#942E4D] italic uppercase mt-5">Pesanan</h2>
        {isEditMode && <span className="bg-orange-100 text-orange-600 text-[8px] font-black px-3 py-1 rounded-full uppercase">Mode Edit</span>}
      </div>

      {/* Input Section */}
      <div className="bg-white p-6 rounded-[2.5rem] shadow-sm space-y-4">
        <div className="space-y-2">
          <label className="text-[9px] font-black text-gray-300 uppercase ml-2 tracking-widest">Customer</label>
          <select 
            className="jastip-input bg-gray-50 border-none w-full text-xs font-bold"
            value={selectedCustomer}
            onChange={(e) => setSelectedCustomer(e.target.value)}
          >
            <option value="">-- Pilih Nama --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.nama_pelanggan}</option>)}
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-[9px] font-black text-gray-300 uppercase ml-2 tracking-widest">Fee Packing</label>
          <input 
            type="number" className="jastip-input bg-gray-50 border-none w-full text-xs font-bold"
            placeholder="Rp 0" value={feePacking} onChange={(e) => setFeePacking(e.target.value)}
          />
        </div>
      </div>

      {/* Product Grid */}
      <div className="grid grid-cols-2 gap-3">
        {products.map((p) => (
          <motion.div 
            whileTap={{ scale: 0.95 }}
            key={p.id} onClick={() => addToCart(p)} 
            className="bg-white p-4 rounded-[2.2rem] shadow-sm text-center border border-transparent active:border-[#FA4F82]"
          >
            <div className="w-10 h-10 bg-pink-50 rounded-2xl flex items-center justify-center text-[#FA4F82] mx-auto mb-2">
              <HiOutlinePlus size={18} />
            </div>
            <h4 className="text-[11px] font-bold text-gray-800 line-clamp-1">{p.nama_barang}</h4>
            <p className="text-[10px] font-black text-[#FA4F82]">Rp {p.harga_jual.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* BOTTOM SHEET CART */}
      <AnimatePresence>
        {cart.length > 0 && (
          <>
            {/* Backdrop */}
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onClick={() => setIsExpanded(false)}
                className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
              />
            )}

            {/* Draggable Sheet */}
            <motion.div 
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100) setIsExpanded(false);
                if (info.offset.y < -50) setIsExpanded(true);
              }}
              initial={{ y: 100 }}
              animate={{ y: isExpanded ? 0 : 'calc(100% - 100px)' }}
              className="fixed inset-x-0 bottom-0 z-[100] bg-white rounded-t-[3.5rem] shadow-[0_-20px_50px_rgba(0,0,0,0.1)] flex flex-col"
              style={{ height: '75vh' }}
            >
              {/* Handle Bar */}
              <div className="flex flex-col items-center pt-4 pb-6 cursor-grab active:cursor-grabbing" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-4" />
                {!isExpanded && (
                  <div className="w-full px-8 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="bg-[#FA4F82] p-2 rounded-xl text-white shadow-lg shadow-pink-100">
                        <HiOutlineShoppingCart size={18}/>
                      </div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-800">{cart.length} Item</span>
                    </div>
                    <div className="text-right">
                      <p className="text-[8px] font-black text-gray-300 uppercase">Total</p>
                      <p className="text-sm font-black text-[#942E4D]">Rp {totalAkhir.toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sheet Content */}
              <div className="flex-1 overflow-hidden flex flex-col px-8">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-black text-[#942E4D] italic uppercase">Ringkasan</h3>
                  <button onClick={() => setCart([])} className="text-[9px] font-black text-red-400 uppercase">Bersihkan</button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hide">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between items-center bg-gray-50/50 p-4 rounded-3xl">
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-gray-800 truncate">{item.nama_barang}</p>
                        <p className="text-[10px] font-black text-[#FA4F82]">Rp {item.harga_jual.toLocaleString()}</p>
                      </div>
                      <div className="flex items-center gap-4 ml-4">
                        <button onClick={() => updateQty(item.id, -1)} className="w-7 h-7 bg-white rounded-xl flex items-center justify-center shadow-sm text-gray-400"><HiOutlineMinus size={12}/></button>
                        <span className="text-xs font-black">{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)} className="w-7 h-7 bg-white rounded-xl flex items-center justify-center shadow-sm text-[#FA4F82]"><HiOutlinePlus size={12}/></button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer Checkout */}
                <div className="py-8 space-y-6">
                  <div className="flex justify-between items-end border-t border-dashed pt-6">
                    <div>
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Tagihan Akhir</p>
                      <p className="text-2xl font-black text-[#942E4D] italic">Rp {totalAkhir.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={handleProsesOrder} disabled={loading}
                      className="bg-[#FA4F82] text-white px-10 py-5 rounded-[2rem] font-black text-[11px] uppercase shadow-xl shadow-pink-100 active:scale-95 transition-all"
                    >
                      {loading ? 'Sabar...' : 'Selesaikan'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Pesanan;