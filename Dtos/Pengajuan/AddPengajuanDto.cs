using System;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

namespace idcard.Dtos
{
    public class AddPengajuanDto
    {
        public IFormFile Surat_permohonan { get; set; }
        public IFormFile Surat_pernyataan { get; set; }
        public IFormFile File_ktp { get; set; }
        public IFormFile File_biodata { get; set; }
        public IFormFile File_foto { get; set; }
        public IFormFile File_skck { get; set; }
        public IFormFile File_surat_sehat { get; set; }
        public IFormFile Surat_bebas_narkoba { get; set; }
        public IFormFile File_pendukung { get; set; }
    }
}