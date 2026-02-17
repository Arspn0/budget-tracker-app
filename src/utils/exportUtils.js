import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system/legacy';
import Papa from 'papaparse';

// ─── Format helpers ────────────────────────────────────────────────────────
const formatRupiah = (amount = 0) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);

const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
  });

const monthName = (month, year) =>
  new Date(year, month - 1, 1).toLocaleDateString('id-ID', {
    month: 'long', year: 'numeric',
  });

// ─── Build HTML for PDF ───────────────────────────────────────────────────
const buildHTML = ({ transactions, summary, categoryBreakdown, wallets, month, year }) => {
  const period = monthName(month, year);

  const catRows = categoryBreakdown.map(cat => `
    <tr>
      <td>
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;
          background:${cat.color || '#9FA5B4'};margin-right:6px;vertical-align:middle;"></span>
        ${cat.name}
      </td>
      <td class="right">${cat.count}x</td>
      <td class="right danger">${formatRupiah(cat.total)}</td>
    </tr>`).join('');

  const txRows = transactions.map(tx => `
    <tr>
      <td>${formatDate(tx.date)}</td>
      <td>${tx.category_name || '—'}</td>
      <td>${tx.wallet_name   || '—'}</td>
      <td>${tx.note          || '—'}</td>
      <td class="right ${tx.type === 'income' ? 'success' : 'danger'}">
        ${tx.type === 'income' ? '+' : '−'}${formatRupiah(tx.amount)}
      </td>
    </tr>`).join('');

  const walletRows = wallets.map(w => `
    <tr>
      <td>${w.name}</td>
      <td>${w.type === 'cash' ? 'Cash' : w.type === 'bank' ? 'Bank' : 'E-Wallet'}</td>
      <td class="right">${formatRupiah(w.balance)}</td>
    </tr>`).join('');

  return `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Laporan Keuangan — ${period}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: 'Helvetica Neue', Arial, sans-serif;
    color: #1a1a2e;
    background: #f8f9fa;
    padding: 32px;
  }
  .header {
    background: linear-gradient(135deg, #3ED6C4, #17A696);
    color: white;
    border-radius: 16px;
    padding: 28px 32px;
    margin-bottom: 28px;
  }
  .header h1 { font-size: 24px; font-weight: 800; }
  .header p  { font-size: 14px; opacity: 0.85; margin-top: 6px; }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }
  .summary-card {
    background: white;
    border-radius: 12px;
    padding: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,.06);
  }
  .summary-card .label {
    font-size: 12px;
    color: #9FA5B4;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: .5px;
  }
  .summary-card .value {
    font-size: 22px;
    font-weight: 800;
    margin-top: 6px;
  }
  .success { color: #4CAF50; }
  .danger  { color: #FF5252; }
  .neutral { color: #3ED6C4; }
  section {
    background: white;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0,0,0,.06);
  }
  section h2 {
    font-size: 16px;
    font-weight: 700;
    margin-bottom: 16px;
    color: #1a1a2e;
    border-bottom: 2px solid #f0f0f0;
    padding-bottom: 10px;
  }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th {
    text-align: left;
    color: #9FA5B4;
    font-weight: 600;
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: .5px;
    padding: 8px 10px;
    border-bottom: 1px solid #f0f0f0;
  }
  td {
    padding: 12px 10px;
    border-bottom: 1px solid #f8f8f8;
    vertical-align: middle;
  }
  tr:last-child td { border-bottom: none; }
  .right { text-align: right; }
  .footer {
    text-align: center;
    color: #9FA5B4;
    font-size: 12px;
    margin-top: 32px;
  }
</style>
</head>
<body>

<div class="header">
  <h1>📊 Laporan Keuangan</h1>
  <p>Periode: ${period} &nbsp;·&nbsp; Dicetak: ${formatDate(new Date().toISOString().split('T')[0])}</p>
</div>

<div class="summary-grid">
  <div class="summary-card">
    <div class="label">Total Pemasukan</div>
    <div class="value success">${formatRupiah(summary.income)}</div>
  </div>
  <div class="summary-card">
    <div class="label">Total Pengeluaran</div>
    <div class="value danger">${formatRupiah(summary.expense)}</div>
  </div>
  <div class="summary-card">
    <div class="label">Selisih (Net)</div>
    <div class="value neutral">${formatRupiah(summary.income - summary.expense)}</div>
  </div>
</div>

<section>
  <h2>💳 Saldo Dompet</h2>
  <table>
    <thead>
      <tr><th>Nama</th><th>Tipe</th><th class="right">Saldo</th></tr>
    </thead>
    <tbody>${walletRows || '<tr><td colspan="3" style="text-align:center;color:#9FA5B4">Tidak ada dompet</td></tr>'}</tbody>
  </table>
</section>

${categoryBreakdown.length > 0 ? `
<section>
  <h2>🧩 Pengeluaran per Kategori</h2>
  <table>
    <thead>
      <tr><th>Kategori</th><th class="right">Transaksi</th><th class="right">Total</th></tr>
    </thead>
    <tbody>${catRows}</tbody>
  </table>
</section>` : ''}

<section>
  <h2>📝 Daftar Transaksi (${transactions.length} transaksi)</h2>
  ${transactions.length === 0
    ? '<p style="color:#9FA5B4;text-align:center;padding:20px">Tidak ada transaksi</p>'
    : `<table>
      <thead>
        <tr>
          <th>Tanggal</th>
          <th>Kategori</th>
          <th>Dompet</th>
          <th>Catatan</th>
          <th class="right">Jumlah</th>
        </tr>
      </thead>
      <tbody>${txRows}</tbody>
    </table>`
  }
</section>

<div class="footer">
  Budget Tracker App &nbsp;·&nbsp; Laporan dibuat otomatis
</div>
</body>
</html>`;
};

