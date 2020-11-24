using System;
using System.ComponentModel.DataAnnotations;

namespace idcard.Models
{
    public class Proses
    {
        [Key]
        public int Id { get; set; }
        public string Status_proses { get; set; }
        public string Catatan { get; set; }
        public DateTime Tanggal_proses { get; set; }
        public User User { get; set; }
        public User Next { get; set; }
        public Pengajuan Pengajuan { get; set; }
    }
}