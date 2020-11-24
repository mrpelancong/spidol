using idcard.Models;
using Microsoft.EntityFrameworkCore;

namespace idcard.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options) { }

        public DbSet<User> Tb_user { get; set; }
        public DbSet<Akses> Tb_akses { get; set; }
        public DbSet<Vendor> Tb_vendor { get; set; }
        public DbSet<Struktur> Tb_struktur { get; set; }
        public DbSet<Akun> Tb_akun { get; set; }
        public DbSet<Jenis> Tb_jenis_pekerjaan { get; set; }
        public DbSet<Pengajuan> Tb_pengajuan { get; set; }
        public DbSet<Blacklist> Tb_blacklist { get; set; }
        public DbSet<Proses> Tb_proses { get; set; }
        public DbSet<Idcard> Tb_idcard { get; set; }
        public DbSet<Wilayah> Tb_wilayah { get; set; }
    }
}