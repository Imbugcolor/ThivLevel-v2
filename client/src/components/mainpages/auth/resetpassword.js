import React, { useState, useEffect} from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

function Resetpassword() {
  const [isValid, setIsValid] = useState(false)
  const {id} = useParams()
  const {token} = useParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isUpdated, setIsUpdated] = useState(false)

  useEffect(() => {
    const getLink = async() =>{
        try {

          const res = await axios.get(`/user/resetpassword/${id}/${token}`)

          res.data ? setIsValid(true) : setIsValid(false)

        } catch (err) {
          return alert(err.response.data.msg)
      } 
    }
    getLink()
  }, [id, token])


  if(!isValid) return null

  const registerSubmit = async (e) => {
    e.preventDefault()
    try {
      if(password !== confirmPassword) return toast.error('Password & Confirm password is not match.', {
        position: "top-center",
        autoClose: 3000
      })

      await axios.patch('/user/updatenewpassword', {id, token, password})

      setIsUpdated(true)

      toast.success('Your password updated successfully', {
        position: "top-center",
        autoClose: 3000
      })

      setTimeout (() => {
        window.location.href = '/login'
      }, 3000)

    } catch (error) {
      setIsUpdated(false)
      toast.error(error.response.data.msg, {
        position: "top-center",
        autoClose: 3000
      })
    }
  }

  return (
    <div className="login-page">
      <form onSubmit={registerSubmit} className="form-signin-signout">
        <div className='auth__heading_form'>
          <div className='sign__in_heading'>
            <h2 className='active'>Khôi phục tài khoản</h2>
          </div>
        </div>
      
        <input type="password" name="password" placeholder='Nhập mật khẩu mới'
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={isUpdated}
        />

        <input type="password" name="confirmPassword" placeholder='Xác nhận mật khẩu'
          autoComplete="on"
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          disabled={isUpdated}
        />

        <div className="row">
          <button type="submit">Xác nhận</button>
        </div>

        <div className="sign__btn_link">
          <span><Link to="/login">Đăng nhập</Link></span>
        </div>
      </form>
    </div>
  )
}

export default Resetpassword