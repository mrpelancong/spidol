import React from 'react'
import {
    CCard, CCardBody, CCardHeader, CCol, CRow,
    CTabs, CTabPane, CTabContent,
    CNav, CNavItem, CNavLink,
} from '@coreui/react'

import { Tbl as Jenis_pekerjaan } from '../jenis/Tbl';
import { Tbl as Master_akses } from '../akses/Tbl';
import { Tbl as Master_wilayah } from '../wilayah/Tbl';
import { Tbl as Master_struktur } from '../struktur/Tbl';
// ----
import AdminService from '../../services/admin/admin.service'

class Master_data extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
        }
    }

    render() {

        return (
            <>
                    <CTabs>
                        <CNav variant="tabs">
                            <CNavItem>
                                <CNavLink>
                                    Jenis Pekerjaan & Akses
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink>
                                    Lokasi Kerja
                                </CNavLink>
                            </CNavItem>
                            <CNavItem>
                                <CNavLink>
                                    Struktur
                                </CNavLink>
                            </CNavItem>
                        </CNav>
                        <CTabContent className="mt-2">
                            <CTabPane>
                                <CRow>
                                    <CCol lg={6}>
                                        <CCard>
                                            <CCardHeader>
                                                <strong>Data Jenis Pekerjaan</strong>
                                            </CCardHeader>
                                            <CCardBody>
                                                <Jenis_pekerjaan getData={AdminService.getData} postData={AdminService.postData} putData={AdminService.putData} deleteData={AdminService.deleteData} />
                                            </CCardBody>
                                        </CCard>
                                    </CCol>
                                    <CCol lg={6}>
                                        <CCard>
                                            <CCardHeader>
                                                <strong>Data Akses</strong>
                                            </CCardHeader>
                                            <CCardBody>
                                                <Master_akses getData={AdminService.getData} postData={AdminService.postData} putData={AdminService.putData} deleteData={AdminService.deleteData} />
                                            </CCardBody>
                                        </CCard>
                                    </CCol>
                                </CRow>
                            </CTabPane>
                            <CTabPane>
                                <CCol lg={12}>
                                    <CCard>
                                        <CCardHeader>
                                            <strong>Master Data Wilayah</strong>
                                        </CCardHeader>
                                        <CCardBody>
                                            <Master_wilayah getData={AdminService.getData} postData={AdminService.postData} putData={AdminService.putData} deleteData={AdminService.deleteData} />
                                        </CCardBody>
                                    </CCard>
                                </CCol>
                            </CTabPane>
                            <CTabPane>
                                <CCol lg={12}>
                                    <CCard>
                                        <CCardHeader>
                                            <strong>Master Data Struktur</strong>
                                        </CCardHeader>
                                        <CCardBody>
                                            <Master_struktur getData={AdminService.getData} postData={AdminService.postData} putData={AdminService.putData} deleteData={AdminService.deleteData} />
                                        </CCardBody>
                                    </CCard>
                                </CCol>
                            </CTabPane>
                        </CTabContent>
                    </CTabs>
                    

            </>
        );
    }

}

export default Master_data