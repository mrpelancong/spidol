import React, { useState } from 'react'
import {
    CCard, CCardBody, CCardHeader, CCol, CRow,
} from '@coreui/react'
import { Tbl } from './Tbl';
const $ = require('jquery')


class Wilayah extends React.Component {
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
                                <strong>Data Lokasi Kerja</strong>
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

export default Wilayah
