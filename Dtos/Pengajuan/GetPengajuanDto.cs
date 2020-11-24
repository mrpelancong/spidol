using System;

namespace idcard.Dtos
{
    public class GetPengajuanDto
    {
        public int Id { get; set; }
        public string Nik { get; set; }
        public string Nama_lengkap { get; set; }
        public string Alamat { get; set; }
        public string No_telp { get; set; }
        public string Tgl_pengajuan { get; set; }
        public string Tgl_lahir { get; set; }
        public string Keterangan { get; set; }
        public string Status_pengajuan { get; set; }
        public string Surat_permohonan { get; set; }
        public string Surat_pernyataan { get; set; }
        public string File_ktp { get; set; }
        public string File_biodata { get; set; }
        public string File_foto { get; set; }
        public string File_skck { get; set; }
        public string File_surat_sehat { get; set; }
        public string Surat_bebas_narkoba { get; set; }
        public string File_pendukung { get; set; }
        public bool Perpanjangan { get; set; }
        public bool Proses { get; set; }
        public GetVendorDto Vendor { get; set; }
        public GetJenisDto Jenis { get; set; }
        public GetIdCardDto IdCard { get; set; }
    }
}