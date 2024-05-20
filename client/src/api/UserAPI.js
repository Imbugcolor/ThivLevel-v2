import { useState, useEffect } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import { io } from 'socket.io-client'
import { BASE_URL } from '../components/mainpages/utils/config'

function UserAPI(token) {
    const [isLogged, setIsLogged] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [history, setHistory] = useState([])
    const [user, setUser] = useState([])
    const [callback, setCallback] = useState(false)
    const [allUser, setAllUser] = useState([])
    const [allUserCopy, setAllUserCopy] = useState([])
    const [allStaff, setAllStaff] = useState([])
    const [allStaffCopy, setAllStaffCopy] = useState([])
    const [loading, setLoading] = useState(false)
    const [cart, setCart] = useState()
    const [total, setTotal] = useState(0)
    const [socket, setSocket] = useState(null)

    useEffect(() => {
        if (token) {
            const getUser = async () => {
                try {
                    setLoading(true)
                    const res = await axios.get('/user/infor', {
                        headers: { Authorization: token }
                    })

                    setIsLogged(true)
                    res.data.role === 1 ? setIsAdmin(true) : setIsAdmin(false)
                    setUser(res.data)
                    
                    setLoading(false)

                    const getCart = async () => {
                        try {
                            const res = await axios.get('/user/cart', {
                                headers: { Authorization: token }
                            })
                      
                            setCart(res.data)
                            setTotal(res.data.cart.subTotal)
                            
                        } catch (err) {
                            console.log(err.response.data.msg)
                        }
                    }
                    getCart()

                    if(res.data.role === 1)
                    {
                        const getAllUser = async () => {
                            try {
                                const res = await axios.get('/user/alluser?role=0', {
                                    headers: { Authorization: token }
                                })

                                setAllUser(res.data)
                                setAllUserCopy(res.data)

                            } catch (err) {
                                alert(err.response.data.msg)
                            }
                        }
                        getAllUser()
                        
                        const getAllStaff = async () => {
                            try {
                                const res = await axios.get('/user/alluser?role=1', {
                                    headers: { Authorization: token }
                                })

                                setAllStaff(res.data)
                                setAllStaffCopy(res.data)

                            } catch (err) {
                                alert(err.response.data.msg)
                            }
                        }
                        getAllStaff()
                     }

                } catch (err) {
                    alert(err.response.data.msg)
                }
            }
            getUser()

            // create new socket 
            const connectSocket = io(BASE_URL)
            setSocket(connectSocket)
            return () => connectSocket.close()
        }
        
    }, [token, callback])

    const addCart = async (product, color, size, quantity) => {
        
        const swalCustomButtons = Swal.mixin({
            customClass: {
              confirmButton: 'btn-ok'
            },
            buttonsStyling: false
        })

        if (!isLogged) return Swal.fire({
            title: `<span class='title-msg-dialog'>Đăng nhập để tiếp tục?</span>`,
            showCancelButton: true,
            confirmButtonText: 'Đăng nhập',
          }).then((result) => {
            /* Read more about isConfirmed, isDenied below */
            if (result.isConfirmed) {
                window.location.href = "/login"
            } else if (result.isDenied) {
              
            }
          })

        if(product.countInStock < quantity ) return  swalCustomButtons.fire({
            width: 400,
            icon: 'warning',
            title: `<span class='title-msg-dialog'>Sản phẩm không đủ số lượng đáp ứng.</span>`,
            showConfirmButton: true,
        })

        
        await axios.patch('/user/addcart', { productId: product._id , color, size, quantity }, {
            headers: { Authorization: token }
        })

        setCallback(!callback)

        swalCustomButtons.fire({
            width: 500,
            icon: 'success',
            title: `<span class='title-msg-dialog'>Thêm vào giỏ hàng thành công.</span>`,
            showConfirmButton: true,
            timer: 1500
        })

    }
    
    return {
        isLogged: [isLogged, setIsLogged],
        isAdmin: [isAdmin, setIsAdmin],
        callback: [callback, setCallback],
        history: [history, setHistory],
        user: [user, setUser],
        socket: [socket, setSocket],
        cart: [cart, setCart],
        total: [total, setTotal],
        addCart: addCart, 
        allUser: [allUser, setAllUser],
        allUserCopy: [allUserCopy, setAllUserCopy],
        allStaff: [allStaff, setAllStaff],
        allStaffCopy: [allStaffCopy, setAllStaffCopy],
        loading: [loading, setLoading]
    }
}

export default UserAPI