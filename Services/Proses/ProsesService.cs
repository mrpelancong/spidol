using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using AutoMapper;
using idcard.Data;
using idcard.Dtos;
using idcard.Models;
using Microsoft.EntityFrameworkCore;

namespace idcard.Services
{
    public class ProsesService : IProsesService
    {
        private readonly IMapper _mapper;
        private readonly DataContext _context;
        public ProsesService(DataContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }


        private string status_pengajuan = "0";

        //delete soon
        public async Task<ServiceResponse<List<GetPengajuanDto>>> ListAdmin(int id)
        {
            ServiceResponse<List<GetPengajuanDto>> response = new ServiceResponse<List<GetPengajuanDto>>();
            var data = new List<Pengajuan>();
            if (id > 0)
            {
                data = await _context.Tb_pengajuan.Include(c => c.Vendor).Include(c => c.Jenis)
                                .ThenInclude(c => c.Akses)
                                .Where(c => c.Status_pengajuan == status_pengajuan && c.Id == id)
                                .ToListAsync();
            }
            else
            {
                data = await _context.Tb_pengajuan.Include(c => c.Vendor).Include(c => c.Jenis)
                                .ThenInclude(c => c.Akses)
                                .Where(c => c.Status_pengajuan == status_pengajuan)
                                .ToListAsync();
            }
            if (!data.Any())
            {
                response.Status = false;
                response.Message = "Pengajuan tidak ditemukan";
                return response;
            }
            response.Data = (data.Select(c => _mapper.Map<GetPengajuanDto>(c))).ToList();
            response.Message = "List Pengajuan Id Card";
            return response;
        }

        public async Task<ServiceResponse<GetProsesDto>> ProsesSend(int id, int userId)
        {
            ServiceResponse<GetProsesDto> response = new ServiceResponse<GetProsesDto>();
            var data = await _context.Tb_pengajuan.Include(c => c.Vendor).Include(c => c.Jenis)
                                .ThenInclude(c => c.Akses)
                                .Where(c => c.Status_pengajuan == status_pengajuan)
                                .FirstOrDefaultAsync(c => c.Id == id);
            var user = await _context.Tb_user
                                    .Include(c => c.Struktur).ThenInclude(c => c.Akses)
                                    .Include(c => c.Wilayah).FirstOrDefaultAsync(c => c.Id == userId);
            if (data == null || user == null)
            {
                response.Status = false;
                response.Message = (data == null ? "Pengajuan tidak ditemukan" : "User tidak ditemukan");
                return response;
            }
            data.Sistem_updated_time = DateTime.Now;
            data.Status_pengajuan = "1";

            var jenis = user.Struktur.Akses.Akses_name.ToLower() == "pegawai" || user.Wilayah.Id == 1 ? "admin" : "spv";

            var proses = new Proses();
            proses.Status_proses = "1";
            proses.Tanggal_proses = DateTime.Now;
            proses.Pengajuan = data;
            proses.User = user;

            if (jenis == "spv")
            {
                var struktur = await _context.Tb_struktur
                                        .FirstOrDefaultAsync(c => c.Akses.Akses_name.Contains("Supervisor"));
                var next = new User();
                if (struktur != null)
                {
                    next = await _context.Tb_user.FirstOrDefaultAsync(c => c.Struktur == struktur && c.Wilayah == user.Wilayah);
                }
                if (next == null)
                {
                    response.Status = false;
                    response.Message = "User Pimpinan tidak ditemukan";
                    return response;
                }
                proses.Next = next;
            }

            try
            {
                _context.Tb_pengajuan.Update(data);
                await _context.SaveChangesAsync();
                await _context.Tb_proses.AddAsync(proses);
                await _context.SaveChangesAsync();
                response.Data = _mapper.Map<GetProsesDto>(proses);
                response.Message = "Pengajuan berhasil diteruskan";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }
            return response;
        }

