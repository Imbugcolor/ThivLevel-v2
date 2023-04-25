import React, { useContext, useState, useEffect, useRef } from 'react'
import { useLocation } from "react-router-dom"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartShopping, faSpinner } from '@fortawesome/free-solid-svg-icons'
import { GlobalState } from '../../../GlobalState'
import axios from 'axios'
import Payment from './Payment'
import { toast } from 'react-toastify';
import * as RiIcons from 'react-icons/ri'
import Swal from 'sweetalert2'
import { GrFormSubtract } from 'react-icons/gr'
import { FiPlus } from 'react-icons/fi'
import Loading from '../utils/loading/Loading'

function Cart() {
  const state = useContext(GlobalState)
  const [cart, setCart] = state.userAPI.cart
  const [loadingPayment, setLoadingPayment] = useState(false)
  const [user] = state.userAPI.user
  const [token] = state.token
  const [total, setTotal] = state.userAPI.total
  const [callback, setCallback] = state.userAPI.callback
  const [canBuy, setCanBuy] = useState(false)
  const [checkButton, setCheckButton] = useState(false)
  const [isProgress,setIsProgress] = useState(false)

  const location = useLocation()
  const queryParameters = new URLSearchParams(location.search)

  const [page, setPage] = useState(0)



  useEffect(()=> {
    if(queryParameters.get('success') === 'true'){
      Swal.fire({
        width: 500,
        icon: 'success',
        title: `<span class='title-msg-dialog'>Đặt hàng thành công.</span>`,
        showConfirmButton: true,
        timer: 3000
      })
    }
    if(queryParameters.get('canceled') === 'true'){
      Swal.fire({
        width: 500,
        icon: 'warning',
        title: `<span class='title-msg-dialog'>Đặt hàng thất bại.</span>`,
        showConfirmButton: true,
        timer: 3000
      })
    }
    if(performance.navigation.type == 2){
      window.location = window.location
    }
  },[])


  const incrementCart = async (id, newItems) => {
    setIsProgress(true)
    await axios.patch('/user/increment-cart', { id, newItems }, {
      headers: { Authorization: token }
    })
    setIsProgress(false)
  }

  const decrementCart = async (id, newItems) => {
    setIsProgress(true)
    await axios.patch('/user/decrement-cart', { id, newItems }, {
      headers: { Authorization: token }
    })
    setIsProgress(false)
  }

  const removeItem = async (id, item) => {
    setIsProgress(true)
    await axios.patch('/user/delete-item-cart', { id, item }, {
      headers: { Authorization: token }
    })
    setIsProgress(false)
  }

  const increment = (itemX) => {
    cart.cart.items.forEach(item => {
      if (item._id === itemX._id) {
        return item.quantity += 1
      }
    })

    setCart({...cart})
    setTotal(total + itemX.price)
    incrementCart(cart.cart._id, itemX)
  }

  const decrement = (itemX) => {
    cart.cart.items.forEach(item => {
      if (item._id === itemX._id) {
        item.quantity === 1 ? item.quantity = 1 : item.quantity -= 1
      }
    })

    setCart({...cart})
    setTotal(total - itemX.price)
    decrementCart(cart.cart._id, itemX)
  }

  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: 'btn-ok',
      cancelButton: 'btn-cancel-swal btn-mg-r'
    },
    buttonsStyling: false
  })
  

  const removeProduct = (itemX) => {   
      swalWithBootstrapButtons.fire({
        title: 'Xóa sản phẩm?',
        text: "Sản phẩm đã xóa sẽ không thể phục hồi!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Xóa',
        cancelButtonText: 'Hủy bỏ',
        reverseButtons: true
      }).then((result) => {
        if (result.isConfirmed) {
          cart.cart.items.forEach((item, index) => {
            if (item._id === itemX._id) {
              cart.cart.items.splice(index, 1)
            }
          })

          // setCart({...cart})
          removeItem(cart.cart._id, itemX)
          setCallback(!callback)
          swalWithBootstrapButtons.fire(
            'Đã xóa!',
            'Sản phẩm đã bị xóa khỏi giỏ hàng.',
            'success'
          )
        } else if (
          /* Read more about handling dismissals below */
          result.dismiss === Swal.DismissReason.cancel
        ) {
          swalWithBootstrapButtons.fire(
            'Đã hủy xóa!',
            'Sản phẩm vẫn ở trong giỏ hàng.',
            'error'
          )
        }
      })
  }

  const clearCart = async () => {
    await axios.patch('/user/empty-cart', {id: cart.cart._id}, {
      headers: { Authorization: token }
    })
  }

  const codSuccess = async (payment, address) => {

    const { name, phone } = payment
    const method = 'COD'
    const isPaid = false

    const cartItems = []

    const cartValid = cart.cart.items.filter(item => item.productId.isPublished === true && item.productId.countInStock > 0)
      
    cartValid.map(item => {
        const { productId, size, color, price, quantity } = item
        const obj = { product_id: productId.product_id, title: productId.title, images: productId.images, size, color, price, quantity }
        cartItems.push(obj)
    })

    await axios.post('/api/paymentCOD', { cart: cartItems, name, phone, address, total: cart.cart.subTotal, method, isPaid }, {
      headers: { Authorization: token }
    })

    setCart({...cart, cart: {...cart, items: [], subTotal: 0 }})
    clearCart()
    
    Swal.fire({
      width: 500,
      icon: 'success',
      title: `<span class='title-msg-dialog'>Đặt hàng thành công.</span>`,
      showConfirmButton: true,
      timer: 3000
    })

    document.body.style.overflow = '';
  }



  const CartItem = ({ item }) => {
    return (
      <div className="detail cart" key={item._id}>
        <div className='product-images'>
          <img src={item.productId.images[0].url} alt="" />
        </div>
        <div className="box-detail">
          <h2>{item.productId.title}</h2>
          <h3>$ {item.price}</h3>
          {
            item.color ?
              <div className="product-color">
                Màu sắc: <button style={{ background: item.color, width: '30px', height: '30px', borderRadius: '50%', border: '1px solid #ccc' }}
                ></button>
              </div> : <div>Color: No Available</div>
          }
          {
            item.size ?
              <strong>Size: {item.size}</strong> : <strong>Size: No Available</strong>
          }
          <div className='product-in-stock'>
            <span>SL trong kho:</span>
            <h4>{item.productId.countInStock}</h4> 
          </div>
          <div className="amount">         
            <div className='quantity__controll_wrapper'>       
              <button onClick={() => decrement(item)} disabled={isProgress}><GrFormSubtract /></button>
              <span>{item.quantity}</span>
              <button onClick={() => increment(item)} disabled={isProgress}><FiPlus /></button>
            </div>
            <div className='total_num_bottom'>
              <span>Tổng cộng:</span>
              <h4>${(item.price * item.quantity).toFixed(2)}</h4>  
            </div>
          </div>

        </div>
        { 
          !item.productId.isPublished || item.productId.countInStock <= 0 ?
          <div className="unvailible-layer">
            <span>Không có sẵn</span>
          </div> : null
        }
     
        <div className="delete" onClick={() => removeProduct(item)}><RiIcons.RiDeleteBinFill /></div>
      </div>
    )
  }

  const checkCartValid = async() => {
    try {
      setLoadingPayment(true)
      await axios.post('/user/valid-cart', { id: cart.cart._id }, {
        headers: { Authorization: token }
      })
      setPage(1)
      setLoadingPayment(false)
    } catch (err) {
      swalWithBootstrapButtons.fire(
        'Lỗi!',
        err.response.data.msg,
        'error'
      )
      setLoadingPayment(false)
    }
  }

  const handleBuyClick = (e) => {
    e.preventDefault()
    checkCartValid()
    setCheckButton(true)
    setCallback(!callback)
  }

  const closePayment = () => {
    setPage(0)
    setCheckButton(false)
  }


  if (!cart || cart.cart.items.length === 0) {
    const style = {
      display: 'block',
      width: '100%',
      height: '600px',
      objectFit: 'contain'
    }
    return (
      <div style={{ width: "100%", textAlign: 'center' }} >
        <img draggable={false} style={style}
          src="https://rtworkspace.com/wp-content/plugins/rtworkspace-ecommerce-wp-plugin/assets/img/empty-cart.png" alt="" />
      </div>
    )
  }

  return (
    page === 1 ? <Payment 
    total={total}
    cart={cart.cart}
    codSuccess={codSuccess}
    user={user}
    closePayment={closePayment}
    /> :
    <div className="res-row">
      <h2 className="cart-heading col l-12 m-12 c-12">
        <FontAwesomeIcon icon={faCartShopping} style={{ paddingRight: 10 }} />
        Giỏ hàng
      </h2>
      <div className='cart-wrapper col l-12 m-12 c-12'>
        <div className="res-row">
          <div className='list-cart col l-8 m-8 c-12 '>
            {
              cart.cart.items.map(item =>
                <CartItem item={item} key={item._id} />
              )
            }
          </div>
          <div className='payment col l-4 m-4 c-12 '>
            <div className="total divider">
              <p>Đơn hàng:</p>
              <span>$ {total}</span>
            </div>
            <div className='divider'>
              <div className='discount-cost'>
                <p>Giảm giá:</p>
                <span>$ 0</span>
              </div>
              <div className='ship-cost'>
                <p>Phí vận chuyển:</p>
                <span>$ 0</span>
              </div>
            </div>
            <div className='grand-total divider'>
              <p>Tổng cộng:</p>
              <span style={{ color: '#d93938' }}>$ {total}</span>
            </div>

            <button
              className="payment-buy-btn" onClick={handleBuyClick} >
              {
                loadingPayment ?
                  <FontAwesomeIcon icon={faSpinner} className="fa-spin" /> :
                  "Tiếp tục thanh toán"           
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart