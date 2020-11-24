namespace idcard.Dtos
{
    public class GetPengajuanBLDto
    {
        public int Id { get; set; }
        public string Nik { get; set; }
        public string Nama_lengkap { get; set; }
        public string Alamat { get; set; }
        public string No_telp { get; set; }
        public string Tgl_pengajuan { get; set; }
        public string Keterangan { get; set; }
        public string Status_pengajuan { get; set; }
    }
}