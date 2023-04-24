import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSpinner } from '@fortawesome/free-solid-svg-icons'

function Forgotpassword() {
  const [email, setEmail] = useState('')
  const [isSend, setIsSend] = useState(true)

  const forgotpasswordSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setIsSend(false)
      await axios.post('/user/forgotpassword', {email})
      setIsSend(true) 
      toast.success('Hãy kiểm tra hộp thư email của bạn nhé!', {
        position: "top-center",
        autoClose: 3000
      })
    } catch (error) {
      setIsSend(true)
      toast.error(error.response.data.msg, {
        position: "top-center",
        autoClose: 3000
      })
    }
  }

    
  return (
    <div className="login-page">
      <form onSubmit={forgotpasswordSubmit} className="form-signin-signout">
        <div className='auth__heading_form'>
          <div className='sign__in_heading'>
            <h2 className='active'>Quên mật khẩu</h2>
          </div>
        </div>
        {!isSend && 
          <div className='sendmail-status'>
            <FontAwesomeIcon
              icon={faSpinner} className="fa-spin"
            /> <span>Chúng tôi đang gửi một đường dẫn tới email của bạn...</span>    
          </div>       
        }
        <input type="email" name="email" placeholder='Nhập email...'
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <div className="sign-up-btn-link">
          <button type="submit">Gửi mã xác nhận</button>
        </div>

        <div className="sign__btn_link">
          <span><Link to="/login">Đăng nhập</Link></span>
        </div>
      </form>
    </div>
  )
}

export default Forgotpassword