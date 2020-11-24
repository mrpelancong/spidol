using System;
using System.ComponentModel.DataAnnotations;

namespace idcard.Models
{
    public class Blacklist
    {
        [Key]
        public int Id { get; set; }
        public string Nik { get; set; }
        public string Status_blacklist { get; set; }
        public string Keterangan_blacklist { get; set; }
        public DateTime Tgl_blacklist { get; set; }
        public DateTime Sistem_created_time { get; set; }
        public DateTime Sistem_updated_time { get; set; }
        public Pengajuan Pengajuan { get; set; }
    }
}