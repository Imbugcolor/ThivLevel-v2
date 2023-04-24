import React, { useContext, useState, useEffect, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { GlobalState } from '../../../GlobalState'
import ProductItem from '../utils/productItem/ProductItem'
import axios from 'axios'
import Rating from '../utils/Rating/Rating'
import SoldIcon from './images/sold.png'
import { FaStar } from 'react-icons/fa'
import { BsCartCheck } from 'react-icons/bs'
import { toast } from 'react-toastify'
import ReviewItem from '../utils/ReviewItem/ReviewItem'
import QuickViewProduct from '../home/QuickViewProduct'
import Swal from 'sweetalert2'
import { Line } from 'rc-progress';
import { IoIosStar } from "react-icons/io";
import { GrFormSubtract } from 'react-icons/gr'
import { FiPlus } from 'react-icons/fi'
import Loading from '../utils/loading/Loading'
import Share from '../share/Share'
import { BASE_URL } from '../utils/config'
import MetaTags from 'react-meta-tags'

function DetailProduct() {
    const params = useParams()
    const state = useContext(GlobalState)
    const [products] = state.productsAPI.suggestions
    const [categories] = state.categoriesAPI.categories
    const [user] = state.userAPI.user
    const addCart = state.userAPI.addCart
    const [detailProduct, setDetailProduct] = useState([])
    const [reviews, setReviews] = useState([])
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(null)
    const [comment, setComment] = useState('')
    const [isLogged] = state.userAPI.isLogged
    const [token] = state.token
    const [callback, setCallback] = state.productsAPI.callback
    const [color, setColor] = useState(false)
    const [size, setSize] = useState(false)
    const [quantity, setQuantity] = useState(1)
    const [slideIndex, setSlideIndex] = useState(1)
    const [selectedColor, setSelectedColor] = useState(0)
    const [width, setWidth] = useState(0)
    const [start, setStart] = useState(0)
    const [change, setChange] = useState(0)
    const [reverse, setReverse] = useState(true)
    const slideRef = useRef()

    const [perRating, setPerRating] = useState([])

    const [loading, setLoading] = state.productsAPI.loading

    const count_element_in_array = (array, x) => {
        let count = 0;
        for(let i=0;i<array.length;i++){
          if(array[i]==x) 
            count ++;
        } 
        return count;   
    }

    const calcPercent = (countArray, starsArray ) => {
        const perStars = [];
        for(let i=0; i < countArray.length; i++){
           const per = countArray[i] / starsArray.length * 100
           perStars.push(per.toFixed(0))
        } 
        return perStars
    }

    useEffect(() => {
        setColor(false)
        setSize(false)
        setQuantity(1)
        setSelectedColor(0)
        setSlideIndex(1)
        setRating(0)
        setComment('')
    }, [params.id])

    useEffect(() => {
        if (params.id) {
            products.forEach(product => {
                if (product._id === params.id) {
                    setDetailProduct(product)
                    setColor(product.colors[0])
                    setReviews(product.reviews)
                    if(product.reviews.length > 0){
                        const ratingsArray = product.reviews.flat()
                        const starsArray = ratingsArray.map(item => { return item.rating; })
            
                        const stars = [];
                        for(let i=1;i<=5;i++){
                            const countStars =count_element_in_array(starsArray, i)
                            stars.push(countStars)
                        }  
                        const perRatingResult = calcPercent(stars,starsArray)
                        setPerRating(perRatingResult)
                    } else {
                        setPerRating([0,0,0,0,0])
                    }
      
                    setReverse(true)
                }
            })        
        }
    }, [params.id, products])

    const sortReview = (value) => {
        setReverse(value)
        const reviewCopy = [...reviews]
        if (reverse) {
            return setReviews(reviewCopy.reverse())
        }
        setReviews(reviewCopy)
        setReverse(!reverse)
    }

    const swalCustomButtons = Swal.mixin({
        customClass: {
          confirmButton: 'btn-ok'
        },
        buttonsStyling: false
    })

    const submitReviewHandler = async (e) => {
        e.preventDefault()
        try {
            if (!rating) return swalCustomButtons.fire({
                width: 400,
                icon: 'warning',
                title: `<span class='title-msg-dialog'>Bạn chưa chọn sao.</span>`,
                showConfirmButton: true
            })
            const res = await axios.post(`/api/products/${params.id}/review`, { rating, comment }, {
                headers: { Authorization: token }
            })
            setCallback(!callback)
            setRating(0)
            setComment('')
            swalCustomButtons.fire({
                width: 400,
                icon: 'success',
                title: `<span class='title-msg-dialog'>Cảm ơn bạn đã đánh giá!</span>`,
                showConfirmButton: true,
                timer: 3000
            })
        } catch (err) {
            setRating(0)
            setComment('')
            swalCustomButtons.fire({
                width: 400,
                icon: 'warning',
                title: `<span class='title-msg-dialog'>${err.response.data.msg}</span>`,
                showConfirmButton: true
            })
        }
    }


    useEffect(() => {
        if (!slideRef.current) return;
        const scrollWidth = slideRef.current.scrollWidth
        const childrenElementCount = slideRef.current.childElementCount
        const width = scrollWidth / childrenElementCount
        setWidth(width)
    })

    const plusSlides = (n) => {
        setSlideIndex(prev => prev + n)
        slideShow(slideIndex + n)
    }

    const slideShow = (n) => {
        if (n > detailProduct.images.length) setSlideIndex(1)
        if (n < 1) setSlideIndex(detailProduct.images.length)
    }

    // Drag
    function dragStart(e) {
        setStart(e.clientX)
    }

    function dragOver(e) {
        let touch = e.clientX
        setChange(start - touch)
    }

    function dragEnd(e) {
        if (change > 0)
            slideRef.current.scrollLeft += width
        else
            slideRef.current.scrollLeft -= width
    }

    function handleBuyClick(color, index) {
        setColor(color)
        setSelectedColor(index)
    }

    function handleAddCart(product, productColor, productSize, productQuantity) {
        if (!color)
            return toast.info('Hãy chọn màu!', {
                position: "top-center",
                autoClose: 3000
            })
        if (!size)
            return toast.info('Hãy chọn size!', {
                position: "top-center",
                autoClose: 3000
            })
        addCart(product, productColor, productSize, productQuantity)
    }

    const [currentProduct, setCurrentProduct] = useState(false)
    const handleViewDetail = (product) => {
        const viewbox = document.querySelector('.product-view-detail-box')
        viewbox.classList.toggle('active')
        setCurrentProduct(product)
    }

    useEffect(() => {
        if (!slideRef.current || !width) return;
        let numOfThumb = Math.round(slideRef.current.offsetWidth / width)
        slideRef.current.scrollLeft = slideIndex > numOfThumb ? (slideIndex - 1) * width : 0
    }, [width, slideIndex])

    if (detailProduct.length === 0) return null
  
    return (
        loading ? <div><Loading /></div> :
        <React.Fragment>
            <section className="product-details res-row p30-tb-im"> 
                <MetaTags id='product-page-detail'>
                    <meta name="description" content={detailProduct.description} />
                    <meta property="og:title" content={detailProduct.title} />
                    <meta property="og:image" content={detailProduct.images[0].url} />
                </MetaTags>                
                <div className="col l-12 m-12 c-12">
                    <div className="res-row">
                        <div className="col l-4 m-6 c-12">
                            <div className="product-page-img">
                                {
                                    detailProduct.images.map((image, index) => (
                                        <div key={image.public_id} className="mySlides"
                                            style={{ display: (index + 1) === slideIndex ? "block" : "none" }}>
                                            <div className="numbertext">{index + 1} / {detailProduct.images.length}</div>
                                            <img src={image.url} alt="" />
                                        </div>
                                    ))
                                }
                                <a href="#!" className="prev" onClick={() => plusSlides(-1)}>&#10094;</a>
                                <a href="#!" className="next" onClick={() => plusSlides(+1)}>&#10095;</a>

                                <div className="slider-img" draggable={true} ref={slideRef}
                                    onDragStart={dragStart}
                                    onDragOver={dragOver}
                                    onDragEnd={dragEnd}
                                >
                                    {
                                        detailProduct.images.map((image, index) => (
                                            <div key={image.public_id}
                                                className={`slider-box ${index + 1 === slideIndex ? 'active' : ''}`}
                                                onClick={() => setSlideIndex(index + 1)}
                                            >
                                                <img src={image.url} alt="" />
                                            </div>
                                        ))
                                    }
                                </div>
                            </div>
                            <div className='share-wrapper'>
                                <Share url={`${BASE_URL}/detail/${detailProduct._id}`} />
                            </div>
                        </div>
                        <div className="col l-8 m-6 c-12">
                            <div className="product-page-details">
                                <strong>{detailProduct.title}</strong>

                                <p className="product-category">
                                    #{detailProduct.product_id}
                                    <label>/ Phân loại: </label> <span>{categories.find(c => c._id === detailProduct.category).name}</span>
                                </p>
                                <div className="review-detail-product">
                                    <Rating value={detailProduct.rating} text={''} />
                                    <span className='num-review-product'>/ {reviews.length} đánh giá</span>
                                </div>
                                <p className="product-price">
                                    ${detailProduct.price}
                                </p>
                                
                                <div className ='description__product_wrapper'>
                                    <div className='description_heading'>
                                        Đặc điểm nổi bật
                                    </div>
                                    <p className="small-desc">{detailProduct.description}</p>
                                </div>

                                <div className='select__type_wrapper'>    
                                    <span>Chọn màu sắc: </span>
                                    <div className="product-options">
                                        {
                                            detailProduct.colors.map((color, index) => (
                                                <div key={color}>
                                                    <button style={{ background: color }}
                                                        className={index === selectedColor ? 'active' : ''}
                                                        onClick={() => handleBuyClick(color, index)}
                                                    ></button>
                                                </div>
                                            ))
                                        }
                                    </div>
                                </div>    

                                <div className='select__type_wrapper'>
                                    <span>Chọn size: </span>
                                    <div className='size-select'>
                                        {
                                            detailProduct.size.map(sz => {
                                                return <div className='size' key={sz}>
                                                    <input type='radio' name='size' key={sz} value={sz} id={sz}
                                                        onChange={() => setSize(sz)} checked={size === sz} />
                                                    <label htmlFor={sz}>{sz}</label>
                                                </div>
                                            })
                                        }
                                    </div>
                                </div>

                                {/* <div className="product-page-offer">
                                    <i className="fa-solid fa-tag" />20% Discount
                                </div> */}

                                <div className="product-sold">
                                    <BsCartCheck />
                                    <strong>{detailProduct.countInStock} <span> sản phẩm có sẵn .</span></strong>
                                </div>

                                <div className="product-sold">
                                    <img src={SoldIcon} alt="SoldIcon" />
                                    <strong>{detailProduct.sold} <span>sản phẩm đã bán.</span></strong>
                                </div>

                                <div className="quantity-btn">
                                    <span className='quantity__label'>Số lượng: </span>
                                    <div className='quantity__controll_wrapper'>
                                        <button onClick={() => quantity === 1 ? setQuantity(1) : setQuantity(quantity - 1)}><GrFormSubtract /></button>
                                        <span>{quantity}</span>
                                        <button onClick={() => setQuantity(quantity + 1)}><FiPlus /></button>
                                    </div>
                                </div>

                                <div className="cart-btns">
                                    {
                                        detailProduct.countInStock > 0 ?
                                            <Link to="#!" className="add-cart"
                                                onClick={() => handleAddCart(detailProduct, color, size, quantity)}
                                            >Thêm vào giỏ hàng</Link> : <span> Đã hết hàng.</span>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="col l-12 m-12 c-12">
                            <div className="product-page-content">
                                <div className='description_heading'>
                                    Thông tin chi tiết sản phẩm
                                </div>
                                <p>{detailProduct.content}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </section>
            <div className='review-section'>
                <div className='Reviews'>
                    <h2 className='tag-color'>Khách hàng đánh giá ({reviews.length})</h2>
                    <div className='rating-statistics'>
                        <div className='rating-left-side'>
                            <div className='rating-num-statistics'>
                                <span>{detailProduct.rating.toFixed(1)}</span>
                            </div>
                            <div className='rating-stars-statistics'>
                                <Rating value={detailProduct.rating} text={''} />
                            </div>
                        </div>
                        <div className='rating-right-side'>
                            <div className='rating-percent-statistics'>
                                <div className='heading-right-side'>
                                    <span>Tỉ lệ đánh giá: </span>
                                </div>
                                {
                                   perRating.map((item,index) => {
                                    return <div className='rating-bar-percent' key={index}>
                                    <div className='label-rating-percent'>
                                            <div className='label-num-rating'>{index + 1}
                                            </div>
                                            <IoIosStar/>
                                        </div>
                                        <Line percent={item} 
                                            strokeWidth={1} 
                                            strokeColor="#000"
                                            strokeLinecap='square'
                                            style={{height: '10px', maxWidth: '250px', width: '100%'}}/>
                                        <span className='rating-num-percent'>{item}%</span>
                                    </div>
                                   })
                                }
                            </div>
                        </div>
                    </div>
                    <div className="row" style={{margin: '15px 0'}}>
                        <span>Sắp xếp theo thời gian: </span>
                        <select value={reverse} onChange={e => sortReview(e.target.value)}>
                            <option value={true}>Cũ nhất</option>
                            <option value={false}>Mới nhất</option>
                        </select>
                    </div>
                    {
                        reviews.length === 0 && (
                            <p style={{color: '#585151', fontWeight: '300', fontSize: '15px', fontStyle: 'italic'}}>Không có đánh giá</p>
                        )
                    }
                    <ReviewItem data={reviews} />
                </div>
                {isLogged ? (

                    <form className="form" onSubmit={submitReviewHandler}>
                        <div>
                            <h2 className='tag-name' style={{ marginTop: '20px' }}>Đánh giá của bạn</h2>
                        </div>
                        <div className="rating-wrapper">
                            <div className='rating-star'>
                                <label htmlFor="rating" style={{ paddingRight: 10, paddingRight: 10, textTransform: 'uppercase', color: '#555', fontWeight: 500 }}>Rate</label>
                                {
                                    [...Array(5)].map((star, index) => {
                                        const ratingValue = index + 1;
                                        return (
                                            <label key={ratingValue}>
                                                <input
                                                    type="radio"
                                                    name="rating"
                                                    value={ratingValue}
                                                    onClick={() => setRating(ratingValue)}
                                                    style={{ display: 'none' }}
                                                />
                                                <FaStar
                                                    className='star'
                                                    color={ratingValue <= (hover || rating) ? "#ffce3d" : "#cccdd3"}
                                                    style={{ cursor: 'pointer' }}
                                                    size={30}
                                                    onMouseEnter={() => setHover(ratingValue)}
                                                    onMouseLeave={() => setHover(null)} />
                                            </label>
                                        )
                                    })
                                }
                            </div>
                            <div className="form-comment">
                                {/* <label htmlFor="comment">Comment</label> */}
                                <div className="comment-avt-user">
                                    <img src={user.imageProfile?.url || "https://fullstack.edu.vn/static/media/fallback-avatar.155cdb2376c5d99ea151.jpg"} alt="" draggable={false} />
                                </div>
                                <textarea
                                    id="comment"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Viết đánh giá ở đây..."
                                    required
                                ></textarea>
                            </div>

                            <div className='send'>
                                <button className={comment ? "primary active" : "primary"} type="submit">
                                    Gửi
                                </button>
                            </div>

                        </div>

                    </form>

                ) : null }
            </div>
            <div className="related-products">
                <h2 className='tag-color'>Sản phẩm liên quan</h2>
                <div className="products relate-products-list res-row">
                    {
                        products.map((product) => {
                            return product.category === detailProduct.category && product._id !== params.id
                                ? <ProductItem key={product._id} product={product}
                                    setCurrentProduct={setCurrentProduct} handleViewDetail={handleViewDetail}
                                /> : null
                        })
                    }
                </div>
            </div>
            <div className="product-view-detail-box">
                {currentProduct && <QuickViewProduct detailProduct={currentProduct} />}
            </div>
            <section className="product-all-info">

            </section>
        </React.Fragment>

    )
}

export default DetailProduct