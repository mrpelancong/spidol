using System.Collections.Generic;

namespace idcard.Dtos
{
    public class GetBlacklistAllDto
    {
        public int Id { get; set; }
        public string Nik { get; set; }
        public string Nama_lengkap { get; set; }
        public string Alamat { get; set; }
        public string No_telp { get; set; }
        public string Tgl_pengajuan { get; set; }
        public string Keterangan { get; set; }
        public bool Blacklist { get; set; }
        public string Keterangan_bl { get; set; }
    }
}