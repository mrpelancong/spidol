CREATE TABLE [tb_akses]
(
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [akses_name] varchar(30) NOT NULL,
  [akses_status] nvarchar(255) NOT NULL CHECK ([akses_status] IN ('0', '1')),
  [sistem_created_time] datetime NOT NULL default ('1900-01-01'),
  [sistem_updated_time] datetime NOT NULL default ('1900-01-01'),
  [sistem_ip_create] varchar(35)
)
GO

CREATE TABLE [tb_wilayah]
(
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [nama_wilayah] varchar(100) NOT NULL,
  [status_wilayah] nvarchar(255) NOT NULL CHECK ([status_wilayah] IN ('0', '1')),
  [sistem_created_time] datetime NOT NULL default ('1900-01-01'),
  [sistem_updated_time] datetime NOT NULL default ('1900-01-01'),
)
GO

CREATE TABLE [tb_struktur]
(
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [aksesId] int,
  [urutan] int,
  [nama_struktur] varchar(35),
  [sistem_created_time] datetime NOT NULL default ('1900-01-01'),
  [sistem_updated_time] datetime NOT NULL default ('1900-01-01')
)
GO

CREATE TABLE [tb_user]
(
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [strukturId] int,
  [wilayahId] int,
  [username] varchar(35),
  [passwordHash] varbinary(max),
  [passwordSalt] varbinary(max),
  [nama_lengkap] varchar(35),
  [sistem_created_time] datetime NOT NULL default ('1900-01-01'),
  [sistem_updated_time] datetime NOT NULL default ('1900-01-01'),
  [sistem_ip_create] varchar(35)
)
GO

CREATE TABLE [tb_akun]
(
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [userId] int,
  [nama_lengkap] varchar(40),
  [alamat] varchar(200),
  [no_telp] varchar(16),
  [sistem_created_time] datetime NOT NULL default ('1900-01-01'),
  [sistem_updated_time] datetime NOT NULL default ('1900-01-01')
)
GO

CREATE TABLE [tb_jenis_pekerjaan]
(
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [aksesId] int,
  [nama_jenis] varchar(40),
  [sistem_created_time] datetime NOT NULL default ('1900-01-01'),
  [sistem_updated_time] datetime NOT NULL default ('1900-01-01')
)
GO

CREATE TABLE [tb_vendor]
(
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [userId] int,
  [nama_vendor] varchar(50) NOT NULL,
  [alamat_vendor] text NOT NULL,
  [no_telp] varchar(16),
  [penanggung_jawab] varchar(50) NOT NULL,
  [no_telp_pj] varchar(16),
  [sistem_created_time] datetime NOT NULL default ('1900-01-01'),
  [sistem_updated_time] datetime NOT NULL default ('1900-01-01')
)
GO

CREATE TABLE [tb_pengajuan]
(
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [vendorId] int,
  [jenisId] int,
  [nik] varchar(16),
  [nama_lengkap] varchar(35),
  [alamat] text,
  [no_telp] varchar(16),
  [status_pengajuan] nvarchar(255) NOT NULL CHECK ([status_pengajuan] IN ('0', '1', '2', '3')),
  [keterangan] varchar(200),
  [tgl_pengajuan] date NOT NULL default ('1900-01-01'),
  [tgl_lahir] date NOT NULL default ('1900-01-01'),
  [surat_permohonan] varchar(50),
  [surat_pernyataan] varchar(50),
  [file_ktp] varchar(50),
  [file_biodata] varchar(50),
  [file_foto] varchar(50),
  [file_skck] varchar(50),
  [file_surat_sehat] varchar(50),
  [surat_bebas_narkoba] varchar(50),
  [file_pendukung] varchar(50),
  [sistem_created_time] datetime NOT NULL default ('1900-01-01'),
  [sistem_updated_time] datetime NOT NULL default ('1900-01-01')
)
GO

CREATE TABLE [tb_idcard]
(
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [pengajuanId] int NOT NULL,
  [nik] varchar(16),
  [nomor_idcard] int UNIQUE NOT NULL,
  [sistem_created_time] datetime NOT NULL default ('1900-01-01')
)


CREATE TABLE [tb_blacklist]
(
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [pengajuanId] int,
  [nik] varchar(16),
  [status_blacklist] nvarchar(255) NOT NULL CHECK ([status_blacklist] IN ('0', '1')),
  [keterangan_blacklist] varchar(100),
  [tgl_blacklist] date NOT NULL default ('1900-01-01'),
  [sistem_created_time] datetime NOT NULL default ('1900-01-01'),
  [sistem_updated_time] datetime NOT NULL default ('1900-01-01')
)
GO

