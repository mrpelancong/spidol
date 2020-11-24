using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using idcard.Data;
using idcard.Dtos;
using idcard.Models;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;

namespace idcard.Services
{
    public class UserService : IUserService
    {
        private readonly IMapper _mapper;
        private readonly DataContext _context;
        private readonly IActionContextAccessor _accessor;

        public UserService(DataContext context, IMapper mapper, IActionContextAccessor accessor)
        {
            _accessor = accessor;
            _context = context;
            _mapper = mapper;
        }
        public async Task<ServiceResponse<GetLoginDto>> AddUser(AddUserDto req)
        {
            var response = new ServiceResponse<GetLoginDto>();
            var jenis = req.Jenis.ToLower();
            if (jenis != "user" && jenis != "vendor")
            {
                response.Status = false;
                response.Message = "Jenis User Salah";
                return response;
            }
            if (jenis == "user")
            {
                if (await UseStructExists(req.StrukturId, req.WilayahId))
                {
                    response.Status = false;
                    response.Message = "Struktur sudah digunakan / tidak ditemukan ";
                    return response;
                }
            }
            ServiceResponse<int> userId = await InsertUser(req.Username, req.Password, req.StrukturId, req.WilayahId);
            if (!userId.Status)
            {
                response.Status = false;
                response.Message = userId.Message;
                return response;
            }
            var user = await _context.Tb_user.FirstOrDefaultAsync(c => c.Id == userId.Data);
            var akun = new Akun();
            var vendor = new Vendor();
            if (jenis == "user")
            {
                akun.nama_lengkap = req.Nama_lengkap;
                akun.Nik = req.Nik;
                akun.No_telp = req.No_telp;
                akun.Alamat = req.Alamat;
                akun.Sistem_created_time = DateTime.Now;
                akun.Sistem_updated_time = Convert.ToDateTime("1900-01-01");
                akun.User = user;
            }
            else if (jenis == "vendor")
            {
                vendor.Nama_vendor = req.Nama_vendor;
                vendor.No_telp = req.No_telp;
                vendor.No_telp_pj = req.No_telp_pj;
                vendor.Penanggung_jawab = req.Penanggung_jawab;
                vendor.Alamat_vendor = req.Alamat_vendor;
                vendor.Sistem_created_time = DateTime.Now;
                vendor.Sistem_updated_time = Convert.ToDateTime("1900-01-01");
                vendor.User = user;
            }
            try
            {
                if (jenis == "user")
                {
                    await _context.Tb_akun.AddAsync(akun);
                    await _context.SaveChangesAsync();
                }
                else if (jenis == "vendor")
                {
                    await _context.Tb_vendor.AddAsync(vendor);
                    await _context.SaveChangesAsync();
                }
                var res = new GetLoginDto();
                res.Id = userId.Data;
                res.Username = req.Username;
                res.nama_lengkap = (req.Nama_lengkap == null ? req.Penanggung_jawab : req.Nama_lengkap);
                res.Nik = akun.Nik;
                res.Alamat = akun.Alamat;
                res.No_telp = akun.No_telp;
                res.Struktur = req.StrukturId;
                if (vendor != null)
                {
                    res.Vendor = _mapper.Map<GetVendorDto>(vendor);
                }
                response.Data = res;
                response.Message = "Berhasil Tambah User";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
                return response;
            }
            return response;
        }

        public async Task<ServiceResponse<int>> InsertUser(string username, string password, int strukturId, int wilayahId)
        {
            ServiceResponse<int> response = new ServiceResponse<int>();
            var wilayah = await _context.Tb_wilayah.FirstOrDefaultAsync(u => u.Id == wilayahId);
            if (await UserExists(username) || wilayah == null)
            {
                response.Status = false;
                response.Message = (wilayah == null ? "Wilayah tidak ditemukan" : "Username sudah digunakan, silahkan masukan username lain");
                return response;
            }

            User user = new User();
            CreatePasswordHash(password, out byte[] passwordHash, out byte[] passwordSalt);
            user.Username = username;
            user.PasswordHash = passwordHash;
            user.PasswordSalt = passwordSalt;
            user.Sistem_created_time = DateTime.Now;
            user.Sistem_updated_time = Convert.ToDateTime("1900-01-01 00:00:18.529645+07:00");
            user.Sistem_ip_create = _accessor.ActionContext.HttpContext.Connection.RemoteIpAddress.ToString();
            user.Struktur = await _context.Tb_struktur.FirstOrDefaultAsync(u => u.Id == strukturId);
            user.Wilayah = wilayah;
            try
            {
                await _context.Tb_user.AddAsync(user);
                await _context.SaveChangesAsync();
                response.Data = user.Id;
                response.Message = "User Berhasil Di daftarkan";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }

            return response;
        }

