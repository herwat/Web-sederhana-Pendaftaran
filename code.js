function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Form Pendaftaran Kontingen')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function uploadForm(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName('Data');

  if (!sheet) {
    sheet = ss.insertSheet('Data');
    sheet.appendRow(['Timestamp', 'Kontingen', 'Nama', 'Usia', 'Jenis Kelamin', 'Kategori', 'Subkategori', 'Link Berkas', 'Link Pas Foto']);
  }

  const timestamp = new Date();

  // Folder utama (ganti ID dengan ID folder Google Drive kamu)
  const folderId = '1HaAWJjATcCKp9OE-tA9qvLH2r3CLp7VB';
  const mainFolder = DriveApp.getFolderById(folderId);

  const pesertaList = data.pesertaList;
  const kontingen = data.kontingen;

  pesertaList.forEach(peserta => {
    const nama = peserta.nama;
    const usia = peserta.usia;
    const jenisKelamin = peserta.jenisKelamin;
    const kategori = peserta.kategori;
    const subKategori = peserta.subKategori;

    // Cek atau buat folder kontingen
    const folders = mainFolder.getFoldersByName(kontingen);
    const folder = folders.hasNext() ? folders.next() : mainFolder.createFolder(kontingen);

    // Simpan file kelengkapan berkas
    const berkasBlob = Utilities.newBlob(
      Utilities.base64Decode(peserta.kelengkapanBerkas),
      peserta.kelengkapanBerkasType,
      peserta.kelengkapanBerkasName
    );
    const berkasFile = folder.createFile(berkasBlob);
    const berkasUrl = berkasFile.getUrl();

    // Simpan pas foto
    const pasFotoBlob = Utilities.newBlob(
      Utilities.base64Decode(peserta.pasFoto),
      peserta.pasFotoType,
      peserta.pasFotoName
    );
    const pasFotoFile = folder.createFile(pasFotoBlob);
    const pasFotoUrl = pasFotoFile.getUrl();

    // Simpan ke Sheet utama
    sheet.appendRow([timestamp, kontingen, nama, usia, jenisKelamin, kategori, subKategori, berkasUrl, pasFotoUrl]);

    // Simpan ke Sheet kombinasi JenisKelamin - Subkategori
    const sheetName = `${jenisKelamin} - ${subKategori}`;
    let comboSheet = ss.getSheetByName(sheetName);

    if (!comboSheet) {
      comboSheet = ss.insertSheet(sheetName);
      comboSheet.appendRow(["Nama Peserta", "Nama Kontingen", "Usia", "Jenis Kelamin", "Subkategori"]);
    }

    comboSheet.appendRow([nama, kontingen, usia, jenisKelamin, subKategori]);
  });

  return { status: 'success', message: 'Pendaftaran berhasil disimpan!' };
}
