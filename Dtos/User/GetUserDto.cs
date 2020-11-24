namespace idcard.Dtos
{
    public class GetUserDto
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public GetStrukturDto Struktur { get; set; }
        public GetWilayahDto Wilayah { get; set; }
    }
}