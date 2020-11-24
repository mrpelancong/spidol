using System;
using System.ComponentModel.DataAnnotations;

namespace idcard.Models
{
    public class Akses
    {
        [Key]
        public int Id { get; set; }
        public string Akses_name { get; set; }
        public string Akses_status { get; set; }
        public DateTime Sistem_created_time { get; set; }
        public DateTime Sistem_updated_time { get; set; }
        public string Sistem_ip_create { get; set; }
    }
}