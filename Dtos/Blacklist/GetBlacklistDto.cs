namespace idcard.Dtos
{
    public class GetBlacklistDto
    {
        public int Id { get; set; }
        public string Nik { get; set; }
        public string Status_blacklist { get; set; }
        public string Keterangan_blacklist { get; set; }
        public string Tgl_blacklist { get; set; }
        public string Sistem_updated_time { get; set; }
        public GetPengajuanBLDto Pengajuan { get; set; }
    }
}