// ─── EXPORT PDF ───────────────────────────────────────────────────────────
export const exportPDF = async ({ transactions, summary, categoryBreakdown, wallets, month, year }) => {
  try {
    const html = buildHTML({ transactions, summary, categoryBreakdown, wallets, month, year });

    // Print to temp file
    const { uri } = await Print.printToFileAsync({ html, base64: false });

    // Build destination path
    const period = `${year}-${String(month).padStart(2, '0')}`;
    const dest   = `${FileSystem.documentDirectory}laporan-keuangan-${period}.pdf`;

    // moveAsync from legacy — still works fine
    await FileSystem.moveAsync({ from: uri, to: dest });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(dest, {
        mimeType:    'application/pdf',
        dialogTitle: 'Bagikan Laporan PDF',
        UTI:         'com.adobe.pdf',
      });
    }

    return dest;
  } catch (error) {
    console.error('Export PDF error:', error);
    throw error;
  }
};

// ─── EXPORT CSV ───────────────────────────────────────────────────────────
export const exportCSV = async ({ transactions, month, year }) => {
  try {
    const rows = transactions.map(tx => ({
      Tanggal:     tx.date,
      Tipe:        tx.type === 'income' ? 'Pemasukan' : 'Pengeluaran',
      Kategori:    tx.category_name  || '',
      Dompet:      tx.wallet_name    || '',
      'Jumlah (Rp)': tx.amount,
      Catatan:     tx.note           || '',
    }));

    const csv    = Papa.unparse(rows, { delimiter: ',', quotes: true });
    const period = `${year}-${String(month).padStart(2, '0')}`;
    const path   = `${FileSystem.documentDirectory}laporan-keuangan-${period}.csv`;

    // ✅ writeAsStringAsync from legacy — still works fine
    await FileSystem.writeAsStringAsync(path, csv, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(path, {
        mimeType:    'text/csv',
        dialogTitle: 'Bagikan Laporan CSV',
        UTI:         'public.comma-separated-values-text',
      });
    }

    return path;
  } catch (error) {
    console.error('Export CSV error:', error);
    throw error;
  }
};