        public async Task<ServiceResponse<List<GetProsesDto>>> ListProses(int userId, int id)
        {
            ServiceResponse<List<GetProsesDto>> response = new ServiceResponse<List<GetProsesDto>>();
            var user = await _context.Tb_user.FirstOrDefaultAsync(c => c.Id == userId);
            var data = new List<Proses>();
            if (id > 0)
            {
                var pengajuan = await _context.Tb_pengajuan.Include(c => c.Vendor).Include(c => c.Jenis)
                                .ThenInclude(c => c.Akses).FirstOrDefaultAsync(c => c.Id == id);
                if (pengajuan == null)
                {
                    response.Status = false;
                    response.Message = "Data Pengajuan tidak ada";
                    return response;
                }
                data = await _context.Tb_proses.Include(c => c.Pengajuan).ThenInclude(c => c.Vendor)
                                        .Where(c => c.Next == user && c.Status_proses == "1" && c.Pengajuan == pengajuan).ToListAsync();
            }
            else
            {
                data = await _context.Tb_proses.Include(c => c.Pengajuan).ThenInclude(c => c.Vendor)
                                        .Where(c => c.Next == user && c.Status_proses == "1").Include(c => c.Pengajuan).ToListAsync();
            }
            if (!data.Any())
            {
                response.Status = false;
                response.Message = "Data Pengajuan tidak ada";
                return response;
            }
            response.Data = (data.Select(c => _mapper.Map<GetProsesDto>(c))).ToList();
            return response;
        }

        public async Task<ServiceResponse<List<GetProsesDto>>> ListProsesHistory(int userId)
        {
            ServiceResponse<List<GetProsesDto>> response = new ServiceResponse<List<GetProsesDto>>();
            var n = 0;
            var user = await _context.Tb_user.FirstOrDefaultAsync(c => c.Id == userId);
            var data = await _context.Tb_proses.Include(c => c.Pengajuan).ThenInclude(c => c.Vendor)
                                        .Where(c => c.Next == user).ToListAsync();

            if (!data.Any())
            {
                response.Status = false;
                response.Message = "Data History Proses tidak ada";
                return response;
            }

            var mapData = (data.Select(c => _mapper.Map<GetProsesDto>(c))).ToList();

            foreach (var item in mapData)
            {
                var status = item.Pengajuan.Status_pengajuan;
                item.Posisi = status == "1" ? "Proses" : status == "2" ? "Id Card Telah terbit" : "Pengajuan Ditolak";
                var idcard = await _context.Tb_idcard.FirstOrDefaultAsync(c => c.Pengajuan == data[n].Pengajuan);
                if (idcard != null && status == "2")
                {
                    if (idcard.Masa_berlaku < DateTime.Now) item.Posisi = "Expired";
                }
                n++;
            }
            response.Data = mapData;
            response.Message = "List History Proses";
            return response;
        }

        public async Task<ServiceResponse<GetProsesDto>> ProsesAcc(int id, string status, string catatan, int userId)
        {
            ServiceResponse<GetProsesDto> response = new ServiceResponse<GetProsesDto>();
            var peng = await _context.Tb_pengajuan.FirstOrDefaultAsync(c => c.Id == id);
            var user = await _context.Tb_user.Include(c => c.Wilayah).Include(c => c.Struktur).ThenInclude(c => c.Akses)
                                .FirstOrDefaultAsync(c => c.Id == userId);

            var data = await _context.Tb_proses.Include(c => c.Pengajuan)
                                .Where(c => c.Next == user && c.Status_proses == "1")
                                .FirstOrDefaultAsync(c => c.Pengajuan == peng);
            if (data == null || user == null || (status != "0" && status != "1"))
            {
                response.Status = false;
                response.Message = (data == null ? "Pengajuan tidak ditemukan" :
                                    (user == null ? "User tidak ditemukan" : "Status Salah"));
                return response;
            }
            var proses = new Proses();
            proses.Status_proses = status;
            proses.Tanggal_proses = DateTime.Now;
            proses.Pengajuan = data.Pengajuan;
            proses.User = user;
            if (status == "0") proses.Catatan = catatan;

            try
            {
                data.Status_proses = "2";
                await _context.Tb_proses.AddAsync(proses);
                await _context.SaveChangesAsync();

                _context.Tb_proses.Update(data);
                await _context.SaveChangesAsync();

                response.Data = _mapper.Map<GetProsesDto>(data);
                response.Message = "Proses " + (status == "0" ? "Tolak" : "Acc") + " Berhasil";
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }

            return response;
        }

