using System;
using System.ComponentModel.DataAnnotations;

namespace idcard.Models
{
    public class Pengajuan
    {
        [Key]
        public int Id { get; set; }
        public string Nik { get; set; }
        public string Nama_lengkap { get; set; }
        public string Alamat { get; set; }
        public string No_telp { get; set; }
        public DateTime Tgl_pengajuan { get; set; }
        public DateTime Tgl_lahir { get; set; }
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
        public DateTime Sistem_created_time { get; set; }
        public DateTime Sistem_updated_time { get; set; }

        public Vendor Vendor { get; set; }
        public Jenis Jenis { get; set; }
    }
}