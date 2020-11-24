using idcard.Models;

namespace idcard.Dtos
{
    public class GetAkunDto
    {
        public int Id { get; set; }
        public string nama_lengkap { get; set; }
        public string Nik { get; set; }
        public string Alamat { get; set; }
        public string No_telp { get; set; }
        public GetUserDto User { get; set; }
    }
}