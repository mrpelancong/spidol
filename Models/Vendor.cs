using System;
using System.ComponentModel.DataAnnotations;

namespace idcard.Models
{
    public class Vendor
    {
        [Key]
        public int Id { get; set; }
        public string Nama_vendor { get; set; }
        public string Alamat_vendor { get; set; }
        public string No_telp { get; set; }
        public string Penanggung_jawab { get; set; }
        public string No_telp_pj { get; set; }

        public DateTime Sistem_created_time { get; set; }
        public DateTime Sistem_updated_time { get; set; }

        public User User { get; set; }
    }
}