        public async Task<ServiceResponse<List<GetAkunDto>>> GetAllUser(int id)
        {
            var response = new ServiceResponse<List<GetAkunDto>>();
            var data = new List<Akun>();
            if (id > 0)
            {
                data = await _context.Tb_akun.Where(c => c.Id == id && !c.User.Struktur.Akses.Akses_name.Contains("pegawai"))
                                        .Include(c => c.User).ThenInclude(c => c.Wilayah)
                                        .Include(c => c.User).ThenInclude(c => c.Struktur)
                                        .ThenInclude(c => c.Akses).ToListAsync();
            }
            else
            {
                data = await _context.Tb_akun.Where(c => !c.User.Struktur.Akses.Akses_name.Contains("pegawai"))
                                        .Include(c => c.User).ThenInclude(c => c.Wilayah)
                                        .Include(c => c.User).ThenInclude(c => c.Struktur)
                                        .ThenInclude(c => c.Akses).ToListAsync();
            }
            response.Data = (data.Select(c => _mapper.Map<GetAkunDto>(c))).ToList();
            if (!data.Any())
            {
                response.Status = false;
                response.Message = "Data Tidak ditemukan";
                return response;
            }
            response.Message = "List User";
            return response;
        }

        public async Task<ServiceResponse<List<GetAkunDto>>> GetPegawai(int id)
        {
            var response = new ServiceResponse<List<GetAkunDto>>();
            var data = new List<Akun>();
            if (id > 0)
            {
                data = await _context.Tb_akun
                                        .Where(c => c.Id == id && c.User.Struktur.Akses.Akses_name.Contains("pegawai"))
                                        .Include(c => c.User).ThenInclude(c => c.Wilayah)
                                        .Include(c => c.User).ThenInclude(c => c.Struktur)
                                        .ThenInclude(c => c.Akses).ToListAsync();
            }
            else
            {
                data = await _context.Tb_akun.Where(c => c.User.Struktur.Akses.Akses_name.Contains("pegawai"))
                                        .Include(c => c.User).ThenInclude(c => c.Wilayah)
                                        .Include(c => c.User).ThenInclude(c => c.Struktur)
                                        .ThenInclude(c => c.Akses).ToListAsync();
            }
            response.Data = (data.Select(c => _mapper.Map<GetAkunDto>(c))).ToList();
            if (!data.Any())
            {
                response.Status = false;
                response.Message = "Data Tidak ditemukan";
                return response;
            }
            response.Message = "List User";
            return response;
        }

        public async Task<ServiceResponse<List<GetVendorDto>>> GetAllVendor()
        {
            ServiceResponse<List<GetVendorDto>> response = new ServiceResponse<List<GetVendorDto>>();
            var data = await _context.Tb_vendor
                                .Include(c => c.User).ThenInclude(c => c.Wilayah)
                                .Include(c => c.User).ThenInclude(c => c.Struktur).ThenInclude(c => c.Akses)
                                .ToListAsync();
            if (!data.Any())
            {
                response.Status = false;
                response.Message = "Data Vendor tidak ditemukan / Kosong";
                return response;
            }
            response.Data = (data.Select(c => _mapper.Map<GetVendorDto>(c))).ToList();
            response.Message = "List Vendor";
            return response;
        }

