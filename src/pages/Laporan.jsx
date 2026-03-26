import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { 
  HiOutlineTrendingUp, HiOutlineCash, 
  HiOutlineDownload, HiOutlineDocumentText
} from 'react-icons/hi';

// Import Pustaka Export
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

const Laporan = () => {
  const [reportData, setReportData] = useState({
    totalOmzet: 0,
    totalLaba: 0,
    totalPesanan: 0,
    pesananSelesai: 0,
    rawData: []
  });
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  useEffect(() => {
    fetchProfile();
    fetchLaporan();
  }, [selectedMonth, selectedYear]);

  const fetchProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    setProfile(data);
  };

  const fetchLaporan = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const firstDay = new Date(selectedYear, selectedMonth - 1, 1).toISOString();
    const lastDay = new Date(selectedYear, selectedMonth, 0, 23, 59, 59).toISOString();

    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        invoice_number,
        total_harga,
        status,
        fee_packing,
        created_at,
        customers (nama_pelanggan),
        order_items (
          qty,
          harga_satuan,
          products (nama_barang, hpp)
        )
      `)
      .eq('user_id', user.id)
      .gte('created_at', firstDay)
      .lte('created_at', lastDay);

    if (error) {
      console.error("Gagal ambil data:", error);
      setLoading(false);
      return;
    }

    if (orders) {
      let grandTotalLabaKotor = 0; 
      let grandTotalLabaBersih = 0; 
      let detailedRows = [];

      orders.forEach(order => {
        // AMBIL FEE PACKING & PASTIKAN JADI ANGKA
        const feePerOrder = Number(order.fee_packing) || 0;
        
        let subtotalJualPerOrder = 0;
        let subtotalHppPerOrder = 0;

        order.order_items?.forEach((item, idx) => {
          const hpp = Number(item.products?.hpp) || 0;
          const jual = Number(item.harga_satuan) || 0;
          const qty = Number(item.qty) || 0;

          subtotalJualPerOrder += (jual * qty);
          subtotalHppPerOrder += (hpp * qty);

          detailedRows.push({
            Tanggal: new Date(order.created_at).toLocaleDateString('id-ID'),
            Invoice: order.invoice_number,
            Pelanggan: order.customers?.nama_pelanggan || 'Umum',
            Produk: item.products?.nama_barang || 'Produk',
            Qty: qty,
            HPP: hpp,
            'Harga Jual': jual,
            'Laba Per Produk': (jual - hpp) * qty,
            // Fee hanya dicatat di baris pertama tiap invoice agar tidak double hitung di Excel
            'Fee Packing': idx === 0 ? feePerOrder : 0,
            Status: order.status
          });
        });

        // RUMUS SESUAI PERMINTAAN
        // Laba Kotor (Omzet) = Total Harga Jual + Fee Packing
        grandTotalLabaKotor += (subtotalJualPerOrder + feePerOrder);

        // Laba Bersih (Profit) = (Total Harga Jual - Total HPP) + Fee Packing
        grandTotalLabaBersih += (subtotalJualPerOrder - subtotalHppPerOrder + feePerOrder);
      });

      setReportData({
        totalOmzet: grandTotalLabaKotor,
        totalLaba: grandTotalLabaBersih,
        totalPesanan: orders.length,
        pesananSelesai: orders.filter(o => o.status === 'Selesai').length,
        rawData: detailedRows
      });
    }
    setLoading(false);
  };

  const exportToExcel = () => {
    if (reportData.rawData.length === 0) return alert("Tidak ada data");
    const ws = XLSX.utils.json_to_sheet(reportData.rawData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Detail Transaksi");
    XLSX.writeFile(wb, `Laporan_${profile?.full_name || 'Jastip'}_${months[selectedMonth-1]}.xlsx`);
  };

  const exportToPDF = () => {
    if (reportData.rawData.length === 0) return alert("Tidak ada data");
    const doc = new jsPDF('landscape');
    
    // Header PDF
    doc.setFontSize(20);
    doc.setTextColor(148, 46, 77); 
    doc.text(profile?.full_name || 'JASTIP APP', 14, 15);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Laporan Bulanan: ${months[selectedMonth-1]} ${selectedYear}`, 14, 22);
    
    // Ringkasan Cepat di Atas Tabel
    doc.setTextColor(0);
    doc.setFont(undefined, 'bold');
    doc.text(`Total Laba Kotor (Omzet): Rp ${reportData.totalOmzet.toLocaleString()}`, 14, 32);
    doc.text(`Total Laba Bersih (Profit): Rp ${reportData.totalLaba.toLocaleString()}`, 14, 38);
    doc.setFont(undefined, 'normal');

    const tableColumn = ["Tanggal", "Invoice", "Pelanggan", "Produk", "Qty", "HPP", "Jual", "Laba", "Fee", "Status"];
    
    // Ambil data baris
    const tableRows = reportData.rawData.map(d => [
      d.Tanggal, 
      d.Invoice, 
      d.Pelanggan, 
      d.Produk, 
      d.Qty, 
      d.HPP.toLocaleString(), 
      d['Harga Jual'].toLocaleString(), 
      d['Laba Per Produk'].toLocaleString(), 
      d['Fee Packing'].toLocaleString(), 
      d.Status
    ]);

    // Hitung Total untuk Footer
    const totalQty = reportData.rawData.reduce((sum, d) => sum + d.Qty, 0);
    const totalFee = reportData.rawData.reduce((sum, d) => sum + d['Fee Packing'], 0);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      // TAMBAHKAN FOOTER DI SINI
      foot: [[
        { content: 'TOTAL SELURUHNYA', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
        { content: totalQty.toString(), styles: { fontStyle: 'bold' } },
        '', // Kosongkan HPP
        '', // Kosongkan Jual
        { content: 'Rp ' + reportData.totalLaba.toLocaleString(), styles: { fontStyle: 'bold' } }, // Total Laba
        { content: 'Rp ' + totalFee.toLocaleString(), styles: { fontStyle: 'bold' } }, // Total Fee
        ''  // Kosongkan Status
      ]],
      startY: 45,
      theme: 'grid',
      styles: { fontSize: 7, cellPadding: 2 },
      headStyles: { fillColor: [148, 46, 77], textColor: 255, fontStyle: 'bold' },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontSize: 7 }, // Gaya footer
      alternateRowStyles: { fillColor: [250, 250, 250] }
    });
    
    doc.save(`Laporan_${profile?.full_name || 'Jastip'}_${months[selectedMonth-1]}.pdf`);
  };

  return (
    <div className="space-y-6 pb-24 px-4 overflow-x-hidden">
      <div className="flex justify-between items-end px-1">
        <div>
          <h2 className="text-xl font-black text-[#942E4D] italic uppercase tracking-tighter mt-8">Laporan   Cuan</h2>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{months[selectedMonth-1]} {selectedYear}</p>
        </div>
        <select 
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
          className="bg-white border-none text-[10px] font-bold uppercase rounded-xl px-3 py-2 shadow-sm text-[#942E4D]"
        >
          {months.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3 px-1">
        <button onClick={exportToExcel} className="bg-green-50 text-green-600 py-3 rounded-2xl font-black text-[9px] uppercase flex items-center justify-center gap-2 border border-green-100">
          <HiOutlineDocumentText size={16}/> Excel
        </button>
        <button onClick={exportToPDF} className="bg-red-50 text-red-600 py-3 rounded-2xl font-black text-[9px] uppercase flex items-center justify-center gap-2 border border-red-100">
          <HiOutlineDownload size={16}/> PDF
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center py-20 text-gray-300">
          <div className="w-10 h-10 border-4 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-[#942E4D] p-8 rounded-[3rem] shadow-xl text-white relative overflow-hidden">
            <HiOutlineCash className="absolute -right-4 -bottom-4 text-white/10" size={150} />
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-80 mb-1">Total Laba Bersih</p>
              <h3 className="text-3xl font-black italic">Rp {reportData.totalLaba.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm flex items-center justify-between border border-gray-50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-pink-50 rounded-2xl flex items-center justify-center text-[#FA4F82]">
                <HiOutlineTrendingUp size={24} />
              </div>
              <div>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Laba Kotor (Omzet)</p>
                <h4 className="text-lg font-black text-gray-800">Rp {reportData.totalOmzet.toLocaleString()}</h4>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 text-center text-gray-800">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Total Order</p>
              <h4 className="text-xl font-black">{reportData.totalPesanan}</h4>
            </div>
            <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-50 text-center">
              <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Selesai</p>
              <h4 className="text-xl font-black text-green-500">{reportData.pesananSelesai}</h4>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Laporan;