        public async Task<ServiceResponse<string>> AddNumber(int id, int nomor, DateTime masa, string status, string catatan, int userId)
        {
            var response = new ServiceResponse<string>();
            var pengajuan = await _context.Tb_pengajuan.Include(c => c.Vendor).FirstOrDefaultAsync(c => c.Id == id && c.Status_pengajuan == "1");
            var user = await _context.Tb_user.FirstOrDefaultAsync(c => c.Id == userId);
            var idcard = new Idcard();
            if (pengajuan == null || (status != "0" && status != "1"))
            {
                response.Status = false;
                response.Message = (pengajuan == null ? "Pengajuan tidak ditemukan" : "Status Salah");
                return response;
            }
            DateTime masaAuto = Convert.ToDateTime((DateTime.Now.Year + 1).ToString() + '-' + pengajuan.Tgl_lahir.Month.ToString() + '-' + pengajuan.Tgl_lahir.Day.ToString());

            masa = masa.Year == 00001 ? masaAuto : masa;
            if (status == "1")
            {
                if (nomor == 0 || await NomorExists(nomor))
                {
                    response.Status = false;
                    response.Message = (nomor == 0 ? "inputan tidak lengkap" : "Nomor Id Card sudah Digunakan");
                    return response;
                }
            }
            var data = await _context.Tb_idcard.FirstOrDefaultAsync(c => c.Pengajuan == pengajuan);
            var proses = await _context.Tb_proses.OrderByDescending(c => c.Id).FirstOrDefaultAsync(c => c.Pengajuan == pengajuan);
            if (data == null)
            {
                idcard.Nik = pengajuan.Nik;
                idcard.Nomor_idcard = nomor;
                idcard.Masa_berlaku = masa;
                idcard.Status = false;
                idcard.Pengajuan = pengajuan;
                idcard.Sistem_created_time = DateTime.Now;
                idcard.Tanggal = DateTime.Now;
            }
            else
            {
                idcard = data;
                idcard.Nomor_idcard = nomor;
                idcard.Masa_berlaku = masa;
                idcard.Tanggal = DateTime.Now;
                idcard.Status = false;
            }
            var prosesAdmin = new Proses();
            prosesAdmin.Status_proses = status;
            prosesAdmin.Tanggal_proses = DateTime.Now;
            prosesAdmin.Pengajuan = pengajuan;
            prosesAdmin.User = user;
            if (status == "0") prosesAdmin.Catatan = catatan;
            try
            {
                proses.Status_proses = "2";
                proses.Next = user;
                pengajuan.Status_pengajuan = (status == "0" ? "3" : "2");
                pengajuan.Sistem_updated_time = DateTime.Now;
                if (status == "1")
                {
                    if (data == null)
                    {
                        await _context.Tb_idcard.AddAsync(idcard);
                    }
                    else
                    {
                        _context.Tb_idcard.Update(data);
                    }
                    await _context.SaveChangesAsync();
                }
                _context.Tb_pengajuan.Update(pengajuan);
                await _context.SaveChangesAsync();
                _context.Tb_proses.Update(proses);
                await _context.SaveChangesAsync();
                await _context.Tb_proses.AddAsync(prosesAdmin);
                await _context.SaveChangesAsync();
                response.Message = (status == "1" ? "Update Nomor Id Card Berhasil" : "Pengajuan Berhasil Ditolak");
            }
            catch (Exception ex)
            {
                response.Status = false;
                response.Message = ex.Message;
            }

            return response;
        }
        public async Task<ServiceResponse<List<GetPengajuanDto>>> GetExpired(int userId)
        {
            var response = new ServiceResponse<List<GetPengajuanDto>>();
            var data = new List<GetPengajuanDto>();
            var tmp = new Pengajuan();
            var now = DateTime.Now.AddDays(39);
            var end = Convert.ToDateTime("1990-01-01");
            var user = await _context.Tb_user.Include(c => c.Struktur).ThenInclude(c => c.Akses).FirstOrDefaultAsync(c => c.Id == userId);
            var name_struktur = user.Struktur.nama_struktur.ToLower();
            var idcard = await _context.Tb_idcard.Include(c => c.Pengajuan).Where(c => c.Masa_berlaku < now && c.Masa_berlaku > end).ToListAsync();
            if (!idcard.Any() || user == null)
            {
                response.Status = false;
                response.Message = (user == null ? "User tidak ditemukan" : "Data tidak Ditemukan");
                return response;
            }
            foreach (var item in idcard)
            {
                if (user.Struktur.Akses.Akses_name.ToLower() == "vendor")
                {
                    var vendor = await _context.Tb_vendor.FirstOrDefaultAsync(c => c.User == user);
                    tmp = await _context.Tb_pengajuan.Where(c => c.Vendor == vendor)
                                        .Include(c => c.Vendor).Include(c => c.Jenis)
                                        .FirstOrDefaultAsync(c => c.Id == item.Pengajuan.Id);
                }
                else if (name_struktur == "lock data pertamina" || name_struktur == "pegawai pertamina" || name_struktur == "pertamina")
                {
                    var akun = await _context.Tb_akun.FirstOrDefaultAsync(c => c.User == user);
                    tmp = await _context.Tb_pengajuan.Where(c => c.Nik == akun.Nik)
                                        .Include(c => c.Vendor).Include(c => c.Jenis)
                                        .FirstOrDefaultAsync(c => c.Id == item.Pengajuan.Id);
                }
                else
                {
                    tmp = await _context.Tb_pengajuan.Include(c => c.Vendor).Include(c => c.Jenis)
                                        .FirstOrDefaultAsync(c => c.Id == item.Pengajuan.Id);
                }
                if (tmp != null)
                {
                    var dataMap = _mapper.Map<GetPengajuanDto>(tmp);
                    var idMap = await _context.Tb_idcard.FirstOrDefaultAsync(c => c.Pengajuan == tmp);
                    var mapId = _mapper.Map<GetIdCardDto>(idMap);
                    mapId.Expired = true;
                    dataMap.IdCard = mapId;
                    data.Add(dataMap);
                }
            }
            // response.Data = (data.Select(c => _mapper.Map<GetPengajuanDto>(c))).ToList();
            response.Data = data;
            response.Message = "List Pengajuan Mendekati Expired";
            return response;
        }
        private string RandomString()
        {
            var chars = "0123456789";
            var stringChars = new char[9];
            var random = new Random();

            for (int i = 0; i < stringChars.Length; i++)
            {
                stringChars[i] = chars[random.Next(chars.Length)];
            }

            var finalString = new String(stringChars);
            return finalString;
        }
        public async Task<int> GetNomor()
        {
            var nomor = int.Parse(RandomString());
            var cek = await _context.Tb_idcard.AnyAsync(x => x.Nomor_idcard == nomor);
            while (cek)
            {
                nomor = int.Parse(RandomString());
                cek = await _context.Tb_idcard.AnyAsync(x => x.Nomor_idcard == nomor);
            }
            return nomor;
        }
        public async Task<bool> NomorExists(int nomor)
        {
            return await _context.Tb_idcard.AnyAsync(x => x.Nomor_idcard == nomor);
        }
        // public async Task<ServiceResponse<GetProsesDto>> ProsesSend(int id, int userId)
        // {
        //     ServiceResponse<GetProsesDto> response = new ServiceResponse<GetProsesDto>();
        //     var data = await _context.Tb_pengajuan.Include(c => c.Jenis)
        //                         .ThenInclude(c => c.Akses)
        //                         .Where(c => c.Status_pengajuan == status_pengajuan)
        //                         .FirstOrDefaultAsync(c => c.Id == id);
        //     if (data == null)
        //     {
        //         response.Status = false;
        //         response.Message = "Pengajuan tidak ditemukan";
        //         return response;
        //     }
        //     data.Sistem_updated_time = DateTime.Now;
        //     data.Status_pengajuan = "1";

