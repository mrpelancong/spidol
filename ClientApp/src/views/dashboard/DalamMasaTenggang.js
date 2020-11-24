import React from "react"

import {
    CCard, CCardBody, CCardHeader,
    CCol, CRow,
} from "@coreui/react"
import Swal from 'sweetalert2'

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
  
export class DalamMasaTenggang extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            error : null,
            itemsData : []
        }
    } 
    dataTable = () => {
        // console.log('SETTING DATATABLE >>');
        this.$el = $(this.el)
        this.$el.DataTable().destroy()
        this.$el.DataTable()
      }
      TBody = (props) => {
        if (props) {
          const listPengajuan = props.map((data, index) =>
          {
                return (
                  <tr key={data.id}>
                    <td>{data.nama_lengkap} </td>
                    <td>{data.idCard.nomor_idcard}</td>
                    <td>{data.idCard.masa_berlaku}</td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={this.props.data(data)}>Perpanjang ID Card</button>
                    </td>
                  </tr>
                )
          });
          return (
            <tbody>
            {listPengajuan}
            </tbody>
          )
        }
      }

    loadData = (id_data = null) => {
        // console.log('Load Data ...');
        let url;
        if (id_data == null) {
          url = "api/proses/expired";
        } else {
          url = "api/pengajuan/" + id_data;
        }
        fetch(url, {
          method: 'GET',
          headers: {
            'Content-type': 'application/json',
            'Authorization': "Bearer " + localStorage.token
          },
        })
          .then(res => res.json())
          .then(
            (result) => {
              if (id_data == null) {
                if (result.status) {
                  this.setState({
                    itemsData: result.data,
                  });
                  if (result.data.length > 0) {
                    this.props.expiredStatus(true)
                  } else {
                    this.props.expiredStatus(false)
                  }
                } else {
                  this.setState({
                    itemsData: [],
                  });
                }
                // --- selesaikan proses 
                this.$el = $(this.el)
                this.dataTable()
              } else {
                if (result.status) {
                  // console.log(result);
                } else {
                  setTimeout(function () {
                    setTimeout(function () {
                      swalNotif('error', 'Data Tidak Ditemukan');
                    }, 500)
                  }, 1500)
                }
              }
            },
            (error) => {
              localStorage.clear()
              this.setState({
                error
              });
            }
          )
      }

    componentDidMount () {
        this.loadData()
        // ------------
        this.timerID = setInterval(
          () => this.loadData(),
          5000
        );
    }
    componentWillUnmount() {
      clearInterval(this.timerID);
    }
    render() {
        return (
            <>
            <CCard>
                <CCardHeader>
                    <strong>ID Card Dalam Masa Tenggang</strong>
                </CCardHeader>
                <CCardBody>
                    <table width="100%" className="table table-striped table-bordered table-hover table-sm" ref={el => this.el = el}>
                        <thead>
                        <tr>
                            <th>Nama Lengkap</th>
                            <th>Nomor ID</th>
                            <th>Tanggal Expired</th>
                            <th>Action</th>
                        </tr>
                        </thead>
                        {this.TBody(this.state.itemsData)}
                    </table>
                </CCardBody>
            </CCard>
            </>
        );
    }
}

export default DalamMasaTenggang