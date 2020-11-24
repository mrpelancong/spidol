using idcard.Models;

namespace idcard.Dtos
{
    public class GetLoginDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Token { get; set; }
        public string nama_lengkap { get; set; }
        public string Nik { get; set; }
        public string No_telp { get; set; }
        public string Alamat { get; set; }
        public int Struktur { get; set; }
        public int Akses { get; set; }
        public string Akses_name { get; set; }
        public GetVendorDto Vendor { get; set; }
        public GetWilayahDto Wilayah { get; set; }
    }
}