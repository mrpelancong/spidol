using System;
using System.ComponentModel.DataAnnotations;

namespace idcard.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(70)]
        public string Username { get; set; }

        [Required]
        public byte[] PasswordHash { get; set; }

        [Required]
        public byte[] PasswordSalt { get; set; }

        public DateTime Sistem_created_time { get; set; }

        public DateTime Sistem_updated_time { get; set; }

        [Required]
        public string Sistem_ip_create { get; set; }

        public Struktur Struktur { get; set; }
        public Wilayah Wilayah { get; set; }
    }
}