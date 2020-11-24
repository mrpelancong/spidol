using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using idcard.Dtos;
using idcard.Models;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace idcard.Data
{
    public class AuthRepository : IAuthRepository
    {
        private readonly IConfiguration _configuration;
        private readonly IMapper _mapper;
        private readonly DataContext _context;
        private readonly IActionContextAccessor _accessor;
        public AuthRepository(DataContext context, IMapper mapper, IConfiguration configuration, IActionContextAccessor accessor)
        {
            _accessor = accessor;
            _context = context;
            _mapper = mapper;
            _configuration = configuration;

        }
        public async Task<ServiceResponse<GetLoginDto>> Login(string username, string password)
        {
            ServiceResponse<GetLoginDto> response = new ServiceResponse<GetLoginDto>();
            GetLoginDto res = new GetLoginDto();
            User user = await _context.Tb_user.Include(c => c.Wilayah).Include(c => c.Struktur).ThenInclude(d => d.Akses).FirstOrDefaultAsync(x => x.Username.ToLower().Equals(username.ToLower()));
            if (user == null)
            {
                response.Status = false;
                response.Message = "User Tidak Ditemukan";
            }
            else if (!VerifyPasswordHash(password, user.PasswordHash, user.PasswordSalt))
            {
                response.Status = false;
                response.Message = "Password Salah";
            }
            else
            {
                var akun = await _context.Tb_akun.FirstOrDefaultAsync(c => c.User == user);
                if (akun == null)
                {
                    var vendor = await _context.Tb_vendor.FirstOrDefaultAsync(c => c.User == user);
                    if (vendor != null)
                    {
                        res.Vendor = _mapper.Map<GetVendorDto>(vendor);
                        res.nama_lengkap = vendor.Nama_vendor;
                    }
                }
                else
                {
                    res.nama_lengkap = akun.nama_lengkap;
                    res.Nik = akun.Nik;
                    res.Alamat = akun.Alamat;
                    res.No_telp = akun.No_telp;
                }
                res.Id = user.Id;
                res.Username = username;
                res.Struktur = user.Struktur.Id;
                res.Akses = user.Struktur.Akses.Id;
                res.Akses_name = user.Struktur.Akses.Akses_name;
                res.Token = CreateToken(user);
                res.Wilayah = _mapper.Map<GetWilayahDto>(user.Wilayah);

                response.Data = res;
                response.Message = "Berhasil Login";
            }
            return response;
        }

        public async Task<ServiceResponse<string>> Register(string username, string password, string nama, int struktur)
        {
            ServiceResponse<string> response = new ServiceResponse<string>();
            if (username == null || password == null || struktur == 0 || nama == null)
            {
                response.Status = false;
                response.Message = "Tidak ada data yang dikirim";
                return response;
            }
            User user = new User();
            if (await UserExists(username))
            {
                response.Status = false;
                response.Message = "User Already Exists";
                return response;
            }
            CreatePasswordHash(password, out byte[] passwordHash, out byte[] passwordSalt);
            user.Username = username;
            user.PasswordHash = passwordHash;
            user.PasswordSalt = passwordSalt;
            user.Sistem_created_time = DateTime.Now;
            user.Sistem_updated_time = Convert.ToDateTime("1900-01-01");
            user.Sistem_ip_create = _accessor.ActionContext.HttpContext.Connection.RemoteIpAddress.ToString();
            user.Struktur = await _context.Tb_struktur.FirstOrDefaultAsync(u => u.Id == struktur);

            var akun = new Akun();
            akun.nama_lengkap = nama;
            akun.Sistem_created_time = DateTime.Now;
            akun.Sistem_updated_time = Convert.ToDateTime("1900-01-01");
            try
            {
                await _context.Tb_user.AddAsync(user);
                await _context.SaveChangesAsync();
                akun.User = user;
                await _context.Tb_akun.AddAsync(akun);
                await _context.SaveChangesAsync();
                response.Data = user.Username;
                response.Message = "Berhasil Menambahkan User";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }

            return response;
        }

        public async Task<ServiceResponse<string>> ChangePassword(string username, string password)
        {
            ServiceResponse<string> response = new ServiceResponse<string>();
            var data = await _context.Tb_user.FirstOrDefaultAsync(c => c.Username == username);
            if (data == null || password == null)
            {
                response.Status = false;
                response.Message = (password == null ? "Isi semua inputan" : "Data user tidak ditemukan");
                return response;
            }
            CreatePasswordHash(password, out byte[] passwordHash, out byte[] passwordSalt);
            data.PasswordHash = passwordHash;
            data.PasswordSalt = passwordSalt;
            data.Sistem_updated_time = DateTime.Now;
            data.Sistem_ip_create = _accessor.ActionContext.HttpContext.Connection.RemoteIpAddress.ToString();
            try
            {
                _context.Tb_user.Update(data);
                await _context.SaveChangesAsync();
                response.Data = data.Username;
                response.Message = "Berhasil Ganti Password";
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

        public void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            }
        }

        private bool VerifyPasswordHash(string password, byte[] passwordHash, byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512(passwordSalt))
            {
                var computeHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
                for (int i = 0; i < computeHash.Length; i++)
                {
                    if (computeHash[i] != passwordHash[i])
                    {
                        return false;
                    }
                }
                return true;
            }
        }

        private string CreateToken(User user)
        {
            List<Claim> claim = new List<Claim>
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
            };

            SymmetricSecurityKey key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration.GetSection("AppSettings:Token").Value)
            );
            SigningCredentials creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256Signature);
            SecurityTokenDescriptor tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(claim),
                Expires = DateTime.Now.AddDays(1),
                SigningCredentials = creds
            };

            JwtSecurityTokenHandler tokenHandler = new JwtSecurityTokenHandler();
            SecurityToken token = tokenHandler.CreateToken(tokenDescriptor);

            return tokenHandler.WriteToken(token);
        }
    }
}