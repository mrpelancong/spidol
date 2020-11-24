using System;
using System.ComponentModel.DataAnnotations;

namespace idcard.Dtos
{
    public class AddDataPengajuanDto
    {
        [Range(1, 999999999)]
        public int VendorId { get; set; }
        [Range(1, 999999999)]
        public int JenisId { get; set; }
        [Required]
        public string Nik { get; set; }
        [Required]
        public string Nama_lengkap { get; set; }
        public string Alamat { get; set; }
        [Phone]
        [Required]
        public string No_telp { get; set; }
        [Required]
        public DateTime Tgl_pengajuan { get; set; }
        public DateTime Tgl_lahir { get; set; }
        public string Keterangan { get; set; }
        public int Perpanjangan { get; set; }
    }
}