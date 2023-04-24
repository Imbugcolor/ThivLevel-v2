import React, { useContext, useEffect, useState } from 'react'
import { GlobalState } from '../../../GlobalState'
import ProductItem from '../utils/productItem/ProductItem'
import Loading from '../utils/loading/Loading'
import axios from 'axios'
import Filters from './Filters'
import QuickViewProduct from '../home/QuickViewProduct'
import ReactPaginate from 'react-paginate'
import { GrSubtract } from 'react-icons/gr'

function Products() {
  const state = useContext(GlobalState)
  const [products, setProducts] = state.productsAPI.productsAvailable
  const [categories] = state.categoriesAPI.categories
  const [category, setCategory] = state.productsAPI.category

  const [isAdmin] = state.userAPI.isAdmin
  const [token] = state.token
  const [callback, setCallback] = state.productsAPI.callback
  const [isCheck, setIsCheck] = useState(false)
  const [loading, setLoading] = state.productsAPI.loading
  const [currentProduct, setCurrentProduct] = useState(false)
  const [fromPrice, setFromPrice] = useState('')
  const [toPrice, setToPrice] = useState('')
  const [tprice, setTprice] = state.productsAPI.tprice
  const [fprice, setFprice] = state.productsAPI.fprice
  const [sizes, setSizes] = state.productsAPI.sizes
  const [msgInput, setMsgInput] = useState('')

  useEffect(() => {
    products.forEach(product => {
      product.checked = false
    })
    setProducts([...products])
    setTprice(5000)
    setFprice(0)
    setSizes('')
  }, [])

  const handleCheck = (id) => {
    products.forEach(product => {
      if (product._id === id) product.checked = !product.checked
    })
    setProducts([...products])
  }


  const deleteProduct = async (id, public_id) => {
    try {


      const destroyImg = axios.post('/api/destroy', { public_id }, {
        headers: { Authorization: token }
      })
      const deleteProduct = axios.delete(`/api/products/${id}`, {
        headers: { Authorization: token }
      })

      await destroyImg
      await deleteProduct
      setCallback(!callback)
    } catch (err) {
      alert(err.response.data.msg)
    }
  }

  const checkAll = () => {
    products.forEach(product => {
      product.checked = !isCheck
    })
    setProducts([...products])
    setIsCheck(!isCheck)
  }

  // const deleteAll = () => {
  //   products.forEach(product => {
  //     if (product.checked) deleteProduct(product._id, product.images[0].public_id)
  //   })
  // }

  // Paginate
  const [currentItems, setCurrentItems] = useState([]);
  const [pageCount, setPageCount] = useState(0);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 16;

  useEffect(() => {
    const endOffset = itemOffset + itemsPerPage;
    setCurrentItems(products.slice(itemOffset, endOffset));
    setPageCount(Math.ceil(products.length / itemsPerPage));
  }, [itemOffset, itemsPerPage, products])

  const handlePageClick = (event) => {
    const newOffset = (event.selected * itemsPerPage) % products.length;
    setItemOffset(newOffset);
  };

  const handleCategoryChoose = (category) => {
    const value = "category=" + category._id
    setCategory(value)
    setItemOffset(0)
  }

  const handleViewDetail = (product) => {
    const viewbox = document.querySelector('.product-view-detail-box')
    viewbox.classList.toggle('active')
    setCurrentProduct(product)
  }

  const validate = () => {
    const msg = {}


    if(!fromPrice || !toPrice || fromPrice*1 < 0 || toPrice*1 < fromPrice*1) {
      msg.price = '*Khoảng giá không hợp lệ'
    } 

    setMsgInput(msg)
    if(Object.keys(msg).length > 0) return false
    return true
  }

  const handleFilterPrice = () => {
    const isValid = validate()
    if(!isValid) return
    setFprice(fromPrice)
    setTprice(toPrice)
    setItemOffset(0)
  }

  const handleFilterSizes = (e) => {
      const { name, checked } = e.target
        if (checked) {
            setSizes([...sizes, name])
            setItemOffset(0)
        } else {
            setSizes(sizes.filter((e) => e !== name))
        }
  }

  const isChecked = (sizeX) => {
    return sizes.includes(sizeX)
  }

  // if(loading) return <div><Loading /></div>
  return (
    <>
      <Filters 
        setItemOffset={setItemOffset} 
        setFprice={setFprice} 
        setTprice={setTprice}
        setFromPrice={setFromPrice}
        setToPrice={setToPrice}
        setSizes={setSizes}
      />
      {
        isAdmin &&
        <div className="delete-all">
          <span>Select all</span>
          <input type="checkbox" checked={isCheck} onChange={checkAll} />
          <button>Delete all</button>
        </div>
      }
      <div className="res-row products__container">
        <div className="col l-3 m-0 c-0 cate-side-bar">
          <div className="products__category">
            <h3 className="products__category-heading">Danh mục sản phẩm</h3>
            <ul>
              <li>
                <a href="#!" onClick={() => {
                  setCategory('')
                  setItemOffset(0)
                }}
                >
                  Tất cả sản phẩm
                </a>
              </li>
              {
                categories.map((category) => (
                  <li key={category._id}>
                    <a href="#!" onClick={() => handleCategoryChoose(category)}>
                      {category.name}
                    </a>
                  </li>
                ))
              }
            </ul>
          </div>
          <div className='products_price_filter'>
            <h3 className="products__category-heading">Khoảng giá</h3>
            <div className='input_filter__wrapper'>
                <div className='price_filter_input'>
                    <input type='number' placeholder='$ TỪ'
                        value={fromPrice}
                        onChange={e => setFromPrice(e.target.value)}                 
                    />
                    <div className='divider_input'>
                      <GrSubtract />
                    </div>
                    <input type='number' placeholder='$ ĐẾN'
                        value={toPrice}
                        onChange={e => setToPrice(e.target.value)}  
                    />
                </div>
                <span style={{color: 'red', fontWeight: '300'}}>{msgInput.price}</span>
                <button onClick={handleFilterPrice}>Áp dụng</button>
            </div>
          </div>
          <div className='products_size_filter'>
              <h3 className="products__category-heading">Kích thước</h3>
              <div className='input_filter__wrapper'>
                  <div className='boxes_check_size'>
                    <label className="boxes_container">XS
                      <input type="checkbox" name='XS' onChange={handleFilterSizes} checked={isChecked('XS')}/>
                      <span className="checkmark"></span>
                    </label>
                    <label className="boxes_container">S
                      <input type="checkbox" name='S' onChange={handleFilterSizes} checked={isChecked('S')}/>
                      <span className="checkmark"></span>
                    </label>
                    <label className="boxes_container">M
                      <input type="checkbox" name='M' onChange={handleFilterSizes} checked={isChecked('M')}/>
                      <span className="checkmark"></span>
                    </label>
                    <label className="boxes_container">L
                      <input type="checkbox" name='L' onChange={handleFilterSizes} checked={isChecked('L')}/>
                      <span className="checkmark"></span>
                    </label>
                    <label className="boxes_container">XL
                      <input type="checkbox" name='XL' onChange={handleFilterSizes} checked={isChecked('XL')}/>
                      <span className="checkmark"></span>
                    </label>
                    <label className="boxes_container">XXL
                      <input type="checkbox" name='XXL' onChange={handleFilterSizes} checked={isChecked('XXL')}/>
                      <span className="checkmark"></span>
                    </label>
                  </div>
              </div>
          </div>
        </div>
        
        <div className="col l-9 m-12 c-12">
        {
          loading ? <div><Loading/></div> : 
          <div>
          <div className="products res-row">
            <div className='col l-12 m-12 c-12'> 
            {
              products.length !== 0 ?  <span className='number_total_products'>{products.length} sản phẩm</span> : 
              <span className='number_total_products'>Không tìm thấy kết quả tìm kiếm.</span>
            } 
            </div>
            {          
                currentItems.map(product => {
                  return <ProductItem key={product._id} product={product}
                    isAdmin={isAdmin} deleteProduct={deleteProduct} handleCheck={handleCheck}
                    setCurrentProduct={setCurrentProduct}
                    handleViewDetail={handleViewDetail}
                  />
                })
            }
          </div>
          <div>
            <ReactPaginate
              breakLabel="..."
              nextLabel=">"
              onPageChange={handlePageClick}
              pageRangeDisplayed={2}
              pageCount={pageCount}
              previousLabel="<"
              renderOnZeroPageCount={null}
              containerClassName="pagination"
              pageLinkClassName="page-num"
              previousLinkClassName="page-num"
              activeClassName="active"
            />
          </div>
          </div>
          }
        </div>

        <div className="product-view-detail-box">
          {currentProduct && <QuickViewProduct detailProduct={currentProduct} />}
        </div>
      </div>


    </>
  )
}

export default Products