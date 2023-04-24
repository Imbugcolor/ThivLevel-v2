import React, { useState, useContext } from 'react'
import { GlobalState } from '../../../GlobalState'
import axios from 'axios'
import { toast } from 'react-toastify'

function Categories() {
  const state = useContext(GlobalState)
  const [categories] = state.categoriesAPI.categories
  const [category, setCategory] = useState('')
  const [token] = state.token
  const [callback, setCallback] = state.categoriesAPI.callback
  const [onEdit, setOnEdit] = useState(false)
  const [id, setID] = useState('')

  const createCategory = async (e) => {
    e.preventDefault()
    try {
      if (onEdit) {
        const res = await axios.put(`/api/category/${id}`, { name: category }, {
          headers: { Authorization: token }
        })
        toast.success(res.data.msg)
      } else {
        const res = await axios.post('/api/category', { name: category }, {
          headers: { Authorization: token }
        })
        toast.success(res.data.msg)
      }
      setOnEdit(false)
      setCategory('')
      setCallback(!callback)
    } catch (err) {
      toast.error(err.response.data.msg)
    }
  }

  const editCategory = async (id, name) => {
    setID(id)
    setCategory(name)
    setOnEdit(true)
  }

  const deleteCategory = async (id) => {
    try {
      const res = await axios.delete(`/api/category/${id}`, {
        headers: { Authorization: token }
      })
      alert(res.data.msg)
      setCallback(!callback)
    } catch (err) {
      toast.error(err.response.data.msg)
    }
  }
  return (
    <div>
      <div className='content-header'>
        <h2>Danh mục</h2>
      </div>

      <div className="content-wrapper">
        <div className="categories">
          <form onSubmit={createCategory}>
            <input type="text" name="category" value={category} required
              onChange={e => setCategory(e.target.value)}
            />

            <button className="create__cat_btn" type="submit">{onEdit ? "Lưu" : "Tạo"}</button>
          </form>

          <div>
            {
              categories.map(category => (
                <div className="row" key={category._id}>
                  <p>{category.name}</p>
                  <div>
                    <button className="update__cat_btn" onClick={() => editCategory(category._id, category.name)}>Sửa</button>
                    <button className="remove__cat_btn" onClick={() => deleteCategory(category._id)}>Xóa</button>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Categories