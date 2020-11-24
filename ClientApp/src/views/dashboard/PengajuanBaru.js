import React from 'react'
import Swal from 'sweetalert2'
import {
  CCol,
  CRow,
  CCard,
  CCardHeader,
  CCardBody, CCardFooter
} from '@coreui/react'
import { Link } from 'react-router-dom'

const $ = require('jquery')
$.DataTable = require('datatables.net-bs4')
function swalNotif(icon = "error", message = "No Message") {
  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1500,
    timerProgressBar: true,
    onOpen: (toast) => {
      toast.addEventListener('mouseenter', Swal.stopTimer)
      toast.addEventListener('mouseleave', Swal.resumeTimer)
      // console.log('Cek Open');
    },
    onClose: (toast) => {
      // console.log('Cek Close');
    }
  })

  return (
    Toast.fire({
      icon: (icon) ? 'success' : 'error',
      title: message
    })
  )
}

export class PengajuanBaru extends React.Component {
  constructor(props) {
    super(props);
    // console.log(this);
    this.state = {
      error: null, 
      api: this.props.api,
      title: this.props.title,
      link: this.props.link,
      jumlah_data  : 0
    }
  }

  loadData = (api = null) => {
    fetch(api, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json',
        'Authorization': "Bearer " + localStorage.token
      },
    })
      .then(res => res.json())
      .then(
        (result) => {
          if (result.status) {
            // console.log(result.data.length);
            this.setState({
              jumlah_data : result.data.length
            })
            // document.getElementById("jumlah_vendor").innerHTML(<h1>{result.data.length}</h1>)
          } else {
            setTimeout(function () {
              setTimeout(function () {
                swalNotif('error', 'Data Tidak Ditemukan');
              }, 500)
            }, 1500)
          }
        },
        (error) => {
          this.setState({
            error
          });
        }
      )
  }
  componentDidMount() {
    this.loadData(this.state.api)
  }
  render() {
    const { itemsData, modalCRUD } = this.state;
    return(
      <>
        <CCol md="3">
          <CCard className="p-0">
            <CCardHeader className="font-weight-bold pl-2">{this.state.title}</CCardHeader>
            <CCardBody className="p-2 text-center">
                <h1>{this.state.jumlah_data}</h1>
            </CCardBody>
            <CCardFooter className="font-italic pl-2">
              <Link to={this.state.link}>Buka Halaman</Link>
            </CCardFooter>
          </CCard>
        </CCol>
      </>
    )
  }
}
