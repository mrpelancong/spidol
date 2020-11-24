namespace idcard.Dtos
{
    public class GetJenisDto
    {
        public int Id { get; set; }
        public string nama_jenis { get; set; }
        public GetAksesDto Akses { get; set; }
    }
}