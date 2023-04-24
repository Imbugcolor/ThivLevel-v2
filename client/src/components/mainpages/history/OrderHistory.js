import React, { useContext, useEffect, useState } from 'react'
import { GlobalState } from '../../../GlobalState'
import { Link } from 'react-router-dom'
import axios from 'axios'
import ReactPaginate from 'react-paginate'
import moment from 'moment'
import Loading from '../utils/loading/Loading'
import { TfiMoreAlt } from 'react-icons/tfi'

function OrderHistory() {

    const state = useContext(GlobalState)
    const [history, setHistory] = state.userAPI.history
    const [data, setData] = useState([])
    const [token] = state.token
    const [sort, setSort] = useState('')
    const [status, setStatus] = useState('')
    const [searchPhrase, setSearchPhrase] = useState('')
    const [currentItems, setCurrentItems] = useState([]);
    const [pageCount, setPageCount] = useState(0);
    const [itemOffset, setItemOffset] = useState(0);
    const itemsPerPage = 6;
    const [loading, setLoading] = useState(false)
    // const [search, setSearch] = useState('')

    useEffect(() => {
        if (token) {
            const getHistory = async () => {
                setLoading(true)
                const res = await axios.get(`/user/history?${status}&${sort}`, {
                    headers: { Authorization: token }
                })
                setHistory(res.data);
                setData(res.data)   
                setLoading(false)       
            }
            getHistory()
        }
    }, [token, setHistory, sort, status]);

    const search = (e) => {
        const matchedUsers = data.filter((order) => {
            return order._id.toString().toLowerCase().includes(e.target.value.toLowerCase())||
            ((order.name || order.address.recipient_name).toLowerCase().includes(e.target.value.toLowerCase())) ||
            order.email?.toLowerCase().includes(e.target.value.toLowerCase()) || order.phone?.includes(e.target.value.toLowerCase())
        })

        setHistory(matchedUsers)
        setSearchPhrase(e.target.value)
    }

    const handleStatus = (e) => {
        setStatus(e.target.value)
        setSearchPhrase('')
    }

    useEffect(() => {
        const endOffset = itemOffset + itemsPerPage;
        setCurrentItems(history.slice(itemOffset, endOffset));
        setPageCount(Math.ceil(history.length / itemsPerPage));
    }, [itemOffset, itemsPerPage, history])

    const handlePageClick = (event) => {
        const newOffset = (event.selected * itemsPerPage) % history.length;
        setItemOffset(newOffset);
    };

    return (
        <div className="history-page">
            <h2>Đơn hàng của bạn</h2>
            <div className="order-filter-client-wrapper">
                <div className='order-search-client'>
                    <input className="search-order-input" value={searchPhrase} type="text" placeholder="Tìm kiếm bằng mã đơn/tên/email/Sđt"
                    onChange={search}/>
                </div>

            </div>  
            <div className='my__order_wrapper res-row'>
                <div className='sidebar__filter_orders col l-3 m-3 c-12'>
                        <div className="order-status-client">
                            <select name="status" value={status} onChange={handleStatus}>
                                <option value="">Tất cả đơn hàng</option>
                            
                                <option value="status=Pending">
                                    Đang chờ
                                </option>
                                
                                <option value="status=Processing">
                                    Đang xử lý
                                </option>

                                <option value="status=Shipping">
                                    Đang giao hàng
                                </option>

                                <option value="status=Delivered">
                                    Đã giao hàng
                                </option>

                                <option value="status=Cancel">
                                    Đơn bị hủy
                                </option>
                                
                            </select>
                        </div>

                        <div className="order-sortdate-client">
                            <select value={sort} onChange={e => setSort(e.target.value)}>
                                <option value="">Mới nhất</option>
                                <option value="sort=oldest">Cũ nhất</option>
                            </select>
                        </div>
                </div>
                <div className="my__order_list_wrapper col l-9 m-9 c-12"> 

                    {
                        history.length !== 0 ?  <span className='number_total_orders'>{history.length} đơn hàng</span> : 
                        <span className='number_total_orders'>Không tìm thấy kết quả tìm kiếm.</span>
                    }  
                   
                    {   
                        loading ? <div><Loading /></div> :
                        currentItems.map(item => (                                
                            <div className="my__order_item" key={item._id}>
                                <div className="my__order_item_heading">
                                    <h3 className="my_order_status">

                                        {
                                            item.status === 'Pending' ? <span className='dot__order_status dot_pending'></span> :
                                            item.status === 'Processing' ? <span className='dot__order_status dot_processing'></span> :
                                            item.status === 'Shipping' ? <span className='dot__order_status dot_shipping'></span> :
                                            item.status === 'Delivered' ? <span className='dot__order_status dot_delivered'></span> :
                                            <span className='dot__order_status dot_cancel'></span>
                                        }                             
                                    
                                        {
                                        item.status === 'Pending' ? 'Đang chờ xử lý' : item.status === 'Processing' ? 'Đang xử lý': 
                                        item.status === 'Shipping' ? 'Đang giao hàng' : item.status === 'Delivered' ? 'Đã giao hàng' : 'Đã hủy'
                                        }
                                    </h3>
                                    <span className='my__order_number'>Đơn hàng #</span>
                                    <span className='my__order_number uppercase'>{item._id}</span>
                                </div>
                                <div className="my__order_item_images">
                                    <img src={item.cart[0].images[0].url}/>
                                    {
                                        item.cart.length > 1 ? 
                                        <div className='more_images_item'>
                                            <TfiMoreAlt /> và {item.cart.length - 1 } sản phẩm khác
                                        </div> : null
                                    }
                                </div>
                                <div className="my__order_item_bottom">
                                    <span>{item.cart.length} sản phẩm tổng cộng:</span>
                                    <h4>{item.total}$</h4>
                                </div>
                                <div className="my__order_item_view">
                                    <Link to={`/history/${item._id}`} >
                                        Xem chi tiết
                                    </Link>
                                </div>
                            </div>
                        )) }
                </div>
            </div>     
         
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
        
    )
}

export default OrderHistory