using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using idcard.Data;
using idcard.Dtos;
using idcard.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace idcard.Services
{
    public class PengajuanService : IPengajuanService
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public PengajuanService(DataContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }
        private string _pathRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "file");
        private long maxSize = 500000;
        private DateTime _now = DateTime.Now;
        private DateTime _year = Convert.ToDateTime("1900-01-01");

        public async Task<ServiceResponse<List<GetPengajuanDto>>> GetAllPengajuan(int userId)
        {
            ServiceResponse<List<GetPengajuanDto>> response = new ServiceResponse<List<GetPengajuanDto>>();
            var user = await _context.Tb_user.Include(c => c.Struktur).ThenInclude(c => c.Akses).FirstOrDefaultAsync(c => c.Id == userId);
            var data = new List<Pengajuan>();
            var name_struktur = user.Struktur.nama_struktur.ToLower();
            if (user.Struktur.Akses.Akses_name.ToLower() == "vendor")
            {
                var vendor = await _context.Tb_vendor.FirstOrDefaultAsync(c => c.User == user);
                data = await _context.Tb_pengajuan.Where(c => c.Vendor == vendor).Include(c => c.Vendor).Include(c => c.Jenis)
                                .OrderByDescending(c => c.Id).Take(200).ToListAsync();
            }
            else if (name_struktur == "lock data pertamina" || name_struktur == "pegawai pertamina" || name_struktur == "pertamina")
            {
                var akun = await _context.Tb_akun.FirstOrDefaultAsync(c => c.User == user);
                if (akun.Nik == null)
                {
                    data = await _context.Tb_pengajuan.Include(c => c.Vendor).Include(c => c.Jenis)
                                .OrderByDescending(c => c.Id).Take(200).ToListAsync();
                }
                else
                {
                    data = await _context.Tb_pengajuan.Where(c => c.Nik == akun.Nik).Include(c => c.Vendor).Include(c => c.Jenis)
                                .OrderByDescending(c => c.Id).Take(200).ToListAsync();
                }
            }
            else
            {
                data = await _context.Tb_pengajuan.Include(c => c.Vendor).Include(c => c.Jenis)
                                .OrderByDescending(c => c.Id).Take(200).ToListAsync();
            }
            if (!data.Any())
            {
                response.Status = false;
                response.Message = "Data Pengajuan tidak ditemukan";
                return response;
            }
            var mapData = (data.Select(c => _mapper.Map<GetPengajuanDto>(c))).ToList();
            var exp = new List<GetPengajuanDto>();
            var n = 0;
            foreach (var item in mapData)
            {
                var idcard = _context.Tb_idcard.FirstOrDefault(c => c.Pengajuan == data[n]);
                var mapIdcard = _mapper.Map<GetIdCardDto>(idcard);
                var proses = _context.Tb_proses.Include(c => c.Next).OrderByDescending(c => c.Id)
                                                .FirstOrDefault(c => c.Pengajuan == data[n]);
                item.Proses = (proses == null || item.Status_pengajuan != "1" ? false : proses.Next == null ? true : false);
                if (idcard != null)
                {
                    var masa = idcard.Masa_berlaku;
                    mapIdcard.Expired = (masa == null ? false : masa.Year == _year.Year ? false : masa < _now.AddDays(40) ? true : false);
                    if (masa < _now && masa.Year != _year.Year)
                    {
                        exp.Add(item);
                    }
                }
                item.IdCard = mapIdcard;
                n++;
            }
            foreach (var items in exp)
            {
                mapData.Remove(items);
            }
            response.Data = mapData;
            response.Message = "List Data Pengajuan";
            return response;
        }
        public async Task<ServiceResponse<List<GetPengajuanDto>>> GetPengajuanByStatus(string status)
        {
            ServiceResponse<List<GetPengajuanDto>> response = new ServiceResponse<List<GetPengajuanDto>>();
            if (status == null && status != "0" && status != "1" && status != "2" && status != "3")
            {
                response.Status = false;
                response.Message = "Status tidak dikenali";
                return response;
            }
            var data = await _context.Tb_pengajuan
                            .Where(c => c.Status_pengajuan == status)
                            .OrderByDescending(c => c.Id).ToListAsync();
            if (!data.Any())
            {
                response.Status = false;
                response.Message = "Data Pengajuan tidak ditemukan";
                return response;
            }
            response.Data = (data.Select(c => _mapper.Map<GetPengajuanDto>(c))).ToList();
            response.Message = "List Data Pengajuan";
            return response;
        }

        public async Task<ServiceResponse<List<GetPengajuanDto>>> GetPengajuanByVendor(int vendorId)
        {
            ServiceResponse<List<GetPengajuanDto>> response = new ServiceResponse<List<GetPengajuanDto>>();
            var vendor = await _context.Tb_vendor.FirstOrDefaultAsync(c => c.Id == vendorId);
            if (vendor == null)
            {
                response.Status = false;
                response.Message = "Vendor tidak ditemukan";
                return response;
            }
            var data = await _context.Tb_pengajuan
                            .Where(c => c.Vendor == vendor).ToListAsync();
            if (!data.Any())
            {
                response.Status = false;
                response.Message = "Data Pengajuan tidak ditemukan";
                return response;
            }
            var mapData = (data.Select(c => _mapper.Map<GetPengajuanDto>(c))).ToList();
            var exp = new List<GetPengajuanDto>();
            var n = 0;
            foreach (var item in mapData)
            {
                var idcard = _context.Tb_idcard.FirstOrDefault(c => c.Pengajuan == data[n]);
                var mapIdcard = _mapper.Map<GetIdCardDto>(idcard);
                var proses = _context.Tb_proses.Include(c => c.Next).OrderByDescending(c => c.Id)
                                                .FirstOrDefault(c => c.Pengajuan == data[n]);
                item.Proses = (proses == null || item.Status_pengajuan != "1" ? false : proses.Next == null ? true : false);
                if (idcard != null)
                {
                    var masa = idcard.Masa_berlaku;
                    mapIdcard.Expired = (masa == null ? false : masa.Year == _year.Year ? false : masa < _now.AddDays(40) ? true : false);
                    if (masa < _now && masa.Year != _year.Year)
                    {
                        exp.Add(item);
                    }
                }
                item.IdCard = mapIdcard;
                n++;
            }
            foreach (var items in exp)
            {
                mapData.Remove(items);
            }
            response.Data = mapData;
            response.Message = "List Data Pengajuan";
            return response;
        }

        public async Task<ServiceResponse<GetPengajuanDto>> GetPengajuanById(int id)
        {
            ServiceResponse<GetPengajuanDto> response = new ServiceResponse<GetPengajuanDto>();
            var data = await _context.Tb_pengajuan.FirstOrDefaultAsync(c => c.Id == id);
            if (data == null)
            {
                response.Status = false;
                response.Message = "Data Pengajuan tidak ditemukan";
                return response;
            }
            var mapData = _mapper.Map<GetPengajuanDto>(data);
            var cekPeng = await _context.Tb_pengajuan.FirstOrDefaultAsync(c => c.Id == mapData.Id);
            var idcard = await _context.Tb_idcard.FirstOrDefaultAsync(c => c.Pengajuan == cekPeng);
            var proses = _context.Tb_proses.Include(c => c.Next).OrderByDescending(c => c.Id)
                                                .FirstOrDefault(c => c.Pengajuan == data);
            mapData.Proses = (proses == null || mapData.Status_pengajuan != "1" ? false : proses.Next == null ? true : false);

            var mapIdcard = _mapper.Map<GetIdCardDto>(idcard);
            if (idcard != null)
            {
                var masa = idcard.Masa_berlaku;
                mapIdcard.Expired = (masa == null ? false : masa.Year == _year.Year ? false : masa < _now.AddDays(40) ? true : false);
            }
            mapData.IdCard = mapIdcard;

            response.Data = mapData;
            response.Message = "Data Pengajuan";
            return response;
        }

        public async Task<ServiceResponse<GetPengajuanDto>> AddDataPengajuan(AddDataPengajuanDto req)
        {
            ServiceResponse<GetPengajuanDto> response = new ServiceResponse<GetPengajuanDto>();
            var vendor = await _context.Tb_vendor.FirstOrDefaultAsync(c => c.Id == req.VendorId);
            var jenis = await _context.Tb_jenis_pekerjaan.FirstOrDefaultAsync(c => c.Id == req.JenisId);
            if (vendor == null || jenis == null)
            {
                var nul = (vendor == null ? "Vendor" : "Jenis");
                response.Status = false;
                response.Message = "Data " + nul + " tidak ditemukan";
                return response;
            }
            var data = new Pengajuan();
            data.Nik = req.Nik;
            data.Nama_lengkap = req.Nama_lengkap;
            data.Alamat = req.Alamat;
            data.Tgl_pengajuan = req.Tgl_pengajuan;
            data.No_telp = req.No_telp;
            data.Status_pengajuan = "0";
            data.Keterangan = req.Keterangan;
            data.Sistem_created_time = DateTime.Now;
            data.Sistem_updated_time = Convert.ToDateTime("1900-01-01");
            data.Perpanjangan = (req.Perpanjangan == 0 ? false : true);
            data.Vendor = vendor;
            data.Tgl_lahir = (req.Tgl_lahir.Year == 0001 ? Convert.ToDateTime("1900-01-01") : req.Tgl_lahir);
            data.Jenis = jenis;
            try
            {
                await _context.Tb_pengajuan.AddAsync(data);
                await _context.SaveChangesAsync();
                response.Data = _mapper.Map<GetPengajuanDto>(data);
                response.Message = "Tambah Pengajuan Berhasil";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        public async Task<ServiceResponse<GetPengajuanDto>> AddFilePengajuanAdd(int id, IFormFile file, string jenis)
        {
            ServiceResponse<GetPengajuanDto> response = new ServiceResponse<GetPengajuanDto>();
            var data = await _context.Tb_pengajuan.FirstOrDefaultAsync(c => c.Id == id);
            var path = Path.Combine(_pathRoot, id.ToString());
            if (data == null || file == null)
            {
                response.Status = false;
                response.Message = (data == null ? "Data Pengajuan tidak ditemukan" : "File tidak terkirim");
                return response;
            }
            if (data.Status_pengajuan != "0")
            {
                response.Status = false;
                response.Message = "Data Pengajuan Dalam Proses, File tidak bisa diganti";
                return response;
            }
            if (jenis.ToLower() == "Surat_permohonan".ToLower())
            {
                var upload = await UploadFile(file, "pdf", jenis, path);
                response = GetResponse(upload);
                if (!response.Status) return response;
                if (data.Surat_permohonan != null)
                {
                    var filePath = Path.Combine(path, data.Surat_permohonan);
                    if (File.Exists(filePath)) File.Delete(filePath);
                }
                data.Surat_permohonan = upload.Data;
            }
            else if (jenis.ToLower() == "Surat_pernyataan".ToLower())
            {
                var upload = await UploadFile(file, "pdf", jenis, path);
                response = GetResponse(upload);
                if (!response.Status) return response;
                if (data.Surat_pernyataan != null)
                {
                    var filePath = Path.Combine(path, data.Surat_pernyataan);
                    if (File.Exists(filePath)) File.Delete(filePath);
                }
                data.Surat_pernyataan = upload.Data;
            }
            else if (jenis.ToLower() == "File_ktp".ToLower())
            {
                var upload = await UploadFile(file, "gambar", jenis, path);
                response = GetResponse(upload);
                if (!response.Status) return response;
                if (data.File_ktp != null)
                {
                    var filePath = Path.Combine(path, data.File_ktp);
                    if (File.Exists(filePath)) File.Delete(filePath);
                }
                data.File_ktp = upload.Data;
            }
            else if (jenis.ToLower() == "File_biodata".ToLower())
            {
                var upload = await UploadFile(file, "pdf", jenis, path);
                response = GetResponse(upload);
                if (!response.Status) return response;
                if (data.File_biodata != null)
                {
                    var filePath = Path.Combine(path, data.File_biodata);
                    if (File.Exists(filePath)) File.Delete(filePath);
                }
                data.File_biodata = upload.Data;
            }
            else if (jenis.ToLower() == "File_foto".ToLower())
            {
                var upload = await UploadFile(file, "gambar", jenis, path);
                response = GetResponse(upload);
                if (!response.Status) return response;
                if (data.File_foto != null)
                {
                    var filePath = Path.Combine(path, data.File_foto);
                    if (File.Exists(filePath)) File.Delete(filePath);
                }
                data.File_foto = upload.Data;
            }
            else if (jenis.ToLower() == "File_skck".ToLower())
            {
                var upload = await UploadFile(file, "pdf", jenis, path);
                response = GetResponse(upload);
                if (!response.Status) return response;
                if (data.File_skck != null)
                {
                    var filePath = Path.Combine(path, data.File_skck);
                    if (File.Exists(filePath)) File.Delete(filePath);
                }
                data.File_skck = upload.Data;
            }
            else if (jenis.ToLower() == "File_surat_sehat".ToLower())
            {
                var upload = await UploadFile(file, "pdf", jenis, path);
                response = GetResponse(upload);
                if (!response.Status) return response;
                if (data.File_surat_sehat != null)
                {
                    var filePath = Path.Combine(path, data.File_surat_sehat);
                    if (File.Exists(filePath)) File.Delete(filePath);
                }
                data.File_surat_sehat = upload.Data;
            }
            else if (jenis.ToLower() == "Surat_bebas_narkoba".ToLower())
            {
                var upload = await UploadFile(file, "pdf", jenis, path);
                response = GetResponse(upload);
                if (!response.Status) return response;
                if (data.Surat_bebas_narkoba != null)
                {
                    var filePath = Path.Combine(path, data.Surat_bebas_narkoba);
                    if (File.Exists(filePath)) File.Delete(filePath);
                }
                data.Surat_bebas_narkoba = upload.Data;
            }
            else if (jenis.ToLower() == "File_pendukung".ToLower())
            {
                var upload = await UploadFile(file, "pdf", jenis, path);
                response = GetResponse(upload);
                if (!response.Status) return response;
                if (data.File_pendukung != null)
                {
                    var filePath = Path.Combine(path, data.File_pendukung);
                    if (File.Exists(filePath)) File.Delete(filePath);
                }
                data.File_pendukung = upload.Data;
            }
            else
            {
                response.Status = false;
                response.Message = "Jenis File tidak diketahui";
                return response;
            }
            try
            {
                _context.Tb_pengajuan.Update(data);
                await _context.SaveChangesAsync();
                response.Data = _mapper.Map<GetPengajuanDto>(data);
                response.Message = "Upload file " + jenis + " berhasil";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }
            response.Status_code = 201;
            return response;
        }

        public ServiceResponse<List<GetLinkUploadDto>> GetLinkUpload(string type)
        {
            ServiceResponse<List<GetLinkUploadDto>> response = new ServiceResponse<List<GetLinkUploadDto>>();
            var data = new List<GetLinkUploadDto>();
            string link;
            var get = new AddPengajuanDto();
            int n = 1;
            string name;

            foreach (var item in get.GetType().GetProperties())
            {
                link = "api/pengajuan/file/" + item.Name;
                name = item.Name.Replace('_', ' ');
                string cek = item.Name;
                if (type == "pegawai")
                {
                    if (cek == "Surat_pernyataan" || cek == "File_foto" || cek == "File_pendukung")
                    {
                        name = (cek == "Surat_pernyataan" ? "SURAT MUTASI JABATAN" : cek == "File_foto" ? "FILE FOTO(Wajib Berseragam Dasi/Scarf)(jpg,png,jpeg)" : "FILE PENDUKUNG(Scan Id Card Lama)");
                        data.Add(new GetLinkUploadDto { Id = n, jenis = name, link = link });
                        n++;
                    }
                }
                else
                {
                    name = name + (cek == "File_ktp" || cek == "File_foto"? "(jpeg,jpg,png)" : "(pdf)");
                    // if (cek == "File_ktp" || cek == "File_foto")
                    // {
                    //     name = name + "(jpeg,jpg,png)";
                    // }
                    // else
                    // {
                    //     name = name + "(pdf)";
                    // }
                    data.Add(new GetLinkUploadDto { Id = n, jenis = name.ToUpper(), link = link });
                    n++;
                }

            }
            response.Data = data;
            response.Message = "List Link Upload File";
            return response;
        }

        public async Task<ServiceResponse<GetPengajuanDto>> DeletePengajuan(int id)
        {
            ServiceResponse<GetPengajuanDto> response = new ServiceResponse<GetPengajuanDto>();
            var data = await _context.Tb_pengajuan.FirstOrDefaultAsync(c => c.Id == id);
            if (data == null)
            {
                response.Status = false;
                response.Message = "Data Pengajuan tidak ditemukan";
                return response;
            }
            try
            {
                var del_proses = await _context.Tb_proses.Where(c => c.Pengajuan == data).ToListAsync();
                foreach (var del in del_proses)
                {
                    _context.Tb_proses.Remove(del);
                    await _context.SaveChangesAsync();
                }
                foreach (var item in data.GetType().GetProperties())
                {
                    var name = item.GetValue(data, null);
                    if (name != null)
                    {
                        var path = Path.Combine(_pathRoot, id.ToString(), name.ToString());
                        if (File.Exists(path))
                        {
                            File.Delete(path);
                        }
                    }
                }
                _context.Tb_pengajuan.Remove(data);
                await _context.SaveChangesAsync();
                response.Data = _mapper.Map<GetPengajuanDto>(data);
                response.Message = "Data Pengajuan Berhasil dihapus";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        public async Task<ServiceResponse<DownloadFileDto>> DownloadFile(string file, int id)
        {
            ServiceResponse<DownloadFileDto> response = new ServiceResponse<DownloadFileDto>();
            var data = new DownloadFileDto();
            data.PathRoot = Path.Combine(_pathRoot, id.ToString());
            var pengajuan = await _context.Tb_pengajuan.FirstOrDefaultAsync(c => c.Id == id);
            if (pengajuan == null)
            {
                response.Status = false;
                response.Message = "Data Pengajuan tidak ditemukan";
                return response;
            }
            var stat = false;
            foreach (var item in pengajuan.GetType().GetProperties())
            {
                if (item.Name.ToLower() == file.ToLower())
                {
                    var name = item.GetValue(pengajuan, null);
                    data.FileName = (name == null ? "" : name.ToString());
                    stat = true;
                }
                if (stat)
                {
                    break;
                }
            }
            if (data.FileName == null)
            {
                response.Status = false;
                response.Message = "Jenis File tidak sesuai / File tidak ditemukan";
                return response;
            }
            var path = Path.Combine(data.PathRoot, data.FileName);
            if (!File.Exists(path))
            {
                response.Status = false;
                response.Message = "Jenis File tidak sesuai / File tidak ditemukan";
            }
            response.Data = data;
            return response;
        }


        //--------------------------Section function--------------------------//
        public async Task<ServiceResponse<string>> Upload(IFormFile file, string types)
        {
            ServiceResponse<string> ret = new ServiceResponse<string>();
            var path = _pathRoot;
            var name = "tes";
            FolderExists(path, true);
            if (file.Length > 0)
            {
                var ext = Path.GetExtension(file.FileName);
                if (!Checked(types, ext))
                {
                    ret.Status = false;
                    ret.Message = "File harus berjenis " + types;

                    return ret;
                }
                var filePath = Path.Combine(path, name + ext);
                try
                {
                    await using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        file.CopyTo(fileStream);
                    }
                }
                catch (Exception ex)
                {
                    ret.Status = false;
                    ret.Message = ex.Message;
                }

                ret.Message = "Berhasil Upload File";
                ret.Data = name + ext;
            }
            else if (file.Length > maxSize)
            {
                ret.Status = false;
                ret.Message = "Ukuran terlalu besar, Maks 3mb";
            }
            else
            {
                ret.Message = "File Belum dipilih";
            }
            return ret;
        }

        public async Task<ServiceResponse<string>> UploadFile(IFormFile file, string types, string nama_file, string path)
        {
            ServiceResponse<string> ret = new ServiceResponse<string>();
            var name = nama_file + "_" + DateTime.Now.ToString("yyyy-MM-dd_HH.mm.ss");
            FolderExists(path, true);
            var size = "";
            if (file.Length > 0 && file.Length < maxSize)
            {
                var ext = Path.GetExtension(file.FileName);
                size = SizeConverter(file.Length);
                if (!Checked(types, ext))
                {
                    ret.Status = false;
                    ret.Message = "File " + nama_file + " harus berjenis " + types;
                    return ret;
                }
                var filePath = Path.Combine(path, name + ext);
                try
                {
                    await using (var fileStream = new FileStream(filePath, FileMode.Create))
                    {
                        file.CopyTo(fileStream);
                    }
                }
                catch (Exception ex)
                {
                    ret.Status = false;
                    ret.Message = ex.Message;
                }

                ret.Message = "Berhasil Upload File, Ukuran File: " + size;
                ret.Data = name + ext;
            }
            else if (file.Length > maxSize)
            {
                size = SizeConverter(file.Length);
                ret.Status = false;
                ret.Message = "Ukuran terlalu besar, Maks " + SizeConverter(maxSize) + ", Ukuran File: " + size;
            }
            else
            {
                ret.Message = "File Belum dipilih";
            }
            return ret;
        }

        public bool FolderExists(string path, bool create)
        {
            if (Directory.Exists(path))
            {
                return true;
            }
            else
            {
                if (create)
                {
                    Directory.CreateDirectory(path);
                    return true;
                }
                else
                {
                    return false;
                }
            }
        }

        public bool FileExists(string path)
        {
            var pathFile = Path.Combine(_pathRoot, path);
            return (File.Exists(pathFile));
        }

        public async Task<bool> NikPengajuanExists(string nik)
        {
            var cek = await _context.Tb_pengajuan.FirstOrDefaultAsync(c => c.Nik == nik && c.Status_pengajuan != "4");
            if (cek == null)
            {
                return false;
            }
            return true;
        }

        private bool Checked(string type, string ext)
        {
            string cek;
            var gambar = new string[] { ".png", ".jpg", ".jpeg" };
            var file = new string[] { ".pdf" };
            if (type.ToLower() == "gambar")
            {
                cek = Array.Find(gambar, c => c == ext);
                return (cek == null ? false : true);
            }
            else if (type.ToLower() == "pdf")
            {
                cek = Array.Find(file, c => c == ext);
                return (cek == null ? false : true);
            }
            else
            {
                return false;
            }
        }

        public ServiceResponse<GetPengajuanDto> GetResponse(ServiceResponse<string> cek)
        {
            ServiceResponse<GetPengajuanDto> response = new ServiceResponse<GetPengajuanDto>();
            if (!cek.Status)
            {
                response.Status = cek.Status;
                response.Message = cek.Message;
            }
            return response;
        }
        private static string SizeConverter(long bytes)
        {
            var fileSize = new decimal(bytes);
            var kilobyte = new decimal(1024);
            var megabyte = new decimal(1024 * 1024);
            var gigabyte = new decimal(1024 * 1024 * 1024);

            switch (fileSize)
            {
                case var _ when fileSize < kilobyte:
                    return $"Less then 1KB";
                case var _ when fileSize < megabyte:
                    return $"{Math.Round(fileSize / kilobyte, 0, MidpointRounding.AwayFromZero):##,###.##}KB";
                case var _ when fileSize < gigabyte:
                    return $"{Math.Round(fileSize / megabyte, 2, MidpointRounding.AwayFromZero):##,###.##}MB";
                case var _ when fileSize >= gigabyte:
                    return $"{Math.Round(fileSize / gigabyte, 2, MidpointRounding.AwayFromZero):##,###.##}GB";
                default:
                    return "n/a";
            }
        }
    }
}