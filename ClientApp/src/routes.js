import React from 'react';

const Login = React.lazy(() => import('./views/pages/login/Login'));
const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'));
const Data_vendor = React.lazy(() => import('./views/vendor/data_vendor/Data_vendor'));
const Data_pengajuan = React.lazy(() => import('./views/pengajuan/data_pengajuan/Data_pengajuan'));
const Data_pertamina = React.lazy(() => import('./views/pengajuan/data_pertamina/Data_pertamina'));
const Blacklist = React.lazy(() => import('./views/blacklist/Blacklist'));

const Master_data = React.lazy(() => import('./views/master_data/Master_data'));
const Jenis = React.lazy(() => import('./views/jenis/Jenis'));
const Akses = React.lazy(() => import('./views/akses/Akses'));
const Wilayah = React.lazy(() => import('./views/wilayah/Wilayah'));
const Struktur = React.lazy(() => import('./views/struktur/Struktur'));

const User = React.lazy(() => import('./views/user/User'));
const Pegawai = React.lazy(() => import('./views/pegawai/Pegawai'));
const PengajuanBerkas = React.lazy(() => import('./views/pengajuan/pengajuan_vendor/PengajuanBerkas'));
const PengajuanPimpinan = React.lazy(() => import('./views/dashboard/DashboardPimpinan'));
const PengajuanVendor = React.lazy(() => import('./views/dashboard/DashboardVendor'));
const PengajuanPegawai = React.lazy(() => import('./views/dashboard/pegawai/DashboardPegawai'));

const History = React.lazy(() => import('./views/history/History'));


const routes = [
  // { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Halaman Utama', component: Dashboard },
  { path: '/login', name: 'Login Aplikasi', component: Login },
  { path: '/vendor/data_vendor', name: 'Data Vendor', component: Data_vendor },
  { path: '/pengajuan/data_pengajuan', name: 'Data Pengajuan Vendor', component: Data_pengajuan },
  { path: '/pengajuan/data_pertamina', name: 'Data Pengajuan Pegawai Pertamina', component: Data_pertamina },
  { path: '/blacklist', name: 'Data Blacklist', component: Blacklist },
  { path: '/master_data', name: 'Master Data Aplikasi', component: Master_data },
  { path: '/jenis', name: 'Data Jenis', component: Jenis },
  { path: '/akses', name: 'Data Akses', component: Akses },
  { path: '/wilayah', name: 'Data Wilayah', component: Wilayah },
  { path: '/struktur', name: 'Data Struktur', component: Struktur },
  { path: '/user', name: 'Data User', component: User },
  { path: '/pegawai', name: 'Data Pegawai', component: Pegawai },
  { path: '/history', name: 'Data History Pengajuan', component: History },
  { path: '/pengajuan_berkas', name: 'Data Pengajuan Berkas', component: PengajuanBerkas },
  { path: '/dashboard_pimpinan', name: 'Data Pengajuan Berkas', component: PengajuanPimpinan },
  { path: '/dashboard_vendor', name: 'Data Pengajuan Vendor', component: PengajuanVendor },
  { path: '/dashboard_pegawai', name: 'Data Pengajuan Pegawai', component: PengajuanPegawai },
];

export default routes;