CREATE TABLE [tb_proses]
(
  [id] int PRIMARY KEY IDENTITY(1, 1),
  [pengajuanId] int,
  [userId] int,
  [nextId] int,
  [status_proses] nvarchar(255) NOT NULL CHECK ([status_proses] IN ('0', '1','2')),
  [catatan] varchar(250),
  [tanggal_proses] date NOT NULL default ('1900-01-01')
)
GO

ALTER TABLE [tb_akun] ADD FOREIGN KEY ([userId]) REFERENCES [tb_user] ([id]) ON DELETE CASCADE


ALTER TABLE [tb_user] ADD FOREIGN KEY ([strukturId]) REFERENCES [tb_struktur] ([id]) ON DELETE CASCADE


ALTER TABLE [tb_struktur] ADD FOREIGN KEY ([aksesId]) REFERENCES [tb_akses] ([id]) ON DELETE CASCADE


ALTER TABLE [tb_jenis_pekerjaan] ADD FOREIGN KEY ([aksesId]) REFERENCES [tb_akses] ([id]) ON DELETE CASCADE


ALTER TABLE [tb_vendor] ADD FOREIGN KEY ([userId]) REFERENCES [tb_user] ([id]) ON DELETE CASCADE


ALTER TABLE [tb_pengajuan] ADD FOREIGN KEY ([vendorId]) REFERENCES [tb_vendor] ([id]) ON DELETE CASCADE


ALTER TABLE [tb_pengajuan] ADD FOREIGN KEY ([jenisId]) REFERENCES [tb_jenis_pekerjaan] ([id]) ON DELETE NO ACTION


ALTER TABLE [tb_blacklist] ADD FOREIGN KEY ([pengajuanId]) REFERENCES [tb_pengajuan] ([id]) ON DELETE CASCADE


ALTER TABLE [tb_proses] ADD FOREIGN KEY ([pengajuanId]) REFERENCES [tb_pengajuan] ([id]) ON DELETE NO ACTION


ALTER TABLE [tb_proses] ADD FOREIGN KEY ([userId]) REFERENCES [tb_user] ([id]) ON DELETE CASCADE


ALTER TABLE [tb_idcard] ADD FOREIGN KEY ([pengajuanId]) REFERENCES [tb_pengajuan] ([id]) ON DELETE CASCADE

ALTER TABLE [tb_user] ADD FOREIGN KEY ([wilayahId]) REFERENCES [tb_wilayah] ([id]) ON DELETE CASCADE


CREATE INDEX [wilayahId] ON [tb_user] ("wilayahId")

CREATE INDEX [userId] ON [tb_akun] ("userId")


CREATE INDEX [strukturId] ON [tb_user] ("strukturId")


CREATE INDEX [aksesId] ON [tb_struktur] ("aksesId")


CREATE INDEX [aksesId] ON [tb_jenis_pekerjaan] ("aksesId")


CREATE INDEX [userId] ON [tb_vendor] ("userId")


CREATE INDEX [vendorId] ON [tb_pengajuan] ("vendorId")


CREATE INDEX [jenisId] ON [tb_pengajuan] ("jenisId")


CREATE INDEX [pengajuanId] ON [tb_blacklist] ("pengajuanId")


CREATE INDEX [pengajuanId] ON [tb_proses] ("pengajuanId")


CREATE INDEX [userId] ON [tb_proses] ("userId")


CREATE INDEX [pengajuanId] ON [tb_idcard] ("pengajuanId")


EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '0=Non-Aktif, 1=Aktif',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'tb_akses',
@level2type = N'Column', @level2name = 'akses_status';


EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '0=Baru,1=Dalam Proses, 2=Disetujui, 3=Ditolak',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'tb_pengajuan',
@level2type = N'Column', @level2name = 'status_pengajuan';


EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '0=Non, 1=Blacklist',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'tb_blacklist',
@level2type = N'Column', @level2name = 'status_blacklist';


EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '0=Tolak, 1=ACC, 2=Done',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'tb_proses',
@level2type = N'Column', @level2name = 'status_proses';

EXEC sp_addextendedproperty
@name = N'Column_Description',
@value = '0=Non-Aktif, 1=Aktif',
@level0type = N'Schema', @level0name = 'dbo',
@level1type = N'Table',  @level1name = 'tb_wilayah',
@level2type = N'Column', @level2name = 'status_wilayah';

INSERT INTO tb_akses
  (akses_name, akses_status)
VALUES
  ('Admin', '1')

INSERT INTO tb_struktur
  (aksesId,urutan,nama_struktur)
VALUES
  ('1', 1, 'SuperAdmin')
