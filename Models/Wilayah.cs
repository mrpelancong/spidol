using System;
using System.ComponentModel.DataAnnotations;

namespace idcard.Models
{
    public class Wilayah
    {
        [Key]
        public int Id { get; set; }

        public string Nama_wilayah { get; set; }
        
        public string Status_wilayah { get; set; }

        public DateTime Sistem_created_time { get; set; }

        public DateTime Sistem_updated_time { get; set; }
    }
}