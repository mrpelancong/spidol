using System.Collections.Generic;
using System.Threading.Tasks;
using idcard.Dtos;
using idcard.Models;
using Microsoft.AspNetCore.Http;

namespace idcard.Services
{
    public interface IPengajuanService
    {
        Task<ServiceResponse<List<GetPengajuanDto>>> GetAllPengajuan(int userId);
        Task<ServiceResponse<List<GetPengajuanDto>>> GetPengajuanByStatus(string status);
        Task<ServiceResponse<List<GetPengajuanDto>>> GetPengajuanByVendor(int vendorId);
        Task<ServiceResponse<GetPengajuanDto>> GetPengajuanById(int id);
        Task<ServiceResponse<GetPengajuanDto>> AddDataPengajuan(AddDataPengajuanDto req);
        Task<ServiceResponse<GetPengajuanDto>> AddFilePengajuanAdd(int id, IFormFile file, string jenis);
        Task<ServiceResponse<GetPengajuanDto>> DeletePengajuan(int id);
        Task<ServiceResponse<DownloadFileDto>> DownloadFile(string file, int id);
        ServiceResponse<List<GetLinkUploadDto>> GetLinkUpload(string jenis);

        Task<ServiceResponse<string>> Upload(IFormFile file, string types);
        Task<ServiceResponse<string>> UploadFile(IFormFile file, string types, string nama_file, string path);
        ServiceResponse<GetPengajuanDto> GetResponse(ServiceResponse<string> cek);

        bool FolderExists(string path, bool create);
        bool FileExists(string path);
        Task<bool> NikPengajuanExists(string nik);
    }
}