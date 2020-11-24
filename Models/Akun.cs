using System;
using System.ComponentModel.DataAnnotations;

namespace idcard.Models
{
    public class Akun
    {
        [Key]
        public int Id { get; set; }
        public string nama_lengkap { get; set; }
        public string Nik { get; set; }
        public string Alamat { get; set; }
        public string No_telp { get; set; }

        public DateTime Sistem_created_time { get; set; }

        public DateTime Sistem_updated_time { get; set; }
        public User User { get; set; }
    }
}