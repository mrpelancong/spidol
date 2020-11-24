import React, { Component } from 'react'
import Chart from "chart.js";
import {
    CProgress
} from "@coreui/react"
// import classes from "./LineGraph.module.css";

export class Line extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataPengajuan : [], labels : [], dataSets : [], data_tmp : [],
            isLoading : true, statusData : true, isunMounted : this.props.isunMounted
        }
    }
    
    chartRef = React.createRef();
    
    loadData = () => {
        fetch("api/pengajuan/", {
            method: 'GET',
            headers: {
                'Content-type': 'application/json',
                'Authorization': "Bearer " + localStorage.token
            },
        })
            .then(res => res.json())
            .then(
                (result) => {
                    // console.log(result);
                    this.setState({
                        dataPengajuan : result.data
                    })
                    let data_state_cek = [];
                    // --------------------
                    let groups_bulan_all    = [];
                    let bulan_tmp    = [];
                    let jum_pengajuan_all   = {};
                    let jum_pengajuan_acc       = {};
                    let jum_pengajuan_ditolak   = {};
                    let jum_pengajuan_proses    = {};
                    let jum_pengajuan_baru      = {};
                    // -----------------------------------
                    let arr_baru = [];
                    let arr_acc = [];
                    let arr_ditolak = []; 
                    let arr_proses = [];
                    let arr_all = [];
                    // -------------------------
                    let bulan_tmp_all       = [];
                    let bulan_master = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];
                    
                    result.data.map((data, i) => {
                        // console.log(data.tgl_pengajuan)
                        let tanggal = new Date(data.tgl_pengajuan);
                        let bulan = tanggal.getMonth()
                        // console.log(bulan)
                        // -----------------------------------------
                        bulan_tmp_all.push(bulan)
                        jum_pengajuan_all[bulan] = (jum_pengajuan_all[bulan]||0) + 1;
                        if (bulan_tmp.includes(bulan) === false) {
                            bulan_tmp.push(bulan)
                        }
                        if (data.status_pengajuan == 0) {
                            jum_pengajuan_baru[bulan]   = (jum_pengajuan_baru[bulan]||0) + 1;
                        }
                        if (data.status_pengajuan == 1) {
                            jum_pengajuan_proses[bulan] = (jum_pengajuan_proses[bulan]||0) + 1;
                        }
                        if (data.status_pengajuan == 2) {
                            jum_pengajuan_acc[bulan]    = (jum_pengajuan_acc[bulan]||0) + 1;
                        }
                        if (data.status_pengajuan == 3) {
                            jum_pengajuan_ditolak[bulan] = (jum_pengajuan_ditolak[bulan]||0) + 1;
                        }
                    })

                    bulan_tmp.sort()
                    bulan_tmp.forEach(element => {
                        groups_bulan_all.push(bulan_master[element])
                        arr_baru.push((jum_pengajuan_baru[element] ? jum_pengajuan_baru[element] : 0))
                        data_state_cek.push((jum_pengajuan_baru[element] ? jum_pengajuan_baru[element] : 0))
                        // -----
                        arr_proses.push((jum_pengajuan_proses[element] ? jum_pengajuan_proses[element] : 0))
                        data_state_cek.push((jum_pengajuan_proses[element] ? jum_pengajuan_proses[element] : 0))
                        // -----
                        arr_acc.push((jum_pengajuan_acc[element] ? jum_pengajuan_acc[element] : 0))
                        data_state_cek.push((jum_pengajuan_proses[element] ? jum_pengajuan_proses[element] : 0))
                        // -----
                        arr_ditolak.push((jum_pengajuan_ditolak[element] ? jum_pengajuan_ditolak[element] : 0))
                        data_state_cek.push((jum_pengajuan_ditolak[element] ? jum_pengajuan_ditolak[element] : 0))
                        // -----
                        arr_all.push((jum_pengajuan_all[element] ? jum_pengajuan_all[element] : 0))
                        data_state_cek.push((jum_pengajuan_all[element] ? jum_pengajuan_all[element] : 0))
                    });

                    let datasets = [
                        {
                            label: "Data Pengajuan Keseluruhan",
                            data: arr_all,
                            backgroundColor: 'rgba(75,192,192,0.4)',
                            borderColor: 'rgba(75,192,192,1)',
                        },
                        {
                            label: "Data Pengajuan Baru",
                            data: arr_baru,
                            backgroundColor: 'rgba(206,210,216,0.4)',
                            borderColor: 'rgba(206,210,216,1)',
                        },
                        {
                            label: "Data Pengajuan Proses",
                            data: arr_proses,
                            backgroundColor: 'rgba(0,123,255,0.4)',
                            borderColor: 'rgba(0,123,255,1)',
                        },
                        {
                            label: "Data Pengajuan ACC",
                            data: arr_acc,
                            backgroundColor: 'rgba(40,167,69,0.4)',
                            borderColor: 'rgba(40,167,69,1)',
                        },
                        {
                            label: "Data Pengajuan Ditolak",
                            data: arr_ditolak,
                            backgroundColor: 'rgba(214,22,22,0.4)',
                            borderColor: 'rgba(214,22,22,1)',
                        }
                    ]
                    // ---- buat state
                    
                    let dataNow = this.state.data_tmp;
                    this.setState({
                        labels      : groups_bulan_all, 
                        dataSets    : datasets,
                        data_tmp    : data_state_cek,
                        statusData  : (dataNow.toString() === data_state_cek.toString() ? false : true),
                    })

                    // -- Kirim ke grafik FN
                    // this.grafik(groups_bulan_all, datasets)
                    
                    // console.log(arr_baru)
                    console.log(dataNow)
                },
                (error) => {
                    this.setState({
                        error
                    });
                }
            )
    }
    grafik = (labels, datasets) => {
        const myChartRef = this.chartRef.current.getContext("2d");
        console.log(this.state.labels);
        console.log(this.state.dataSets);
        new Chart(myChartRef, {
            type: "bar",
            data: {
                //Bring in data
                labels: this.state.labels,
                datasets: this.state.dataSets
            },
            options: {
                //Customize chart options
            }
        });
    }
    componentDidMount() {
        this.loadData();
        this.timerID = setInterval(
            () => {
                this.loadData();
                // console.log(this.state.statusData)
                // console.log(this.state.data_tmp.toString())
                if (this.state.statusData) {
                    this.grafik();
                    this.setState({
                        isLoading : false,
                    })
                }
            },
            1000
        );
    }
    componentWillUnmount() {
        clearInterval(this.timerID);
        this.loadData()
        // console.log(this.state.isunMounted)
        // if (this.state.isunMounted) {
        //     this.setState({
        //         dataPengajuan : [], labels : [], dataSets : [], data_tmp : [],
        //         isLoading : true, statusData : true, 
        //     })
        // }
    }

    render() {
        return (
            <div className="container">
                {this.state.isLoading ?
                    <CProgress animated value={100} className="mb-3" />
                    :
                    null    
                }
                <canvas
                    id="myChart"
                    ref={this.chartRef}
                />
            </div>
        )
    }
}

export default Line