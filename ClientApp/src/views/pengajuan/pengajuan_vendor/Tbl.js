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
  CModalTitle, CWidgetIcon
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
      //console.log('Cek Open');
    },
    onClose: (toast) => {
      //console.log('Cek Close');
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
      listBerkasPengajuan : [],
      modalView: false,
      id_data: null,
    }
  }

  TBody = (items, dataUser) => {
    // console.log('Cek AKses ID '+ dataUser.akses)
      const listPengajuan = items.map((data, index) =>
      {
        if (dataUser != null) {
          if (dataUser.id === data.vendor.id && data.status_pengajuan != 0){
            let x = 1;
            let pengajuan;
            if (data.status_pengajuan == 0) {
              pengajuan = 'Pengajuan Baru';
            } else if (data.status_pengajuan == 1) {
              pengajuan = 'Pengajuan Diproses';
            } else if (data.status_pengajuan == 2) {
              pengajuan = 'Pengajuan Disetujui';
            } else if (data.status_pengajuan == 3) {
              pengajuan = 'Pengajuan Ditolak';
            } else {
              pengajuan = 'Loading data ...';
            }
            //cek file pengajuan
            let OptionUpload;
            if (data.surat_permohonan != null && data.surat_pernyataan != null && data.file_ktp != null && data.file_biodata != null && data.file_foto != null && data.file_skck != null && data.file_surat_sehat != null && data.surat_bebas_narkoba != null && data.file_pendukung != null){
               OptionUpload = (
                <a className="btn btn-sm btn-success btn-block text-white mr-2 disabled"> Berkas Telah Diupload </a>
              )
            } else {
              OptionUpload = (
                <a className="btn btn-sm btn-warning btn-block text-white mr-2" onClick={() => this.openUpload(data.id)}> Upload Berkas </a>
              )
            }

            return (
              <tr key={data.id}>
                <td>{data.nama_lengkap}</td>
                <td>{data.jenis.nama_jenis}</td>
                <td>{data.nik}</td>
                <td>{data.tgl_pengajuan}</td>
                <td>{pengajuan}</td>
                <td>
                  {OptionUpload}
                </td>
                <td>
                  <a className="btn btn-sm btn-success btn-block text-white mr-2" onClick={() => this.viewPengajuan(data.id)}> View Pengajuan </a>
                </td>
              </tr>
            )
          }
        }
      }
        )
    return (
      <tbody>
      {listPengajuan}
      </tbody>
    )
  }
  dataTable = () => {
    //console.log('SETTING DATATABLE >>');
    this.$el = $(this.el)
    this.$el.DataTable().destroy()
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
  loadData = (id_data = null) => {
    //console.log('Load Data');
    let url;
    if (id_data == null) {
      url = "api/pengajuan/";
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
          //console.log(result);
          if (id_data == null) {
            if (result.status) {
              this.setState({
                itemsData: result.data,
              });
            } else {
              this.setState({
                itemsData: [],
              });
            }
            this.dataTable();
          } else {
            if (result.status) {
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

              //console.log("HASIL PENGECEKAN BERKAS >> "+arrBerkas);
              // optional data untuk jadi state
              this.setState({listBerkasPengajuan: arrBerkas});
            } else {
              setTimeout(function () {
                this.setState({ modalView: false, id_data: null })
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
    //console.log(id);
    this.setState({
      modalView: true,
      id_data: id,
    });
    this.loadData(id);
  }
  componentDidMount() {
    this.loadData()
  }

  render() {
    const { itemsData, modalView, listBerkasPengajuan } = this.state;
    let dataUser = JSON.parse(localStorage.getItem('detail_login'));

    return (
      <>
        <table width="100%" className="table table-striped table-bordered table-hover table-sm" ref={el => this.el = el}>
          <thead>
          <tr>
            <th>Nama Lengkap</th>
            <th>Pekerjaan</th>
            <th>NIK</th>
            <th>Tanggal Pengajuan</th>
            <th>Status</th>
            <th>Data</th>
            <th>Aksi</th>
          </tr>
          </thead>
          {this.TBody(itemsData, dataUser)}
        </table>

        <CModal
          show={modalView}
          onClose={() => this.setState({ modalView: false })} >
          <CModalHeader closeButton>
            <CModalTitle>View Pengajuan Berkas</CModalTitle>
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
                    {/* <CLabel htmlFor="alamat">Alamat Lengkap</CLabel>
                    <CTextarea id="alamat" name="alamat" disabled></CTextarea> */}
                    <CLabel htmlFor="tgl_lahir">Tanggal Lahir</CLabel>
                    <CInput id="tgl_lahir" type="text" name="tgl_lahir" disabled />
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
                    {listBerkasPengajuan.map((data, i) =>
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
                color="secondary"
                onClick={() => this.setState({ modalView: false })}
              >Close View</CButton>
            </CModalFooter>
          </CForm>
        </CModal>
      </>
    )
  }
}