        //     var user = await _context.Tb_user.Include(c => c.Wilayah).FirstOrDefaultAsync(c => c.Id == userId);
        //     var struktur = await _context.Tb_struktur.OrderByDescending(c => c.urutan)
        //                             .FirstOrDefaultAsync(c => c.Akses == data.Jenis.Akses);
        //     if (user == null || struktur == null)
        //     {
        //         response.Status = false;
        //         response.Message = "user tidak ditemukan";
        //         return response;
        //     }
        //     var next = await _context.Tb_user.FirstOrDefaultAsync(c => c.Struktur == struktur && c.Wilayah == user.Wilayah);
        //     if (next == null)
        //     {
        //         response.Status = false;
        //         response.Message = "User Pimpinan tidak ditemukan";
        //         return response;
        //     }
        //     var proses = new Proses();
        //     proses.Status_proses = "1";
        //     proses.Tanggal_proses = DateTime.Now;
        //     proses.Pengajuan = data;
        //     proses.User = user;
        //     proses.Next = next;

        //     try
        //     {
        //         _context.Tb_pengajuan.Update(data);
        //         await _context.SaveChangesAsync();
        //         await _context.Tb_proses.AddAsync(proses);
        //         await _context.SaveChangesAsync();
        //         // response.Data = "Pengajuan atas nama " + data.Nama_lengkap + ", dan NIK: " + data.Nik;
        //         response.Data = _mapper.Map<GetProsesDto>(proses);
        //         response.Message = "Pengajuan berhasil diteruskan ke Admin";
        //     }
        //     catch (Exception ex)
        //     {
        //         response.Status = false;
        //         response.Message = ex.Message;
        //     }
        //     return response;
        // }

