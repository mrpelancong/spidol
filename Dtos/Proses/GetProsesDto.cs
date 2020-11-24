namespace idcard.Dtos
{
    public class GetProsesDto
    {
        public int Id { get; set; }
        public string Status_proses { get; set; }
        public string Catatan { get; set; }
        public string Tanggal_proses { get; set; }
        public string Posisi { get; set; }
        public GetUserDto User { get; set; }
        public GetUserDto Next { get; set; }
        public GetPengajuanDto Pengajuan { get; set; }
    }
}