        public async Task<ServiceResponse<GetVendorDto>> GetVendorById(int id)
        {
            ServiceResponse<GetVendorDto> response = new ServiceResponse<GetVendorDto>();
            var data = await _context.Tb_vendor
                                        .Include(c => c.User).ThenInclude(c => c.Wilayah)
                                        .Include(c => c.User).ThenInclude(c => c.Struktur)
                                        .ThenInclude(c => c.Akses).FirstOrDefaultAsync(c => c.Id == id);
            if (data == null)
            {
                response.Status = false;
                response.Message = "Data Vendor tidak ditemukan";
                return response;
            }
            response.Data = _mapper.Map<GetVendorDto>(data);
            response.Message = "List Vendor";
            return response;
        }

        public async Task<ServiceResponse<GetVendorDto>> UpdateVendor(UpdateVendorDto req)
        {
            ServiceResponse<GetVendorDto> response = new ServiceResponse<GetVendorDto>();
            var data = await _context.Tb_vendor.FirstOrDefaultAsync(c => c.Id == req.Id);
            if (data == null)
            {
                response.Status = false;
                response.Message = "Data Vendor tidak ditemukan";
                return response;
            }
            data.Nama_vendor = req.Nama_vendor;
            data.Alamat_vendor = req.Alamat_vendor;
            data.No_telp = req.No_telp;
            data.Penanggung_jawab = req.Penanggung_jawab;
            data.No_telp_pj = req.No_telp_pj;
            try
            {
                _context.Tb_vendor.Update(data);
                await _context.SaveChangesAsync();
                response.Data = _mapper.Map<GetVendorDto>(data);
                response.Message = "Berhasil Update Vendor";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        public async Task<ServiceResponse<GetVendorDto>> DeleteVendor(int id)
        {
            ServiceResponse<GetVendorDto> response = new ServiceResponse<GetVendorDto>();
            var data = await _context.Tb_vendor.Include(c => c.User).FirstOrDefaultAsync(c => c.Id == id);
            if (data == null)
            {
                response.Status = false;
                response.Message = "Data Vendor tidak ditemukan";
                return response;
            }
            try
            {
                _context.Tb_vendor.Remove(data);
                await _context.SaveChangesAsync();
                if (data.User != null)
                {
                    _context.Tb_user.Remove(data.User);
                    await _context.SaveChangesAsync();
                }
                response.Data = _mapper.Map<GetVendorDto>(data);
                response.Message = "Berhasil Update Vendor";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }
        public async Task<ServiceResponse<GetAkunDto>> DeleteAkun(int id)
        {
            ServiceResponse<GetAkunDto> response = new ServiceResponse<GetAkunDto>();
            var data = await _context.Tb_akun.Include(c => c.User).FirstOrDefaultAsync(c => c.Id == id);
            if (data == null)
            {
                response.Status = false;
                response.Message = "Data Akun tidak ditemukan";
                return response;
            }
            try
            {
                _context.Tb_akun.Remove(data);
                await _context.SaveChangesAsync();
                if (data.User != null)
                {
                    _context.Tb_user.Remove(data.User);
                    await _context.SaveChangesAsync();
                }
                response.Data = _mapper.Map<GetAkunDto>(data);
                response.Message = "Berhasil Update Akun";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        public async Task<bool> UserExists(string username)
        {
            if (await _context.Tb_user.AnyAsync(x => x.Username.ToLower() == username.ToLower()))
            {
                return true;
            }
            return false;
        }

        public async Task<bool> UseStructExists(int strukturId, int wilayahId)
        {
            var struktur = await _context.Tb_struktur.FirstOrDefaultAsync(x => x.Id == strukturId);
            var wilayah = await _context.Tb_wilayah.FirstOrDefaultAsync(x => x.Id == wilayahId);
            if (struktur == null || wilayah == null) return true;

            var cek = await _context.Tb_user.Where(x => x.Struktur == struktur && x.Wilayah == wilayah).Include(c => c.Struktur).ThenInclude(c => c.Akses).FirstOrDefaultAsync();
            if (cek == null)
            {
                return false;
            }
            if (cek.Struktur.Akses.Akses_name.ToLower() == "admin" || cek.Struktur.Akses.Akses_name.ToLower() == "pegawai")
            {
                return false;
            }
            return true;
        }

        public void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            }
        }

    }
}