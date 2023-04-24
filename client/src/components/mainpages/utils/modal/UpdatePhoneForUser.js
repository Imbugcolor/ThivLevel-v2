import axios from 'axios'
import React, {useState, useContext, useEffect} from 'react'
import { GlobalState } from '../../../../GlobalState'
import { FaRegTimesCircle } from 'react-icons/fa'
import { toast } from 'react-toastify'

function UpdatePhoneForUser() {
    const state = useContext(GlobalState)
    const [token] = state.token
    const [user] = state.userAPI.user
    const [callback, setCallback] = state.userAPI.callback
    const [phone, setPhone] = useState('')
    const [validatePhoneMsg, setValidatePhoneMsg] = useState('')

    useEffect(() => {
        setPhone(user.phone ?? '')
    }, [user])

    const validatePhone = () => {
        const msg = {}
        const firstNum = phone.toString().charAt(0)
        
        if(!phone) {
            msg.phone = '*Bạn chưa nhập số điện thoại'
        } 
        else if (phone.length !== 10 || parseInt(firstNum,10) !== 0 ) {
            msg.phone = '*Số điện thoại không hợp lệ 1'
        } 
        setValidatePhoneMsg(msg)
        if(Object.keys(msg).length > 0) return false
        return true
    }

    const handleCloseView = (e) => {
        e.preventDefault()
        const viewbox = document.querySelector('.update-phone-profile-box')
        viewbox.classList.remove('active')
    }
    
    const handleSaveChangePhone = async (e) => {
        const isValid = validatePhone()
        if(!isValid) return
        try {
                     
            const before = phone.toString().slice(1)
            const after = parseInt(before,10)

            await axios.patch(`/user/updatephone/`, { phone: after }, {
                headers: { Authorization: token }
            })

            toast.success('Cập nhật số điện thoại thành công!', {
                position: "top-center",
                autoClose: 3000
              });
            setCallback(!callback)

            const viewbox = document.querySelector('.update-phone-profile-box')
            viewbox.classList.remove('active')

        } catch (err) {
            toast.error(err.response.data.msg, {
                position: "top-center",
                autoClose: 3000
            })
        }
    }
    return (
    <div className="phone-change-modal">
         <section className="form-change-phone">
            <div className='form-change-phone-wrapper'>
                <div className='change-phone-number-field'>
                    <label>Phone number:</label>
                    <div className='phone-number-profile-input'>
                        <span>+84</span>
                        <input type="number" value={phone} onChange={(e) => setPhone(e.target.value)}/>
                    </div>
                    <div className='validate-phone-msg'>
                        <span>{validatePhoneMsg.phone}</span>
                    </div>
                </div>
            </div>
            <div className="phone-close" onClick={handleCloseView}>
                    <FaRegTimesCircle style={{ color: '#d93938' }} />
            </div>
            <div className='btn-ctrl-modal'>
                <button className='cancel-change-phone-modal-btn' onClick={handleCloseView}>Cancel</button>
                {
                    user.phone === phone ? 
                    <button className='save-change-phone-modal-btn'>Save</button>
                    : <button className='save-change-phone-modal-btn' onClick={handleSaveChangePhone}>Save</button>
                }
                
            </div>
         </section>
    </div>
  )
}

export default UpdatePhoneForUser
