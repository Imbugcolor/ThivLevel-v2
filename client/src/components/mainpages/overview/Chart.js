import React, { useContext, useEffect, useState } from 'react'
import Iframe from 'react-iframe'
import { GlobalState } from '../../../GlobalState'
import axios from 'axios'
import { FaBoxOpen } from 'react-icons/fa'
import { IoShirt } from 'react-icons/io5'

function Chart() {
  const state = useContext(GlobalState)
  const [products] = state.productsAPI.products
  const [token] = state.token
  const [orders, setOrders] = useState([])
  const [orderTotal, setOrderTotal] = useState(0)
  const [totalSales, setTotalSales] = useState(0)

  useEffect(() => {
    if (token) {
      const getOrder = async () => {
        const res = await axios.get(`/api/payment`, {
          headers: { Authorization: token }
        })
        setOrders(res.data)
        const data = res.data
        setOrderTotal(data.length)
        const filterSales = data.filter(({ isPaid }) => isPaid === true)
        const totalPrice = filterSales.reduce((acc, curr) => {
          return acc + curr.total
        }, 0)
        setTotalSales(totalPrice)
      }
      getOrder()
    }

  }, [token])


  return (
    <div>
      <div className='content-header'>
        <h2>Thống kê</h2>
      </div>
      <div className="content-wrapper">
        <div className='chart grid-3'>
          <div className='card-total'>
            <div className='chart-item row'>
              <div>
                <span className='icon-bg primary-bg'>$</span>
              </div>
              <div className='card-content'>
                <h3>Doanh thu</h3>
                <span>${totalSales.toFixed(2)}</span>
              </div>
            </div>
          </div>
          <div className='card-total'>
            <div className='chart-item row'>
              <div>
                <span className='icon-bg success-bg'><FaBoxOpen style={{ color: '#0f5132' }} /></span>
              </div>
              <div className='card-content'>
                <h3>Đơn hàng</h3>
                <span>{orderTotal}</span>
              </div>
            </div>
          </div>
          <div className='card-total'>
            <div className='chart-item row'>
              <div>
                <span className='icon-bg warning-bg'><IoShirt style={{ color: '#664d03' }} /></span>
              </div>
              <div className='card-content'>
                <h3>Sản phẩm</h3>
                <span>{products.length}</span>
              </div>
            </div>
          </div>
        </div>

        <div className='chart grid-2'>
          <div className='card-chart'>
            <div className='card-chart-body'>
              <h3 className='cart-title'>Doanh thu</h3>
              <div>
                <Iframe
                  url="https://charts.mongodb.com/charts-ecommerce-website-nunye/embed/charts?id=64492b72-c6f2-4fa9-8417-76ca9cf2fbcc&maxDataAge=3600&theme=light&autoRefresh=true"
                  width="100%"
                  height="380px"
                  style={{ background: '#FFFFFF', border: 'none', borderRadius: '2px', boxShadow: '0 2px 10px 0 rgba(70, 76, 79, .2)' }}
                  id=""
                  className=""
                  display="block"
                  position="relative"
                />
              </div>

            </div>
          </div>
          <div className='card-chart'>
              <div className='card-chart-body'>
                <h3 className='cart-title'>Sản phẩm</h3>
                <div>
                  <Iframe
                    url="https://charts.mongodb.com/charts-ecommerce-website-nunye/embed/charts?id=644933da-dfe4-4e4c-89c2-3326d5647e50&maxDataAge=3600&theme=light&autoRefresh=true"
                    width="100%"
                    height="380px"
                    style={{ background: '#FFFFFF', border: 'none', borderRadius: '2px', boxShadow: '0 2px 10px 0 rgba(70, 76, 79, .2)' }}
                    id=""
                    className=""
                    display="block"
                    position="relative"
                  />
                </div>

              </div>
          </div>
        </div>
        <div className='chart grid-1'>
          <div className='card-chart'>
            <div className='card-chart-body'>
              <h3 className='cart-title'>Đơn hàng</h3>
              <div>
                <Iframe
                  url="https://charts.mongodb.com/charts-ecommerce-website-nunye/embed/charts?id=64492f3c-b3e2-4fcf-8ea1-4464f214e4ed&maxDataAge=3600&theme=light&autoRefresh=true"
                  width="100%"
                  height="380px"
                  style={{ background: '#FFFFFF', border: 'none', borderRadius: '2px', boxShadow: '0 2px 10px 0 rgba(70, 76, 79, .2)' }}
                  id=""
                  className=""
                  display="block"
                  position="relative"
                />
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Chart