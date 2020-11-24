using System.ComponentModel.DataAnnotations;

namespace idcard.Dtos
{
    public class AddVendorDto
    {
        [Required]
        public string Username { get; set; }
        [Required]
        public string Password { get; set; }
        [Required]
        public string AksesId { get; set; }
        [Required]
        public string Nama_vendor { get; set; }
        [Required]
        public string Alamat_vendor { get; set; }
        [Required]
        public string No_telp { get; set; }
        [Required]
        public string Penanggung_jawab { get; set; }
        [Required]
        public string No_telp_pj { get; set; }
        [Required]
        public string Nama_project { get; set; }
    }
}