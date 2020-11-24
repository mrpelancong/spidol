import React from 'react'
import Swal from 'sweetalert2'
import {
  CButton,
  CCol,
  CForm,
  CFormGroup,
  CInput,
  CLabel, CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CTextarea
} from "@coreui/react";

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

export class ProsesPimpinan extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      error: null, id_data: null,
      itemsData: [], itemsUpload : [], listBerkasPengajuan : [],
      modalCRUD: false
    }
  }

  //setting datatables
  dataTable = () => {
    // console.log('SETTING DATATABLE >>');
    this.$el = $(this.el)
    this.$el.DataTable().destroy();
    let groupColumn = 1;
    this.$el.DataTable({
      "columnDefs": [
        { "visible": false, "targets": groupColumn }
      ],
      "order": [[ groupColumn, 'asc' ]],
      "displayLength": 25,
      "drawCallback": function ( settings ) {
        var api = this.api();
        var rows = api.rows( {page:'current'} ).nodes();
        var last=null;

        api.column(groupColumn, {page:'current'} ).data().each( function ( group, i ) {
          if ( last !== group ) {
            $(rows).eq( i ).before(
              '<tr class="group"><td class="font-weight-bold font-italic" colspan="6">'+group+'</td></tr>'
            );

            last = group;
          }
        } );
      }
    })
  }
  TBody = (props) => {
    if (props) {
      const listPengajuan = props.map((data, index) => {
          //cek file pengajuan
        return(
          <tr key={data.pengajuan.id}>
            <td>{data.pengajuan.nik}</td>
            <td>{(data.pengajuan.vendor != null ? data.pengajuan.vendor.nama_jenis : 'Vendor Loading ...')}</td>
            <td>{data.pengajuan.nama_lengkap}</td>
            <td>{(data.pengajuan.jenis != null ? data.pengajuan.jenis.nama_jenis : 'Loading Pekerjaan ...')}</td>
            <td>{data.pengajuan.tgl_pengajuan}</td>
            <td>
              <a className="btn btn-sm btn-success btn-block text-white mr-2" onClick={() => this.viewPengajuan(data.pengajuan.id)}> View Berkas </a>
            </td>
          </tr>
        )
        }
      );
      return (
        <tbody>
        {listPengajuan}
        </tbody>
      )
    }
  }
  loadData = (id_data = null) => {
    // console.log('Load Data >> '+id_data);
    let url;
    if (id_data == null) {
      url = "api/proses/";
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
          // console.log("hasil Requert api >> "+url);
          // console.log("hasil Requert >> ");
          // console.log(result.data);

          if (id_data == null) {
            this.setState({
              itemsData: result.data,
            });
            //load datatable
            this.dataTable();
          } else {
            // console.log("LOAD DATA DENGAN ID >> "+id_data);
            this.setState({itemsUpload: result.data});
            if (result.status) {
              // console.log(result.data);
              //send data to Form
              let keys = Object.keys(result.data);
              let value = Object.values(result.data);
              let arrBerkas = [];
              let berkasReq = ["surat_permohonan", "surat_pernyataan", "file_ktp", "file_biodata", "file_foto", "file_skck", "file_surat_sehat", "surat_bebas_narkoba", "file_pendukung"];
              for (let i = keys.length - 1; i >= 0; i--) {
                $("input[name='" + keys[i] + "']").val(value[i]);
                $("select[name='" + keys[i] + "']").val(value[i]);
                $("textarea[name='" + keys[i] + "']").val(value[i]);

                //costume pengolahan data
                if (berkasReq.includes(keys[i]) === true) {
                  let objectBerkas = {
                    "id" : i,
                    "nama_file" : keys[i],
                    "link_file" : value[i]
                  };

                  arrBerkas.push(objectBerkas);
                }
              }

              console.log("HASIL PENGECEKAN BERKAS >> "+arrBerkas);
              // optional data untuk jadi state
              this.setState({listBerkasPengajuan: arrBerkas});
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
  viewPengajuan = (id) => {
    // console.log('CHECK PENGAJUAN DETAIL >> '+id);
    this.setState({
      modalCRUD: true,
      id_data: id,
    });
    this.loadData(id);
  }
  async handleKonfirmasi(status=null)  {
    // console.log('Close Modal View >>');
    this.setState({modalCRUD:false})
    // console.log('Proses Pengajuan ID >> '+this.state.id_data);
    // console.log('Proses Pengajuan Status >> '+status);
    // let text;
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        confirmButton: 'btn btn-success',
        cancelButton: 'btn btn-danger'
      },
      buttonsStyling: false
    })
    if (status == 0) {
      const { value: text } = await Swal.fire({
        input: "textarea",
        title: 'Kenapa Pengajuan Ditolak?',
        inputPlaceholder: 'Masukan catatan ...',
        inputAttributes: {
          'aria-label': 'Type your message here'
        },
        showCancelButton: true
      })

      swalWithBootstrapButtons.fire({
        title: 'Konfirmasi Pengajuan?',
        text: (status == 0 ? 'Pengajuan Ditolak Karena '+ text : 'Pengajuan Disetujui' ),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Konfirmasi!',
        cancelButtonText: 'Batal !',
        reverseButtons: true,
      }).then((result) => {
        if (result.value) {
          this.konfirmasiPengajaun(status, text);
          this.setState({ modalHapus: false, id_data: null })
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalNotif(true, 'Pengajuan Belum Dikonfirmasi')
        }
        this.setState({id_data: null});
      })
    } else {
      swalWithBootstrapButtons.fire({
        title: 'Konfirmasi Pengajuan?',
        text: (status == 0 ? 'Pengajuan Ditolak': 'Pengajuan Disetujui' ),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Konfirmasi!',
        cancelButtonText: 'Batal !',
        reverseButtons: true,
      }).then((result) => {
        if (result.value) {
          this.konfirmasiPengajaun(status);
          this.setState({ modalHapus: false, id_data: null })
        } else if (result.dismiss === Swal.DismissReason.cancel) {
          swalNotif(true, 'Pengajuan Belum Dikonfirmasi')
        }
        this.setState({id_data: null});
      })
    } 

  }

  // fn - konfirmasi
  konfirmasiPengajaun = (status, catatan=null) => {
    fetch('api/proses/', {
      method: 'POST',
      headers: {
        'Authorization': "Bearer " + localStorage.token
      },
      body: new URLSearchParams({
        id: this.state.id_data,
        status: status,
        catatan : catatan
      })
    })
      .then(res => res.json())
      .then(
        (result) => {
          // console.log(result);
          swalNotif(result.status, result.message)
          this.loadData();
        },
        (error) => {
          // console.log(error);
        }
      )
  }
  componentDidMount() {
    this.loadData()
  }
  componentWillUnmount(){
    this.loadData()
  }
  render() {
    const { itemsData, modalCRUD } = this.state;
    return(
      <>
        <table width="100%" className="table table-striped table-bordered table-hover table-sm" ref={el => this.el = el}>
          <thead>
          <tr>
            <th>NIK</th>
            <th>Nama Vendor</th>
            <th>Nama Lengkap</th>
            <th>Pekerjaan</th>
            <th>Tgl</th>
            <th>Aksi</th>
          </tr>
          </thead>
          {this.TBody(itemsData)}
        </table>
        <CModal
          show={modalCRUD}
          onClose={() => this.setState({ modalCRUD: false })}
        >
          <CModalHeader closeButton>
            <CModalTitle>View Pengajuan Baru</CModalTitle>
          </CModalHeader>
          <CForm >
            <CModalBody>
              <CFormGroup>
                <CLabel htmlFor="nik">NIK</CLabel>
                <CInput id="nik" type="text" name="nik" placeholder="Nomor Induk Kependudukan" disabled />
              </CFormGroup>
              <CFormGroup row className="my-0">
                <CCol xs="6">
                  <CFormGroup>
                    <CLabel htmlFor="nama_lengkap">Nama Lengkap</CLabel>
                    <CInput id="nama_lengkap" type="text" name="nama_lengkap" placeholder="Nama Lengkap" disabled />
                  </CFormGroup>
                </CCol>
                <CCol xs="6" className="pl-0">
                  <CFormGroup>
                    <CLabel htmlFor="no_telp">Nomor Telp</CLabel>
                    <CInput id="no_telp" type="text" name="no_telp" placeholder="Nomor Telp" disabled />
                  </CFormGroup>
                </CCol>
                <CCol xs="12" >
                  <CFormGroup>
                    <CLabel htmlFor="alamat">Alamat Lengkap</CLabel>
                    <CTextarea id="alamat" name="alamat" disabled></CTextarea>
                  </CFormGroup>
                </CCol>
                <CCol xs="12" >
                  <table width="100%" className="table table-striped table-bordered table-hover table-sm">
                    <thead>
                    <tr>
                      <th width="15px">No</th>
                      <th>Nama Berkas</th>
                      <th>Aksi</th>
                    </tr>
                    </thead>
                    <tbody>
                    {this.state.listBerkasPengajuan.map((data, i) =>
                      {
                        let actDownload;
                        if (data.link_file != null ){
                          actDownload = (
                            <a href={data.link_file} target="_blank">Download File</a>
                          )
                        } else {
                          actDownload = "File Tidak Ada";
                        }
                        return (
                          <tr key={data.id}>
                            <td>{i+1}</td>
                            <td>{data.nama_file}</td>
                            <td>
                              {actDownload}
                            </td>
                          </tr>
                        )
                      }
                    )}
                    </tbody>
                  </table>
                </CCol>
              </CFormGroup>
            </CModalBody>
            <CModalFooter>
              <CButton
                color="success"
                onClick={() => this.handleKonfirmasi('1')}
              >Setujui Pengajuan</CButton>
              <CButton
                color="danger"
                onClick={() => this.handleKonfirmasi('0')}
              >Tolak Pengajuan</CButton>
              <CButton
                color="secondary"
                onClick={() => this.setState({ modalCRUD: false, id_data: null })}
              >Close View</CButton>
            </CModalFooter>
          </CForm>
        </CModal>
      </>
    )
  }
}
