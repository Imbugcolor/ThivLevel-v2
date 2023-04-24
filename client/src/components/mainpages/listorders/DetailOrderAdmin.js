import axios from 'axios'
import React, { useState, useEffect, useContext, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { GlobalState } from '../../../GlobalState'
import { toast } from 'react-toastify'
import LocationForm from '../utils/address/LocationForm'
import { FaEdit } from 'react-icons/fa'
import ChangePhoneModal from '../utils/modal/ChangePhoneModal'
import moment from 'moment'
import CodLogo from '../../../images/cod-logo.webp'
import VisaLogo from '../../../images/visa-logo.png'

function DetailOrderAdmin() {
    const params = useParams()
    const state = useContext(GlobalState)
    const [orders] = state.ordersAPI.orders
    const [token] = state.token
    const [detailOrder, setDetailOrder] = useState([])
    const [statusOrder, setStatusOrder] = useState('')
    const [callback, setCallback] = state.ordersAPI.callback
    const [address, setAddress] = useState('')
    const addressRef = useRef()
    const [currentPhone, setCurrentPhone] = useState(false)

    useEffect(() => {
        if (params.id) {
            orders.forEach(order => {
                if (order._id === params.id) {
                    setDetailOrder(order)
                    setStatusOrder(order.status)
                    setAddress(order.address || '')
                }
            })
        }
    }, [params.id, orders])

    const handleChangeSatus = (e) => {
        setStatusOrder(e.target.value)
    }

    const HandleSubmitChangeStatus = async () => {
        try {
            if (!detailOrder.isPaid && statusOrder === 'Delivered') {
                await axios.put(`/api/payment/changestatus/${detailOrder._id}/`, { isPaid: true, status: statusOrder }, {
                    headers: { Authorization: token }
                })
                toast.success('Order is delivered successfully')
                setCallback(!callback)
                return;
            }
            await axios.patch(`/api/payment/changestatus/${detailOrder._id}/`, { status: statusOrder }, {
                headers: { Authorization: token }
            })

            toast.success('Order status is changed')

            setCallback(!callback)
        } catch (err) {
            alert(err.response.data.msg)
        }
    }

    const handleChangeAddress = () => {
        addressRef.current.classList.add('active')
    }

    const HandleSubmitAddress = async (address) => {
        try {
            await axios.patch(`/api/payment/changeaddress/${detailOrder._id}`, { address }, {
                headers: { Authorization: token }
            })

            toast.success('Order address is changed')

            setCallback(!callback)
        } catch (err) {
            toast.error(err.response.data.msg)
        }
    }

    const handleChangePhone = (phone) => {
        const viewbox = document.querySelector('.order-phone-change-box')
        viewbox.classList.toggle('active')
        setCurrentPhone(phone)
    }

    return (
        <div>
            <div className='content-header'>
                <h2>Chi tiết đơn hàng</h2>
            </div>
            <div className='content-body'>
                <div className='order-detail-wrapper'>
                    <div className='order-detail-header'>
                        <div className='order-id-status'>
                            <h1>ĐƠN HÀNG <span style={{ textTransform: 'uppercase', fontWeight: '500'}}>{'#' + detailOrder._id}</span></h1>
                            <p>TRẠNG THÁI: <span>{detailOrder.status}</span></p>
                            <p>THANH TOÁN: <span>{detailOrder.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</span></p>                           
                        </div>
                        <div className='change-order-status'>
                            <select name="status" value={statusOrder} onChange={handleChangeSatus} style={{ borderRight: 'none' }}>

                                <option value="Pending">
                                    Đang chờ
                                </option>

                                <option value="Processing">
                                    Đang xử lý
                                </option>

                                <option value="Shipping">
                                    Đang giao
                                </option>

                                <option value="Delivered">
                                    Đã giao
                                </option>

                                <option value="Cancel">
                                    Hủy
                                </option>

                            </select>

                            <button className='save-status' onClick={HandleSubmitChangeStatus}>Lưu</button>
                        </div>
                        <div className='order-name-address'>
                            <h1>{detailOrder.name}</h1>
                            <p>{detailOrder.address?.address_line_1 ? ` ${detailOrder.address?.address_line_1}, ${detailOrder.address?.admin_area_2}` :
                                ` ${(detailOrder.address?.detailAddress || '')} ${detailOrder.address?.ward?.label}, 
                            ${detailOrder.address?.district?.label}, ${detailOrder.address?.city?.label}`}
                            </p>
                            <a href="#!"
                                onClick={handleChangeAddress}>
                                <FaEdit style={{ color: '#9e9e9e', cursor: 'pointer' }} />
                            </a>
                            <div className="address-form text-start" ref={addressRef}>
                                <LocationForm element={"address-form"} onSave={(address) => HandleSubmitAddress(address)} initAddress={detailOrder.address?.city ? detailOrder.address : ''} />
                            </div>
                        </div>
                    </div>
                    <div className='order-detail-body'>
                        <div className='date-order'>
                            <label>NGÀY TẠO</label>
                            <p>{new Date(detailOrder.createdAt).toLocaleDateString()}</p>
                            <span>{moment(detailOrder.createdAt).format('LT')}</span>
                        </div>
                        <div className='date-order'>
                            <label>CẬP NHẬT LẦN CUỐI:</label>
                            <p>{new Date(detailOrder.updatedAt).toLocaleDateString()}</p>
                            <span>{moment(detailOrder.updatedAt).format('LT')}</span>
                        </div>
                        <div className='id-order'>
                            <label>MÃ ĐƠN</label>
                            <p style={{ textTransform: 'uppercase' }}>{detailOrder._id}</p>
                        </div>
                        <div className='phone-number-order'>
                            <label>SỐ ĐIỆN THOẠI</label>
                            <div style={{ textAlign: 'right' }}>
                                <p>+84 {detailOrder.phone ? detailOrder.phone : 'NO'}</p>
                                <a href="#!" onClick={() => handleChangePhone(detailOrder)}>
                                    <FaEdit style={{ color: '#9e9e9e', cursor: 'pointer' }} />
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className='list-product-order'>
                        <table className="oder-product-list-table">
                            <thead className="table-header">
                                <tr>
                                    <th>STT</th>
                                    <th>SẢN PHẨM</th>
                                    <th>SIZE/MÀU</th>
                                    <th>SỐ LƯỢNG</th>
                                    <th>GIÁ</th>
                                    <th>TỔNG CỘNG</th>
                                </tr>
                            </thead>
                            <tbody className="table-body">
                                {
                                    detailOrder.cart?.map((item, index) => {
                                        if (item.quantity > 0) {
                                            return (
                                                <tr key={index}>
                                                    <td>{index + 1}</td>
                                                    <td>
                                                        <div className='table-product-column'>
                                                            <img className='table-thumbnail-product' src={item.images[0].url} alt='hinh'></img>
                                                            <span style={{ marginLeft: 5}} >{item.title}</span>
                                                        </div>
                                                    </td>
                                                    <td className='table-product-column'>
                                                        <span>{item.size} - </span>
                                                        <div style={{ backgroundColor: `${item.color}`, width: '15px', height: '15px', border: '1px solid #ccc' }}></div>
                                                    </td>
                                                    <td className='table-quantity'>{item.quantity}</td>
                                                    <td className='table-item-price'>${item.price}</td>
                                                    <td className='table-amount'>${(item.quantity * item.price).toFixed(2)}</td>
                                                </tr>
                                            )
                                        } else return null
                                    })
                                }
                            </tbody>
                        </table>
                    </div>
                    <div className='payment-detail-order'>
                        <div className='method'>
                            <label>PHƯƠNG THỨC THANH TOÁN</label>
                            <div className='payment__detail_' style={{ display: 'flex', alignItems: 'center'}}>
                                <img src={
                                    detailOrder.method === 'Online' ? VisaLogo : CodLogo
                                } style={{ marginRight: '10px', height: '45px' }}/>
                                <span>
                                {
                                    detailOrder.method === 'Online' && detailOrder.isPaid === true ? 
                                    `Đã thanh toán: ${new Date(detailOrder.createdAt).toLocaleDateString() + ' ' + moment(detailOrder.createdAt).format('LT')}` :
                                    detailOrder.method === 'COD' && detailOrder.isPaid === true ? 
                                    `Đã thanh toán: ${new Date(detailOrder.updatedAt).toLocaleDateString() + ' ' + moment(detailOrder.updatedAt).format('LT')}` :
                                    'Chưa thanh toán'
                                }
                                </span>
                            </div>
                            {detailOrder.paymentID ? <span>MÃ THANH TOÁN: {detailOrder.paymentID}</span> : ''}
                        </div>
                        <div className='shipping-cost'>
                            <label>PHÍ VẬN CHUYỂN</label>
                            <p>$ 0</p>
                        </div>
                        <div className='discount'>
                            <label>GIẢM GIÁ</label>
                            <p>$ 0</p>
                        </div>
                        <div className='total-amount'>
                            <label>TỔNG THANH TOÁN</label>
                            <p>${detailOrder.total}</p>
                        </div>
                    </div>
                </div>
                <div className="order-phone-change-box">
                    {currentPhone && <ChangePhoneModal phoneOrder={currentPhone} callback={callback} setCallback={setCallback} token={token} />}
                </div>
            </div>
        </div>
    )
}

export default DetailOrderAdmin
