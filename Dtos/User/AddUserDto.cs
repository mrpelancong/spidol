using System.ComponentModel.DataAnnotations;

namespace idcard.Dtos
{
    public class AddUserDto
    {
        public string Jenis { get; set; }
        public string Nik { get; set; }
        public string Alamat { get; set; }
        public string Nama_lengkap { get; set; }
        [Required]
        public string Username { get; set; }
        [Required]
        public string Password { get; set; }
        [Required]
        public int StrukturId { get; set; }
        public int WilayahId { get; set; }
        public string Nama_vendor { get; set; }
        public string Alamat_vendor { get; set; }
        public string No_telp { get; set; }
        public string Penanggung_jawab { get; set; }
        public string No_telp_pj { get; set; }
        public string Nama_project { get; set; }
    }
}