import React from 'react'

import {
  CCol, CRow,
  CCard, CCardHeader, CCardBody,
  CTabs, CTabPane, CTabContent,
  CNav, CNavItem, CNavLink,
} from '@coreui/react'
//LOAD DATA DASHBOARD
import {PengajuanBaru} from './PengajuanBaru'
import {Tbl} from '../pengajuan/data_pengajuan/Tbl'
import {Tbl as Blacklist} from '../blacklist/Tbl'
import {Line} from '../grafik/Line'



export class Dashboard extends React.Component  {
    constructor(props, context) {
        super(props, context);
        this.state = {
            isunMounted : false,
        }
    }
    
    componentDidMount(){

    }
    componentWillUnmount(){
        console.log('componentWillUnmount')
        this.setState({
            isunMounted: true,
        })
    }
  render() {
    return (
        <>
          <CRow>
              <PengajuanBaru api='api/user/vendor/' link='/vendor/data_vendor' title="Jumlah Vendor" />
              <PengajuanBaru api='api/user/pegawai/' link='/pegawai' title="Jumlah Pegawai Pertamina" />
              <PengajuanBaru api='api/jenis/' link='/jenis' title="Jenis Pekerjaan" />
              <PengajuanBaru api='api/pengajuan/' link='/pengajuan/data_pengajuan' title="Jumlah Pengajuan ID Card" />
              <CCol lg={12}>
                <CCard>
                  <CCardHeader className="font-weight-bold font-italic">
                    Pengajuan Telah Disetujui - Silahkan Input Nomor Pekerja/NOPEK
                  </CCardHeader>
                  <CCardBody>
                    <CTabs>
                        <CNav variant="tabs">
                            <CNavItem>
                                <CNavLink>
                                    Menunggu Nomor ID Card
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink>
                                    ID Card Active
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink>
                                    ID Card Masa Tenggang
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink>
                                    Daftar Blacklist 
                                </CNavLink>
                            </CNavItem>
                        </CNav>
                        <CTabContent className="mt-2">
                            <CTabPane>
                                <Tbl request={true} expired={false} active={false} />
                            </CTabPane>
                            <CTabPane>
                                <Tbl request={true} expired={false} active={true} />
                            </CTabPane>
                            <CTabPane>
                                <Tbl request={true} expired={true} active={false} />
                            </CTabPane>
                            <CTabPane>
                                <Blacklist request={true} />
                            </CTabPane>
                        </CTabContent>
                    </CTabs>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol lg={12}>
                  <CCard>
                    <CCardHeader className="font-weight-bold font-italic">
                        Grafik Trafic Aplikasi 
                    </CCardHeader>
                    <CCardBody>
                        <Line isunMounted={this.state.isunMounted} />
                    </CCardBody>
                  </CCard>
              </CCol>
          </CRow>
        </>
      )
  }
}

export default Dashboard
