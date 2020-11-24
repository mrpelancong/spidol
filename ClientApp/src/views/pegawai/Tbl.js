import React from 'react'
import {
  CCol, CRow, CButton, CModal,
  CModalBody,
  CFormGroup,
  CLabel,
  CInput,
  CForm,
  CModalFooter,
  CModalHeader,
  CSelect,
  CTextarea,
  CModalTitle
} from '@coreui/react'
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
      console.log('Cek Open');
    },
    onClose: (toast) => {
      console.log('Cek Close');
    }
  })

  return (
    Toast.fire({
      icon: (icon) ? 'success' : 'error',
      title: message
    })
  )
}

export class Tbl extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null,
      itemsData: [],
      itemStruktur: [], itemWilayah: [],
      modalHapus: false,
      modalCRUD: false,
      modalEdit: false,
      id_data: null,
    }
  }

  TBody = (props) => {
    console.log(props)
    if (props) {
      return (
        <tbody>
        {props.map((data, index) =>
          <tr key={data.id}>
            <td>{index + 1}</td>
            <td>{data.nama_lengkap}</td>
            <td>{data.nik}</td>
            <td>{data.no_telp}</td>
            <td>{data.alamat}</td>
            <td>
              <a className="btn btn-sm btn-success text-white btn-block mr-2" onClick={()=>this.handleEdit(data.user.username)}> Reset Password </a>
            </td>
          </tr>
        )}
        </tbody>
      );
    }
  }

  loadData = (id_data = null) => {
    console.log('Load Data');
    let url;
    if (id_data == null) {
      url = "api/user/pegawai/";
    } else {
      url = "api/user/pegawai/" + id_data;
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
          console.log(result);
          if (id_data == null) {
            this.setState({
              itemsData: result.data,
            });
            this.$el = $(this.el)
            this.$el.DataTable()
          } else {
            if (result.status) {
              var keys = Object.keys(result.data);
              var value = Object.values(result.data);
              for (var i = keys.length - 1; i >= 0; i--) {
                $("input[name='" + keys[i] + "']").val(value[i]);
                $("select[name='" + keys[i] + "']").val(value[i]);
              }
            } else {
              setTimeout(function () {
                this.setState({ modalCRUD: false, id_data: null })
                setTimeout(function () {
                  swalNotif('error', 'Data Tidak Ditemukan');
                }, 500)
              }, 1500)
            }
          }
        },
        (error) => {
          this.setState({
            error
          });
        }
      )
  }
  handleTambah = () => {
    this.setState({
      modalCRUD: true,
      id_data: null,
      titleModal: 'Tambah Data'
    });
    $("form").find("input").val('');
    $("form").find("select").val('');
  }

  handleEdit = (id) => {
    console.log(id);
    this.setState({
      modalEdit: true,
      id_data: id,
      titleModal: 'Reset Password'
    });
  }

  handleSubmit = (event) => {
    event.preventDefault();
    let data;
    let option;
    let API_URL;
    let headerOption = {
      'Accept': 'application/json',
      'Content-type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'Authorization': "Bearer " + localStorage.token
    }
    if (this.state.id_data != null) {
      API_URL = "api/user/password";
      data = $(".resetPassword")
        .find(":input")
        .serialize() + '&username=' + this.state.id_data;

      option = {
        method: 'PUT',
        headers: headerOption,
        body: data
      }

      this.setState({ modalCRUD: false, id_data: null })
    } else {
      API_URL = "api/user/";
      let nik = $("form").find("input[name='nik']").val();
      data = $(".tambahData").serialize()+ '&wilayahId=1&jenis=user&username='+nik+'&password='+nik;
      console.log(data);
      option = {
        method: 'POST',
        headers: headerOption,
        body: data
      }
      $("form").find("input").val('');
      $("form").find("select").val('');
    }
    fetch(API_URL, option)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({ modal: false })
          swalNotif(result.status, result.message)
          this.loadData()
        },
        (error) => {
          console.log(error);
          this.setState({ modal: false })
          swalNotif(false, 'SISTEM ERROR ! : ' + error)
        }
      )
  }
  // --- Make Option
  viewOptionStruktur = (data =null) => {
    if (data) {
      let optionStruk = data.map((data) => {
        return(
          <option key={data.id} value={data.id}>{data.nama_struktur}</option>
        )
      })
      
      let optionChose = data.map((data) => {
        if (data.nama_struktur.toLowerCase() == 'lock data pertamina' || data.nama_struktur.toLowerCase() == 'pegawai pertamina' || data.nama_struktur.toLowerCase() == 'pertamina') {
          return data.id
        }

      })
      // console.log();
      return(
        <CSelect name="strukturId" value={optionChose.filter(Boolean).toString()} readOnly hidden>
          {optionStruk}
        </CSelect>
      );
    } else {
      return(
        <CSelect>
          <option>Data Tidak Ditemukan</option>
        </CSelect>
      );
    }
  }
  OptionStruktur = () => {
    let url = "api/struktur/by/all";
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
          console.log('result '+result.status)
          this.setState({
            itemStruktur : result.data
          })
        },
        (error) => {
          console.log(error)
        }
      )
  }

  viewOptionWilayah = (data =null) => {
    if (data) {
      let optionStruk = data.map((data) => {
        return(
          <option key={data.id} value={data.id}>{data.nama_wilayah}</option>
        )
      })
      

      // console.log();
      return(
        <CSelect name="wilayahId" >
          {optionStruk}
        </CSelect>
      );
    } else {
      return(
        <CSelect>
          <option>Data Tidak Ditemukan</option>
        </CSelect>
      );
    }
  }
  OptionWilayah = () => {
    let url = "api/wilayah/";
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
          console.log('result '+result.status)
          this.setState({
            itemWilayah : result.data
          })
        },
        (error) => {
          console.log(error)
        }
      )
  }

  componentDidMount() {
    this.loadData()
    this.OptionStruktur()
    this.OptionWilayah()
  }

  render() {
    const { titleModal, itemsData, modalCRUD, modalEdit } = this.state;

    return (
      <>
        <CButton
          color="primary"
          onClick={() => this.handleTambah()}
        >Tambah Data</CButton>
        <hr></hr>
        <table width="100%" className="table table-striped table-bordered table-hover table-sm" ref={el => this.el = el}>
          <thead>
          <tr>
            <th width="10px">No</th>
            <th>Nama</th>
            <th>NOPEK</th>
            <th>No Telp</th>
            <th>Alamat</th>
            <th>Reset</th>
          </tr>
          </thead>
          {this.TBody(itemsData)}
        </table>
        <CModal
          show={modalCRUD}
          onClose={() => this.setState({ modalCRUD: false })}
        >
          <CModalHeader closeButton>
            <CModalTitle>{titleModal}</CModalTitle>
          </CModalHeader>
          <CForm className="tambahData" onSubmit={this.handleSubmit}>
            <CModalBody>
                {this.viewOptionStruktur(this.state.itemStruktur)}
              <CFormGroup>
                <CLabel htmlFor="nama_lengkap">Nama Lengkap</CLabel>
                <CInput id="nama_lengkap" type="text" name="nama_lengkap" placeholder="Nama Lengkap" />
              </CFormGroup>
              <CFormGroup row className="my-0">
                <CCol xs="6">
                  <CFormGroup>
                    <CLabel htmlFor="nik">NOPEK</CLabel>
                    <CInput id="nik" type="text" name="nik" placeholder="Nomor Pekerja" />
                  </CFormGroup>
                </CCol>
                <CCol xs="6" className="pl-0">
                  <CFormGroup>
                    <CLabel htmlFor="no_telp">Nomor Telp</CLabel>
                    <CInput id="no_telp" type="text" name="no_telp" placeholder="Nomor Telp" />
                  </CFormGroup>
                </CCol>
              </CFormGroup>
              <CFormGroup row className="my-0">
                <CCol xs="12">
                  <CFormGroup>
                    <CLabel htmlFor="alamat">Alamat Lengkap</CLabel>
                    <CTextarea id="alamat" name="alamat"></CTextarea>
                  </CFormGroup>
                </CCol>
              </CFormGroup>
            </CModalBody>
            <CModalFooter>
              <CButton
                color="secondary"
                onClick={() => this.setState({ modalCRUD: false })}
              >Cancel</CButton>
              <CButton color="primary" type="submit">Simpan data</CButton>{' '}

            </CModalFooter>
          </CForm>
        </CModal>
        <CModal
          show={modalEdit}
          onClose={() => this.setState({ modalEdit: false })}
        >
          <CModalHeader closeButton>
            <CModalTitle>{titleModal}</CModalTitle>
          </CModalHeader>
          <CForm className="resetPassword" onSubmit={this.handleSubmit}>
            <CModalBody>
              <CFormGroup>
                <CLabel htmlFor="username">Username</CLabel>
                <CInput id="username" type="text" disabled/>
              </CFormGroup>
              <CFormGroup row className="my-0">
                <CCol xs="12">
                  <CFormGroup>
                    <CLabel htmlFor="password">Password</CLabel>
                    <CInput id="password" type="text" name="password" placeholder="Password" />
                  </CFormGroup>
                </CCol>
              </CFormGroup>
            </CModalBody>
            <CModalFooter>
              <CButton
                color="secondary"
                onClick={() => this.setState({ modalEdit: false })}
              >Cancel</CButton>
              <CButton color="primary" type="submit">Reset Password</CButton>{' '}

            </CModalFooter>
          </CForm>
        </CModal>
      </>
    )
  }
}
