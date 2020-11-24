using System;
using System.ComponentModel.DataAnnotations;

namespace idcard.Models
{
    public class Struktur
    {
        [Key]
        public int Id { get; set; }
        public string nama_struktur { get; set; }
        public int urutan { get; set; }
        public DateTime Sistem_created_time { get; set; }

        public DateTime Sistem_updated_time { get; set; }
        public Akses Akses { get; set; }
    }
}