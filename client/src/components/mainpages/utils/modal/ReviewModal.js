import React, { useContext, useState } from 'react'
import { FaRegTimesCircle, FaStar } from 'react-icons/fa'
import { GlobalState } from '../../../../GlobalState'
import axios from 'axios'
import Swal from 'sweetalert2'

const ReviewModal = ({item, setOpenReviewModal}) => {

    const state = useContext(GlobalState)
    const [token] = state.token
    const [user] = state.userAPI.user
    const [rating, setRating] = useState(0)
    const [hover, setHover] = useState(null)
    const [comment, setComment] = useState('')
    const [callback, setCallback] = state.productsAPI.callback

    const handleCloseView = () => {
        setOpenReviewModal(false)
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
            await axios.post(`/api/products/${item.product_id}/feedback`, { rating, comment }, {
                headers: { Authorization: token }
            })
            setRating(0)
            setComment('')
            setOpenReviewModal(false)
            setCallback(!callback)
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
            setOpenReviewModal(false)
            swalCustomButtons.fire({
                width: 400,
                icon: 'warning',
                title: `<span class='title-msg-dialog'>${err.response.data.msg}</span>`,
                showConfirmButton: true
            })
        }
    }

    return (
        <div className='review__feedback_modal'>
            <div className='review__container'>
                <div>
                    <h2 className='tag-name' style={{ marginTop: '20px' }}>Đánh giá của bạn</h2>
                </div>
                <div className='review__item'>
                    <img src={item.images[0].url}/>
                    <p>{item.title}</p>
                </div>
                <div className='review__form'>
                    <form className="form" onSubmit={submitReviewHandler}>
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
                            <div className="form-review">
                                {/* <label htmlFor="comment">Comment</label> */}
                                <div className="review__avt-user">
                                    <img src={user.imageProfile?.url || "https://fullstack.edu.vn/static/media/fallback-avatar.155cdb2376c5d99ea151.jpg"} alt="" draggable={false} />
                                </div>
                                <textarea
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
                </div>
                <div className="modal-close-btn" onClick={handleCloseView}>
                    <FaRegTimesCircle style={{ color: '#d93938' }} />
                </div>
            </div>
        </div>
    )
}

export default ReviewModal
