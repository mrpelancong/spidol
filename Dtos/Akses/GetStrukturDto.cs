namespace idcard.Dtos
{
    public class GetStrukturDto
    {
        public int Id { get; set; }
        public string nama_struktur { get; set; }
        public int urutan { get; set; }
        public GetAksesDto Akses { get; set; }
    }
}