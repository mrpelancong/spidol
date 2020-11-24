using idcard.Models;

namespace idcard.Dtos
{
    public class GetVendorDto
    {
        public int Id { get; set; }
        public string Nama_vendor { get; set; }
        public string Alamat_vendor { get; set; }
        public string No_telp { get; set; }
        public string Penanggung_jawab { get; set; }
        public string No_telp_pj { get; set; }

        public GetUserDto User { get; set; }
    }
}