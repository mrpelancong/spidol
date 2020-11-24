using System;
using System.ComponentModel.DataAnnotations;

namespace idcard.Models
{
    public class Jenis
    {
        [Key]
        public int Id { get; set; }
        public string nama_jenis { get; set; }
        public DateTime Sistem_created_time { get; set; }

        public DateTime Sistem_updated_time { get; set; }
        public Akses Akses { get; set; }
    }
}