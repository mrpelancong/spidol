import React, { useState } from 'react'
import {
    CCard, CCardBody, CCardHeader, CCol, CRow,
} from '@coreui/react'
import { Tbl } from './Tbl';
const $ = require('jquery')


class Data_pertamina extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            error: null,
        }
    }

    render() {

        return (
            <>
                <CRow>
                    <CCol lg={12}>
                        <CCard>
                            <CCardHeader>
                                <strong>Data Pengajuan ID Card Pegawai Pertamina</strong>
                            </CCardHeader>
                            <CCardBody>
                                <Tbl>
                                </Tbl>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>

            </>
        );
    }

}

export default Data_pertamina
