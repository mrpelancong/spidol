using System.ComponentModel.DataAnnotations;

namespace idcard.Dtos
{
    public class UpdateVendorDto
    {
        [Range(1, 999999999)]
        public int Id { get; set; }
        [Required]
        public string Nama_vendor { get; set; }
        [Required]
        public string Alamat_vendor { get; set; }
        [Phone]
        [Required]
        public string No_telp { get; set; }
        [Required]
        public string Penanggung_jawab { get; set; }
        [Phone]
        [Required]
        public string No_telp_pj { get; set; }
    }
}