import React, { useState } from 'react'
import {
  CCard, CCardBody, CCardHeader, CCol, CRow,
} from '@coreui/react'
import { Tbl } from '../data_pengajuan/Tbl';


class PengajuanBerkas extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
    }
  }

  componentDidMount() {

  }

  render() {

    return (
      <>
        <CRow>
          <CCol lg={12}>
            <CCard>
              <CCardHeader>
                <strong>Data Pengajuan Anda</strong>
              </CCardHeader>
              <CCardBody>
                <Tbl vendor={true}></Tbl>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>

      </>
    );
  }

}

export default PengajuanBerkas