        // public async Task<ServiceResponse<GetProsesDto>> ProsesAcc(int id, string status, string catatan, int userId)
        // {
        //     ServiceResponse<GetProsesDto> response = new ServiceResponse<GetProsesDto>();
        //     var peng = await _context.Tb_pengajuan.FirstOrDefaultAsync(c => c.Id == id);
        //     var user = await _context.Tb_user.Include(c => c.Wilayah).Include(c => c.Struktur).ThenInclude(c => c.Akses)
        //                         .FirstOrDefaultAsync(c => c.Id == userId);
        //     var data = await _context.Tb_proses.Include(c => c.Pengajuan)
        //                         .Where(c => c.Next == user && c.Status_proses == "1")
        //                         .FirstOrDefaultAsync(c => c.Pengajuan == peng);
        //     if (data == null || user == null || (status != "0" && status != "1"))
        //     {
        //         response.Status = false;
        //         response.Message = (data == null ? "Pengajuan tidak ditemukan" :
        //                             (user == null ? "User tidak ditemukan" : "Status Salah"));
        //         return response;
        //     }
        //     var proses = new Proses();
        //     proses.Status_proses = status;
        //     proses.Tanggal_proses = DateTime.Now;
        //     proses.Pengajuan = data.Pengajuan;
        //     proses.User = user;
        //     if(status == "0") 
        //     {
        //         proses.Catatan = catatan;
        //     }
        //     if (status == "1")
        //     {
        //         if (user.Struktur.urutan != 1)
        //         {
        //             var urutan = user.Struktur.urutan - 1;
        //             var struktur = await _context.Tb_struktur.Where(c => c.urutan == urutan)
        //                                     .FirstOrDefaultAsync(c => c.Akses == user.Struktur.Akses);
        //             if (struktur == null)
        //             {
        //                 response.Status = false;
        //                 response.Message = "Struktur tidak ditemukan";
        //                 return response;
        //             }
        //             var next = await _context.Tb_user.Where(c => c.Struktur == struktur && c.Wilayah == user.Wilayah).FirstOrDefaultAsync();
        //             if (next == null)
        //             {
        //                 response.Status = false;
        //                 response.Message = "User Next tidak ditemukan";
        //                 return response;
        //             }
        //             proses.Next = next;
        //         }
        //     }
        //     try
        //     {
        //         data.Status_proses = "2";
        //         await _context.Tb_proses.AddAsync(proses);
        //         await _context.SaveChangesAsync();
        //         _context.Tb_proses.Update(data);
        //         await _context.SaveChangesAsync();
        //         if (proses.Next == null)
        //         {
        //             var pengajuan = proses.Pengajuan;
        //             pengajuan.Status_pengajuan = (status == "0" ? "3" : "2");
        //             pengajuan.Perpanjangan = false;

        //             _context.Tb_pengajuan.Update(pengajuan);
        //             await _context.SaveChangesAsync();
        //         }
        //         response.Data = _mapper.Map<GetProsesDto>(data);
        //         response.Message = "Proses " + (status == "0" ? "Tolak" : "Acc") + " Berhasil";
        //     }
        //     catch (Exception ex)
        //     {
        //         response.Status = false;
        //         response.Message = ex.Message;
        //     }

        //     return response;
        // }
    }
}