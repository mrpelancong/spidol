using System;

namespace idcard.Dtos
{
    public class GetIdCardDto
    {
        public int Id { get; set; }
        public string Nik { get; set; }
        public int Nomor_idcard { get; set; }
        public string Tanggal { get; set; }
        public string Masa_berlaku { get; set; }
        public bool Status { get; set; }

        public bool Expired { get; set; }
    }
}