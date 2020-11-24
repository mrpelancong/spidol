using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace idcard.Dtos
{
    public class UpdatePengajuanDto
    {
        public int Id { get; set; }

        [Range(1, 999999999)]
        public int VendorId { get; set; }
        [Range(1, 999999999)]
        public int JenisId { get; set; }
        [Required]
        public string Nama_lengkap { get; set; }
        [Required]
        public string Alamat { get; set; }
        [Phone]
        [Required]
        public string No_telp { get; set; }
        [Required]
        public DateTime Tgl_pengajuan { get; set; }
        public string Keterangan { get; set; }
        public IFormFile Surat_permohonan { get; set; }
        public IFormFile Surat_pernyataan { get; set; }
        public IFormFile File_ktp { get; set; }
        public IFormFile File_biodata { get; set; }
        public IFormFile File_foto { get; set; }
        public IFormFile File_skck { get; set; }
        public IFormFile File_surat_sehat { get; set; }
        public IFormFile Surat_bebas_narkoba { get; set; }
        public IFormFile File_pendukung { get; set; }
    }
}