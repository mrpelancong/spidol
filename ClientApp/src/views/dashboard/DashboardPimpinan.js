import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  CWidgetBrand,
  CCol,
  CRow,
  CCard,
  CCardHeader,
  CCardBody,
} from '@coreui/react'
//LOAD DATA DASHBOARD
import {ProsesPimpinan} from './ProsesPimpinan'

const Dashboard = () => {

  return (
    <>
      <CRow>
        <CCol md="12">
          <CCard>
            <CCardHeader className="font-weight-bold">List Pengajuan Menunggu Persetujuan</CCardHeader>
            <CCardBody>
              <ProsesPimpinan/>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default Dashboard
