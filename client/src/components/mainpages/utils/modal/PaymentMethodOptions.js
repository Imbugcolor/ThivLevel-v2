import React, { useContext, useEffect, useState } from 'react'
import { GlobalState } from '../../../../GlobalState'
import axios from 'axios'
import { FaRegTimesCircle } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import CodIcon from '../../../../images/cod_icon.PNG'
import StripeIcon from '../../../../images/stripe.png'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'
import Swal from 'sweetalert2'

function PaymentMethodOptions({ cart, codSuccess, address, detail}) {
    const state = useContext(GlobalState)
    const [token] = state.token
    const cartItems = []

    const [method, setMethod] = useState('')
    const [msgValidate, setMsgValidate] = useState('')
    const [loading, setLoading] = useState(false)

    const cartValid = cart.items.filter(item => item.productId.isPublished === true && item.productId.countInStock > 0)
    
    cartValid.map(item => {
        const { productId, size, color, price, quantity } = item
        const obj = { product_id: productId.product_id, size, color, price, quantity }
        cartItems.push(obj)
    })

    const handleCloseView = (e) => {
        e.preventDefault()
        const viewbox = document.querySelector('.payment-method-option-box')
        viewbox.classList.remove('active')
    }

    const validate = () => {
        const msg = {}
        if(!method) {
            msg.notCheck = '*Bạn chưa chọn phương thức thanh toán.'
        }
        setMsgValidate(msg)
        if(Object.keys(msg).length > 0) return false
        return true
    }

    const handlePaymentCOD = () => {
        codSuccess(detail, address)
    }

    const checkoutStripeHandle = async() => {
        try {
            setLoading(true)
            const checkout = await axios.post('/api/create-checkout-session', { items: cart.items.filter(item => item.productId.isPublished === true && item.productId.countInStock > 0), cartItems, name: detail.name, phone: detail.phone, address}, {
                headers: { Authorization: token }
            })
           
            window.location = checkout.data.url
            setLoading(false)
        } catch (err) {
            console.log(err.response.data.msg)
        }

    }

    const handleChangeMethod = (e) => {
        setMethod(e.target.value)
    }

    const handleComplete = async() => {
        const isValid = validate()
        if(!isValid) return 
        try {
            setLoading(true)
            await axios.post('/user/valid-cart', { id: cart._id }, {
                headers: { Authorization: token }
            })
            if(method === 'cod') {
                return handlePaymentCOD()
            } 
            if (method === 'stripe') {
                return checkoutStripeHandle()
            } 
            setLoading(false)
        } catch (err) {
            setLoading(false)
            const viewbox = document.querySelector('.payment-method-option-box')
            viewbox.classList.remove('active')

            Swal.fire({
                width: 500,
                icon: 'error',
                title: `<span class='title-msg-dialog'>${err.response.data.msg}</span>`,
                showConfirmButton: true
            })
            
        }
        
        
    }

   
  return (
    <div className='payment-method-options-modal'>
        <div className="payment-method">
            <h3 style={{ color: '#555' }}>Chọn phương thức thanh toán: </h3>
            <div style={{marginTop: '15px'}}>
                <span style={{color: 'red', fontWeight: '300', fontSize: '14px'}}>{msgValidate.notCheck}</span>
            </div>
            <div className='list__method_wrapper'>
                <div className='method_item'>
                    <div className='check_options_method'>
                        <input type='radio' name='options'
                        value='cod'
                        onChange={handleChangeMethod}
                        checked={method === 'cod'}
                        />
                    </div>
                    <div className='content_options_method'>
                        <div className='img_options_method'>
                            <img src={CodIcon}/>
                        </div>  
                        <div className='text_options_method'>
                            <span>Thanh toán khi giao hàng (COD)</span>
                        </div>
                    </div>
                </div>
                <div className='method_item stripe_method_option'>
                    <div className='check_options_method'>
                        <input type='radio' name='options'
                        value='stripe'
                        onChange={handleChangeMethod}
                        checked={method === 'stripe'}
                        />
                    </div>
                    <div className='content_options_method'>
                        <div className='img_options_method'>
                            <img src={StripeIcon}/>
                        </div>
                        <div className='text_options_method'>
                            <span>Thanh toán với Stripe</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <button className='completed-check-option' onClick={handleComplete}>
                {
                    loading ? <FontAwesomeIcon icon={faSpinner} className="fa-spin" style={{ color: '#ffffff', fontSize: '18px' }} /> : 'Hoàn tất đơn hàng'
                }
            </button>
            <div className="payment-method-options-modal-close" onClick={handleCloseView}>
                    <FaRegTimesCircle style={{ color: '#d93938' }} />
            </div>
        </div> 
    </div>
  )
}

export default PaymentMethodOptions
