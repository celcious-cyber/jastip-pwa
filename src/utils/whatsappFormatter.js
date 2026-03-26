export const sendWhatsAppInvoice = (inv, profile) => {
  if (!inv) return;

  // 1. Format Tanggal (Contoh: 26 Maret 2026)
  const tgl = new Date(inv.created_at).toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  });

  // 2. Format List Barang
  const listItems = inv.order_items?.map(item => {
    const nama = item.products?.nama_barang || 'Produk';
    const qty = item.qty || 0;
    const harga = (item.qty * item.harga_satuan).toLocaleString('id-ID');
    return `• ${nama} x${qty} — Rp ${harga}`;
  }).join('\n') || 'Tidak ada rincian';

  // 3. LOGIKA REKENING (Mencegah [object Object])
  let infoRekening = "";
  const rek = profile?.rekening;

  if (!rek) {
    infoRekening = "(Belum diatur di Pengaturan)";
  } else if (Array.isArray(rek)) {
    // Jika data berupa Array (Banyak Bank)
    infoRekening = rek.map(r => 
      `${r.bank || ''} ${r.nomor || r.no_rek || ''} a/n ${r.nama || r.atas_nama || ''}`
    ).join('\n');
  } else if (typeof rek === 'object') {
    // Jika data berupa satu Object {bank: '...', nomor: '...', nama: '...'}
    infoRekening = `${rek.bank || ''} ${rek.nomor || rek.no_rek || ''}\na/n ${rek.nama || rek.atas_nama || ''}`;
  } else {
    // Jika data sudah berupa teks biasa
    infoRekening = rek;
  }

  // 4. Susun Template Pesan (Pastikan baris baru terjaga)
  const message = 
`Halo *${inv.customers?.nama_pelanggan || 'Pelanggan'}* 👋
Pesanan kamu sudah kami proses ya!

*${profile?.nama_toko || 'JASTIPIN.SINI'}*
_${profile?.tagline || 'Jasa Titip Terpercaya'}_

*Invoice #${inv.invoice_number}*
Tanggal: ${tgl}

*Rincian Pesanan:*
${listItems}
─────────────────────
*Total Tagihan: Rp ${inv.total_harga?.toLocaleString('id-ID')}*

🏦 *Transfer ke:*
${infoRekening}

${profile?.text_penutup_wa || 'Terima kasih sudah mempercayai kami!'}`;

  // 5. Eksekusi URL dengan api.whatsapp.com (Lebih Stabil)
  const phone = inv.customers?.no_telpon?.replace(/\D/g, '') || '';
  const finalUrl = `https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(message)}`;
  
  window.open(finalUrl, '_blank');
};