import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, Legend, Tooltip, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import axios from 'axios';
import '../barChart/barChart.css'

ChartJS.register(
    CategoryScale, LinearScale, BarElement,
    Legend, Tooltip
)

function BarChart() {
    // Api url
    const baseUrl = 'https://www.ris.gov.tw/rs-opendata/api/v1/datastore/ODRP019/109'

    // Taipei district
    const [district, setDistrict] = useState('松山區')
    // Taipei district list
    const [districtList, setDistrictList] = useState([])
    // 於chart內的資料  Taipei XX區 共同生活戶/獨立生活戶 的 男/女 資料
    const [getAreaData, setGetAreaData] = useState({
        man: [],
        female: []
    })
    // Taipei 共同生活戶/獨立生活戶 的 男/女 資料
    // {
    //    ordinaryMale: 0,    // 共同生活戶 男 (Api:household_ordinary_m, Api資料名稱:共同生活戶_男)
    //    singleMale: 0,      // 獨立生活戶 男 (Api:household_single_m, Api資料名稱:單獨生活戶_男)
    //    ordinaryFemale: 0,  // 共同生活戶 女 (Api:household_ordinary_f, Api資料名稱:共同生活戶_女)
    //    singleFemale: 0,    // 獨立生活戶 女 (Api:household_single_f, Api資料名稱:單獨生活戶_女)
    // }
    const [taipeiSiteMap, setTaipeiGetSiteMap] = useState(null)

    // chart data in Bar component
    const barData = {
        labels: ['共同生活戶', '獨立生活戶'],
        datasets: [
            {
                label: '男',
                data: getAreaData.man.map(data => data),
                backgroundColor: [
                    'rgba(29, 53, 87, 0.7)',
                    'rgba(29, 53, 87, 0.7)',
                ],
                maxBarThickness: 50

            }, {
                label: '女',
                data: getAreaData.female.map(data => data),
                backgroundColor: [
                    'rgba(230, 57, 70, 0.7)',
                    'rgba(230, 57, 70, 0.7)',
                ],
                maxBarThickness: 50
            },
        ], hover: true
    };
    // chart options in Bar component
    const barOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            y: {
                beginAtZero: true
            },
        },
        plugins: {
            legend: {
                position: 'bottom',
            },
        },
    }
    // 抓取api資料
    useEffect(() => {

        const districtMap = new Map()   // 利用map當唯一索引 key:台北市xx地區 value:戶口人數等資料
        // 抓取Api資料
        const fetchData = async () => {
            axios.get(`${baseUrl}`).then(response => {
                const allPopulationData = response.data.responseData
                for (const population of allPopulationData) {
                    if (population.site_id.includes('臺北市')) {  // 篩選資料 只要臺北市
                        let taipeiDistrict = population.site_id.replace('臺北市', '')  //  xx區
                        if (districtMap.has(taipeiDistrict)) { // 第一次後掃到xx區的資料  計算總數
                            const singleArea = districtMap.get(taipeiDistrict);
                            const newSingleArea = {
                                ordinaryMale: singleArea.ordinaryMale + Number(population.household_ordinary_m),
                                singleMale: singleArea.ordinaryMale + Number(population.household_single_m),
                                ordinaryFemale: singleArea.ordinaryFemale + Number(population.household_ordinary_f),
                                singleFemale: singleArea.singleFemale + Number(population.household_single_f)
                            }
                            districtMap.set(taipeiDistrict, newSingleArea)
                        }
                        else { // 第一次掃到xx區
                            setDistrictList(pre => [...pre, taipeiDistrict])  // 台北市所有的地區
                            districtMap.set(taipeiDistrict, {
                                ordinaryMale: Number(population.household_ordinary_m),
                                singleMale: Number(population.household_single_m),
                                ordinaryFemale: Number(population.household_ordinary_f),
                                singleFemale: Number(population.household_single_f)
                            })
                        }
                    }
                }
                setTaipeiGetSiteMap(districtMap)
            })
                .catch(error => console.log('error :', error))
        }
        fetchData()
    }, [])
    // chart顯示資料
    useEffect(() => {

        // 於chart內的資料 Taipei XX區 共同生活戶/獨立生活戶 的 男/女 資料
        const handleChartData = () => {
            if (taipeiSiteMap != null) {
                const singleDistrict = taipeiSiteMap.get(district)
                setGetAreaData({ man: [singleDistrict.ordinaryMale, singleDistrict.singleMale], female: [singleDistrict.ordinaryFemale, singleDistrict.singleFemale] })
            }
        }
        handleChartData()
    }, [taipeiSiteMap, district])

    return (
        <div className='barChartGroup'>
            <p className='title'>臺北市<span>{district}</span></p>
            <div className='chartGroup'>
                <div className='selectGroup'>
                    <p>地區 :</p>
                    <select name='districtName' onChange={(e) => setDistrict(e.target.value)}>
                        {
                            districtList.map(districtItem => (<option key={Math.random()} value={districtItem} >{districtItem}</option>))
                        }
                    </select>
                </div>
                <div className='chartItem'>
                    <Bar
                        data={barData}
                        options={barOptions}
                    />
                </div>
            </div>
        </div>
    )
}

export default BarChart