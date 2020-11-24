using System.ComponentModel.DataAnnotations;

namespace idcard.Dtos
{
    public class UpdateStruktur
    {
        [Range(1, 99999999999)]
        public int Id { get; set; }
        [Required]
        public string nama_struktur { get; set; }
        [Required]
        public int urutan { get; set; }
    }
}