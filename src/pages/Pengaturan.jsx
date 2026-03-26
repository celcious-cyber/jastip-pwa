import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  HiOutlineHome, HiOutlineUser, HiOutlineChatAlt2, 
  HiOutlineSaveAs, HiOutlineCreditCard, HiOutlinePlus, HiOutlineTrash 
} from 'react-icons/hi';

const Pengaturan = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    nama_toko: '',
    nama_admin: '',
    tagline: '',
    text_penutup_wa: '',
    rekening: [] // Array untuk menampung banyak bank
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile({
          nama_toko: data.nama_toko || '',
          nama_admin: data.nama_admin || '',
          tagline: data.tagline || '',
          text_penutup_wa: data.text_penutup_wa || '',
          rekening: data.rekening || [] // Ambil data JSONB
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI DINAMIS REKENING ---
  const addRekening = () => {
    setProfile({
      ...profile,
      rekening: [...profile.rekening, { bank: '', nomor: '', atas_nama: '' }]
    });
  };

  const updateRekening = (index, field, value) => {
    const newRekening = [...profile.rekening];
    newRekening[index][field] = value;
    setProfile({ ...profile, rekening: newRekening });
  };

  const removeRekening = (index) => {
    const newRekening = profile.rekening.filter((_, i) => i !== index);
    setProfile({ ...profile, rekening: newRekening });
  };
  // ------------------------------

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...profile,
          updated_at: new Date()
        });

      if (error) throw error;
      alert("Pengaturan & Rekening berhasil disimpan! ✨");
    } catch (error) {
      alert("Gagal menyimpan: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 text-[#FA4F82] animate-pulse">
      <HiOutlineHome size={40} className="mb-2" />
      <p className="font-bold text-[10px] uppercase tracking-[0.2em]">Memuat Profil Toko...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-fade-in pb-28 px-2">
      <div className="px-1">
        <h2 className="text-xl font-bold text-[#942E4D] mt-5">Pengaturan Toko</h2>
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">Identitas Jastip & Pembayaran</p>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Card 1: Branding (Sama seperti sebelumnya) */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 space-y-4">
          <div className="flex items-center space-x-2 mb-2 text-[#FA4F82]">
            <HiOutlineHome size={20} />
            <span className="text-xs font-black uppercase tracking-tighter">Profil Usaha</span>
          </div>
          <input 
            type="text" className="jastip-input" placeholder="Nama Toko"
            value={profile.nama_toko} onChange={(e) => setProfile({...profile, nama_toko: e.target.value})} required
          />
          <input 
            type="text" className="jastip-input" placeholder="Nama Admin"
            value={profile.nama_admin} onChange={(e) => setProfile({...profile, nama_admin: e.target.value})}
          />
        </div>

        {/* Card 2: Kelola Rekening (BARU) */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center space-x-2 text-[#FA4F82]">
              <HiOutlineCreditCard size={20} />
              <span className="text-xs font-black uppercase tracking-tighter">Metode Pembayaran</span>
            </div>
            <button 
              type="button" onClick={addRekening}
              className="text-[10px] font-bold text-blue-500 bg-blue-50 px-3 py-1 rounded-full flex items-center"
            >
              <HiOutlinePlus className="mr-1" /> TAMBAH BANK
            </button>
          </div>

          {profile.rekening.length === 0 ? (
            <p className="text-[10px] text-gray-300 italic text-center py-2">Belum ada rekening ditambahkan.</p>
          ) : (
            profile.rekening.map((rek, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-3xl relative space-y-2 border border-gray-100">
                <button 
                  type="button" onClick={() => removeRekening(index)}
                  className="absolute -top-2 -right-2 bg-red-100 text-red-500 p-1.5 rounded-full shadow-sm"
                >
                  <HiOutlineTrash size={14} />
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <input 
                    type="text" placeholder="Nama Bank (BCA/Mandiri)" className="jastip-input text-[11px] py-2"
                    value={rek.bank} onChange={(e) => updateRekening(index, 'bank', e.target.value)}
                  />
                  <input 
                    type="text" placeholder="Nomor Rekening" className="jastip-input text-[11px] py-2"
                    value={rek.nomor} onChange={(e) => updateRekening(index, 'nomor', e.target.value)}
                  />
                </div>
                <input 
                  type="text" placeholder="Atas Nama (Pemilik)" className="jastip-input text-[11px] py-2"
                  value={rek.atas_nama} onChange={(e) => updateRekening(index, 'atas_nama', e.target.value)}
                />
              </div>
            ))
          )}
        </div>

        {/* Card 3: Template Pesan */}
        <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 space-y-4">
          <div className="flex items-center space-x-2 mb-2 text-[#FA4F82]">
            <HiOutlineChatAlt2 size={20} />
            <span className="text-xs font-black uppercase tracking-tighter">Template Pesan</span>
          </div>
          <textarea 
            rows="3" className="jastip-input resize-none py-3" placeholder="Pesan Penutup WA..."
            value={profile.text_penutup_wa} onChange={(e) => setProfile({...profile, text_penutup_wa: e.target.value})}
          />
        </div>

        <button 
          type="submit" disabled={saving}
          className={`w-full py-4 rounded-[2rem] font-black text-xs text-white shadow-xl flex items-center justify-center space-x-2 transition-all active:scale-95 ${saving ? 'bg-gray-400' : 'bg-[#FA4F82] shadow-pink-100 uppercase tracking-widest'}`}
        >
          <HiOutlineSaveAs size={20} />
          <span>{saving ? 'PROSES MENYIMPAN...' : 'SIMPAN PENGATURAN'}</span>
        </button>
      </form>
    </div>
  );
};

export default Pengaturan;