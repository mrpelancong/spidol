using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using AutoMapper;
using idcard.Data;
using idcard.Dtos;
using idcard.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace idcard.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TesController : ControllerBase
    {
        private readonly DataContext _context;
        private readonly IMapper _mapper;
        public TesController(DataContext context, IMapper mapper)
        {
            _mapper = mapper;
            _context = context;
        }
        private string _pathRoot = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "file");
        private DateTime _now = DateTime.Now;
        private DateTime _year = Convert.ToDateTime("1900-01-01");

        [HttpGet]
        public IActionResult Get()
        {
            int n = 1;
            return Ok(new { _pathRoot, DateTime.Now, n });
        }
        [HttpGet("tes")]
        public IActionResult GetTes()
        {
            var data = _context.Tb_pengajuan.ToList();
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

            return Ok(new {exp, mapData.Count, mapData });
        }

        [HttpGet("ting/{id?}")]
        public IActionResult GetTing(int id)
        {
            var data = _context.Tb_idcard.ToList();
            var n = 0;
            var nList = new ArrayList();
            
            for (int i = 0; i < data.Capacity; i++)
            {
                nList.Add(n);
                if (i == id)
                {
                    data.RemoveAt(i);
                }
                n++;
            }
            

            return Ok(new { nList, data });
        }

        [HttpGet("pengajuan")]
        public IActionResult TesGet()
        {
            var baseUrl = $"{this.Request.Scheme}://{this.Request.Host.Value.ToString()}{this.Request.PathBase.Value.ToString()}";
            baseUrl = baseUrl + "/api/pengajuan/download/";
            var data = _context.Tb_pengajuan.ToList();
            foreach (var item in data)
            {
                var path = Path.Combine(_pathRoot, item.Id.ToString());
                item.Surat_permohonan = baseUrl + "Surat_permohonan/" + item.Id;
                item.Surat_pernyataan = baseUrl + "Surat_pernyataan/" + item.Id;
                item.File_ktp = baseUrl + "File_ktp/" + item.Id;
                item.File_biodata = baseUrl + "File_biodata/" + item.Id;
                item.File_foto = baseUrl + "File_foto/" + item.Id;
                item.File_skck = baseUrl + "File_skck/" + item.Id;
                item.File_surat_sehat = baseUrl + "File_surat_sehat/" + item.Id;
                item.Surat_bebas_narkoba = baseUrl + "Surat_bebas_narkoba/" + item.Id;
                item.File_pendukung = baseUrl + "File_pendukung/" + item.Id;
            }
            return Ok(new { baseUrl, data });
        }


        [HttpGet("akses")]
        public async Task<IActionResult> GetAkses()
        {
            var data = await _context.Tb_akses.ToListAsync();
            var tes = (data.Select(c => _mapper.Map<GetAksesDto>(c))).ToList();
            return Ok(tes);
        }

        [HttpGet("user")]
        public async Task<IActionResult> GetUser()
        {
            var data = await _context.Tb_user.Include(c => c.Struktur).ToListAsync();
            return Ok(data);
        }

        [HttpGet("struktur")]
        public async Task<IActionResult> GetStruktur()
        {
            var data = await _context.Tb_struktur.Include(c => c.Akses).ToListAsync();
            return Ok(data);
        }

        [HttpGet("vendor")]
        public async Task<IActionResult> GetVendor()
        {
            var data = await _context.Tb_vendor.Include(c => c.User).ToListAsync();
            return Ok(data);
        }

        [HttpGet("akun")]
        public async Task<IActionResult> GetAkun()
        {
            var data = await _context.Tb_akun.Include(c => c.User).ToListAsync();
            return Ok(data);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetAkun(int id)
        {
            string path = "";
            ArrayList tes = new ArrayList();
            ArrayList tos = new ArrayList();
            var data = await _context.Tb_pengajuan.FirstOrDefaultAsync(c => c.Id == id);
            foreach (var item in data.GetType().GetProperties())
            {
                if (item.Name != "Vendor" && item.Name != "Jenis")
                {
                    var name = item.GetValue(data, null);
                    path = Path.Combine(_pathRoot, id.ToString(), name.ToString());
                    // var aa = name.ToString();
                    tes.Add(item.Name);
                    tos.Add(item.GetValue(data, null));
                }
            }
            return Ok(new { data, tes, tos, path });
        }

        [HttpGet("delete/{id}")]
        public async Task<IActionResult> DeleteTes(int id)
        {
            ArrayList tes = new ArrayList();
            var data = await _context.Tb_pengajuan.FirstOrDefaultAsync(c => c.Id == id);
            if (data == null)
            {
                return NoContent();
            }
            foreach (var item in data.GetType().GetProperties())
            {
                var name = item.GetValue(data, null);
                if (name != null)
                {
                    var path = Path.Combine(_pathRoot, id.ToString(), name.ToString());

                    tes.Add(path);
                }
            }
            return Ok(tes);
        }

    }
}