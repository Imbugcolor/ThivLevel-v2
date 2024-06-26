import React, { useState, useEffect, useContext } from 'react'
import { useParams } from 'react-router-dom'
import { GlobalState } from '../../../GlobalState'
import { toast } from 'react-toastify'
import axios from 'axios'
import moment from 'moment'
import Loading from '../utils/loading/Loading'
import CodLogo from '../../../images/cod-logo.webp'
import Visa from '../../../images/visa.png'
import Mastercard from '../../../images/mastercard.png'
import Jcb from '../../../images/jcb.png'
import Eftpos_au from '../../../images/eftpos_au.png'
import Diners from '../../../images/diners.png'
import Discover from '../../../images/discover.png'
import Amex from '../../../images/amex.png'
import Unionpay from '../../../images/unionpay.png'
import LoadingGIF from '../../../images/loading.gif'
import { IoTrashBin } from 'react-icons/io5'
import Swal from 'sweetalert2'
import ReviewModal from '../utils/modal/ReviewModal'

function OrderDetails() {
    const state = useContext(GlobalState)
    const [history] = state.userAPI.history
    const [token] = state.token
    const [products] = state.productsAPI.allProducts
    const [user] = state.userAPI.user
    const [orderDetails, setOrderDetails] = useState([])
    const [loading, setLoading] = useState(false)
    const [callback, setCallback] = useState(false)
    const [cardType, setCardType] = useState('')
    const [item, setItem] = useState(false)
    const [openReviewModal, setOpenReviewModal] = useState(false)
    const [reviewed, setReviewed] = useState([])
    const params = useParams()

    useEffect(() => {
        if (params.id) {
            if (token) {
                const getHistory = async () => {
                    setLoading(true)
                    const res = await axios.get(`/user/history`, {
                        headers: { Authorization: token }
                    })                     
                    res.data.forEach(item => {
                        if (item._id === params.id) {
                            setOrderDetails(item)  
                            if (item.paymentID) {
                                const getCardType = async () => {
                                    try {
                                        const res = await axios.get(`/api/payment/getCardType/${item.paymentID}`, {
                                            headers: { Authorization: token }
                                        })
                                        setCardType(res.data.cardType)
                                    } catch (err) {
                                        console.log(err.response.data.msg)
                                    }
                                    
                                }
                                getCardType() 
                            }
                            if(item.status === 'Delivered') {
                                let reviewedArray = []
                                item.cart.map(it => {
                               
                                    const alreadyReviewed = products.find(p => p.product_id === it.product_id)?.reviews?.find(
                                        (r) => r.user?._id?.toString() === user?._id?.toString()
                                    )

                                    if(alreadyReviewed){
                                        reviewedArray.push(it.product_id)                         
                                    }
                                })
                                setReviewed(reviewedArray)
                            }
                        }                 
                    })
                    setLoading(false)              
                }
                getHistory()
            }
        }
    }, [params.id, history, callback, products])


    const swalConfirmButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn-ok',
          cancelButton: 'btn-cancel-swal btn-mg-r'
        },
        buttonsStyling: false
    })

    const handleCancelOrder = async () => {     
        swalConfirmButtons.fire({
            title: `<span class='title-msg-dialog'>Hủy đơn hàng này?</span>`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Có',
            cancelButtonText: 'Không',
            reverseButtons: true
          }).then(async(result) => {
            if (result.isConfirmed) {
                try {
                    await axios.patch(`/api/payment/cancel/${orderDetails._id}`, { cancel: 'Cancel' }, {
                        headers: { Authorization: token }
                    })

                    swalConfirmButtons.fire(
                    `<span class='title-msg-dialog'>Đơn hàng đã được hủy.</span>`,
                    '',
                    'success'
                    )

                    setCallback(!callback)
                } catch (err) {
                    swalConfirmButtons.fire(
                        `<span class='title-msg-dialog'>${err.response.data.msg}</span>`,
                        '',
                        'error'
                      )
                }              
            } else if (
              /* Read more about handling dismissals below */
              result.dismiss === Swal.DismissReason.cancel
            ) {
                swalConfirmButtons.fire(
                `<span class='title-msg-dialog'>Không hủy đơn hàng.</span>`,
                '',
                'error'
                )
            }
          })
    }

    const handleReviewClick = (item) => {
        setItem(item)
        setOpenReviewModal(true)
    }

    if (orderDetails.length === 0) return null;
    return (
        loading ? <div><Loading /></div> :
        <div className="history-page res-row">
            <div className="order-infor-container col l-12 m-12 c-12">
                <div className='order__infor_heading'>
                    <h3>Chi tiết đơn hàng</h3>
                    <p>Ngày đặt: {new Date(orderDetails.createdAt).toLocaleDateString() + ' ' + moment(orderDetails.createdAt).format('LT')}</p>
                </div>
            </div>

            <div className="order-detail col l-12 m-12 c-12">
                <div className="res-row">
                    <div className='list-product-order-client col l-8 m-12 c-12'>
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
                                    orderDetails.cart?.map((item, index) => {
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
                                                    <td className='table-product-column flx-center'>
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
                    <div className='pay-infor-wrapper col l-4 m-12 c-12'>
                        <div className="heading__pay-infor">
                            <div>Mã đơn</div>
                            <div style={{ textTransform: 'uppercase', wordBreak: 'break-word', color: '#555' }}>{'#'+ orderDetails._id}</div>
                        </div>
                        <div className="pay-infor">                              
                            <div className="item">
                                <div>Ngày đặt</div>
                                <div style={{ textTransform: 'uppercase', wordBreak: 'break-word', color: '#555' }}>{new Date(orderDetails.createdAt).toLocaleDateString()} {moment(orderDetails.createdAt).format('LT')}</div>
                            </div>
                            <div className="divider"></div>
                            <div className="item">
                                <div>Tổng cộng</div>
                                <div>${orderDetails.total.toFixed(2)}</div>
                            </div>
                            <div className="item">
                                <div>Phí vận chuyển</div>
                                <div>$0.00</div>
                            </div>
                            <div className="item">
                                <div>Phương thức thanh toán</div>
                                <div>{orderDetails.method}</div>
                            </div>
                            <div className="divider"></div>
                            <div className="item fw600">
                                <div>Tổng thanh toán</div>
                                <div style={{ color: '#d93938' }}>${orderDetails.total.toFixed(2)}</div>
                            </div>                    
                        </div>
                        
                    </div>
                </div>
                <div className='order__bottom_info res-row'>
                    <div className='customer__order_infor box-style_infor col l-3 m-6 c-12'>
                        <span className='heading__box'>Thông tin khách hàng</span>
                        <div className='box-detail_infor'>
                            <p>Tên: {orderDetails.address.recipient_name || orderDetails.name}</p>
                            <p>Email: {orderDetails.email}</p>
                            <p>Số điện thoại: +84 {orderDetails.phone}</p>
                        </div>
                    </div>
                    <div className='shipping__order_infor box-style_infor col l-3 m-6 c-12'>
                        <span className='heading__box'>Thông tin giao hàng</span>
                        <div className='box-detail_infor'>
                            <span>Địa chỉ nhận hàng: </span>
                            <span>
                                {
                                    orderDetails.method === 'Paypal' ? ` ${orderDetails.address.address_line_1}, ${orderDetails.address.admin_area_2}` :
                                        ` ${(orderDetails.address.detailAddress || '')} ${orderDetails.address.ward.label}, ${orderDetails.address.district.label}, ${orderDetails.address.city.label}`
                                }
                            </span>
                        </div>
                    </div>
                    <div className='billing__order_infor box-style_infor col l-3 m-6 c-12'>
                        <span className='heading__box'>Thông tin thanh toán</span>
                        <div className='box-detail_infor'>
                            <span>
                                {
                                    orderDetails.method === 'Online' ? 'Online' : 'Thanh toán khi nhận hàng'
                                }
                            </span>
                            
                            <div className='payment__detail_'>
                                <img src={
                                    orderDetails.method === 'COD' ? CodLogo : cardType === 'visa' ? Visa :
                                    cardType === 'mastercard' ? Mastercard : cardType === 'jcb' ?  
                                    Jcb : cardType === 'amex' ? Amex :  cardType === 'diners' ? 
                                    Diners :  cardType === 'discover' ? Discover : cardType === 'eftpos_au' ? 
                                    Eftpos_au : cardType === 'unionpay' ? Unionpay : LoadingGIF
                                }/>
                                <span>
                                {
                                    orderDetails.method === 'Online' && orderDetails.isPaid === true ? 
                                    `Đã thanh toán: ${new Date(orderDetails.createdAt).toLocaleDateString() + ' ' + moment(orderDetails.createdAt).format('LT')}` :
                                    orderDetails.method === 'PAYPAL_CREDIT_CARD' && orderDetails.isPaid === true ? 
                                    `Đã thanh toán: ${new Date(orderDetails.createdAt).toLocaleDateString() + ' ' + moment(orderDetails.createdAt).format('LT')}` :
                                    orderDetails.method === 'COD' && orderDetails.isPaid === true ? 
                                    `Đã thanh toán: ${new Date(orderDetails.updatedAt).toLocaleDateString() + ' ' + moment(orderDetails.updatedAt).format('LT')}` :
                                    'Chưa thanh toán'
                                }
                            </span>
                            </div>
                        </div>
                    </div>
                    <div className='status__order_infor box-style_infor col l-3 m-6 c-12'>
                        <span className='heading__box'>Trạng thái đơn hàng</span>
                        <div className='box-detail_infor'>
                            {
                                orderDetails.status === 'Pending' ?

                                <span style={{color: '#5e77bd', padding: '10px', fontSize: '14px', fontWeight: '500', border: '1px solid'}}>
                                    Đang chờ xử lý
                                </span> : orderDetails.status === 'Processing'  ?  
                                <span style={{color: '#5e77bd', padding: '10px', fontSize: '14px', fontWeight: '500', border: '1px solid'}}>
                                    Đang xử lý
                                </span>  :  orderDetails.status === 'Shipping'  ?  
                                <span style={{color: '#d16704', padding: '10px', fontSize: '14px', fontWeight: '500', border: '1px solid'}}>
                                    Đang giao hàng
                                </span>  :  orderDetails.status === 'Delivered' ?
                                <span style={{color: '#0d9b25', padding: '10px', fontSize: '14px', fontWeight: '500', border: '1px solid'}}>
                                    Đã giao hàng
                                </span> : 
                                <span style={{color: '#d93131', padding: '10px', fontSize: '14px', fontWeight: '500', border: '1px solid'}}>
                                    Đã hủy
                                </span>

                            }                       
                        </div>
                        <div className='bottom__box'>
                        {
                            orderDetails.status === 'Delivered' ? 
                            null :
                            orderDetails.status === 'Processing' || orderDetails.status === 'Shipping' || orderDetails.status === 'Cancel' ?                    
                            <div className='cancel-order-disabled'>
                                <button onClick={handleCancelOrder} className='disabled-btn' disabled><IoTrashBin /> Hủy đơn hàng</button>
                            </div> :
                            <div className='cancel-order'>
                                <button onClick={handleCancelOrder} ><IoTrashBin /> Hủy đơn hàng</button>
                            </div> 
                          
                        } 
                        </div>
                    </div>
                    {
                    orderDetails.status === 'Delivered' && 
                    <div className='review_feedback status__order_infor box-style_infor col l-3 m-6 c-12'>
                        <span className='heading__box'>Đánh giá sản phẩm</span>
                        {
                            orderDetails.cart?.map((item, index) => (
                                <div className='item__feedback box-detail_infor' key={index}>
                                    <img src={item.images[0].url} className='item__img'/>
                                    <div className='item__detail'>
                                        <p>{item.title}</p>
                                        <div style={{ backgroundColor: `${item.color}`}} className='item__color '></div>
                                        <span>/</span>
                                        <span>{item.size}</span>
                                        {
                                            reviewed.includes(item.product_id) ? 
                                            <button 
                                                className='reviewed-btn'>
                                                    Đã đánh giá
                                            </button> 
                                            : <button 
                                                onClick={() => handleReviewClick(item)} 
                                                className='review-btn'>Đánh giá
                                             </button>
                                        }
                                    </div>        
                                </div>
                            )) 
                        }                  
                    </div>
                    }
                </div>
                
            </div>
            {
                (item && openReviewModal) &&
                <ReviewModal 
                    item={item} 
                    setOpenReviewModal={setOpenReviewModal}
                />
            }
        </div>
    )
}

export default OrderDetails