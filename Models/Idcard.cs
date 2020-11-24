using System;
using System.ComponentModel.DataAnnotations;

namespace idcard.Models
{
    public class Idcard
    {
        [Key]
        public int Id { get; set; }
        public string Nik { get; set; }
        public int Nomor_idcard { get; set; }
        public bool Status { get; set; }
        public DateTime Tanggal { get; set; }
        public DateTime Masa_berlaku { get; set; }
        public DateTime Sistem_created_time { get; set; }
        public Pengajuan Pengajuan { get; set; }
    }
}