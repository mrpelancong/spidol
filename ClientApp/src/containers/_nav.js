export const admin = {
  items :[
    {
      _tag: 'CSidebarNavItem',
      name: 'Halaman Utama',
      to: '/dashboard',
      icon: 'cil-home',
    },
    {
      _tag: 'CSidebarNavTitle',
      _children: ['Master Data']
    },
    {
      _tag: 'CSidebarNavItem',
      name: 'Master Data',
      to: '/master_data',
      icon: 'cilSettings',
    },
    {
      _tag: 'CSidebarNavDropdown',
      name: 'Master User',
      route: '/user',
      icon: 'cil-people',
      _children: [
        {
          _tag: 'CSidebarNavItem',
          name: 'User Sistem',
          to: '/user',
        },
        {
          _tag: 'CSidebarNavItem',
          name: 'Pekerja',
          to: '/pegawai',
        },
        {
          _tag: 'CSidebarNavItem',
          name: 'Vendor',
          to: '/vendor/data_vendor',
        }
      ],
    },
    {
      _tag: 'CSidebarNavTitle',
      _children: ['ID Card']
    },
    {
      _tag: 'CSidebarNavItem',
      name: 'Pengajuan Vendor',
      to: '/pengajuan/data_pengajuan',
      icon: 'cil-paper-plane',
    },
    {
      _tag: 'CSidebarNavItem',
      name: 'Pengajuan Pegawai',
      to: '/pengajuan/data_pertamina',
      icon: 'cil-paper-plane',
    },
    {
      _tag: 'CSidebarNavItem',
      name: 'Blacklist',
      to: '/blacklist',
      icon: 'cil-ban',
    },
    {
      _tag: 'CSidebarNavItem',
      name: 'History Pengajuan',
      to: '/history',
      icon: 'cil-paper-plane',
    }
  ]
}

export const vendor = {
  items :[
    {
      _tag: 'CSidebarNavItem',
      name: 'Halaman Utama',
      to: '/dashboard_vendor',
      icon: 'cil-home',
    },
    {
      _tag: 'CSidebarNavTitle',
      _children: ['ID Card']
    },
    {
      _tag: 'CSidebarNavItem',
      name: 'Proses Pengajuan',
      to: '/pengajuan_berkas',
      icon: 'cil-paper-plane',
    },
  ]
}

export const Pegawai = {
  items:[
    {
      _tag: 'CSidebarNavTitle',
      _children: ['ID Card']
    },
    {
      _tag: 'CSidebarNavItem',
      name: 'Pengajuan ID Card',
      to: '/dashboard_pegawai',
      icon: 'cil-paper-plane',
    },
  ]
}

export const Pimpinan = {
  items:[
    {
      _tag: 'CSidebarNavTitle',
      _children: ['ID Card Apps']
    },
    {
      _tag: 'CSidebarNavItem',
      name: 'Pengajuan ID Card',
      to: '/dashboard_pimpinan',
      icon: 'cil-paper-plane',
    },
    {
      _tag: 'CSidebarNavTitle',
      _children: ['ID Card']
    },
    {
      _tag: 'CSidebarNavItem',
      name: 'History Pengajuan',
      to: '/history',
      icon: 'cil-paper-plane',
    },
    {
      _tag: 'CSidebarNavItem',
      name: 'Blacklist',
      to: '/blacklist',
      icon: 'cil-ban',
    },
  ]
}
