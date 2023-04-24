import React, { useContext, useEffect, useState } from 'react'
import { GlobalState } from '../../../GlobalState'
import * as GoIcons from 'react-icons/go'
import { FcClearFilters } from 'react-icons/fc'

function Filters({ setItemOffset, setFprice, setTprice, setFromPrice, setToPrice, setSizes }) {

    const state = useContext(GlobalState)
    const [categories] = state.categoriesAPI.categories
    const [category, setCategory] = state.productsAPI.category
    const [data, setData] = state.productsAPI.suggestions
    const [filterData, setFilterData] = useState([])
    const [wordEntered, setWordEntered] = useState('')
    const [sort, setSort] = state.productsAPI.sort
    const [search, setSearch] = state.productsAPI.search
    const [searchItem] = state.productsAPI.searchItem
    const [isAdmin] = state.userAPI.isAdmin

    const [open, setOpen] = useState(false)

    useEffect(() => {
        setSearch('')
        setSort('')
        setCategory('')
    }, [])

    const handleCategory = (e) => {
        setCategory(e.target.value)
        setItemOffset(0)
    }

    const handleSearch = (e, keySearch) => {
        if (e.key === 'Enter') {
            setWordEntered(keySearch)
            setSearch(keySearch.toLowerCase())
            setItemOffset(0)
            setOpen(false)
        }
    }

    const handleSearchBtn = (value) => {
        setSearch(value.toLowerCase())
        setItemOffset(0)
        setOpen(false)     
    }

    const handleSuggest = e => {
        setOpen(true)
        const searchWord = e.target.value
        setWordEntered(searchWord)
        const newFilter = data.filter((product) => {
            return product.title.toLowerCase().includes(searchWord.toLowerCase())
        })
        // setSuggestions(e.target.value.toLowerCase())
        if(searchWord === '') {
            setFilterData([])
        } else {
            setFilterData(newFilter)
        }
        
    }

    const handleRemoveFilter = () => {
        setWordEntered('')
        setSearch('')  
        setCategory('')
        setSort('')
        setFromPrice('')
        setToPrice('')
        setFprice(0)
        setTprice(5000)
        setSizes('')
    }

    return (
        <div className="filter_menu product filter_product_wrapper">
            <div className='filter_left_side'>
                {
                    isAdmin ? 
                    null : 
                    <div className='remove__filter_wrapper'>
                        <button onClick={handleRemoveFilter}><FcClearFilters /></button>
                    </div>
                }
                <div className="search search_product_page" >
                    
                    <input className="search-input-bd-none" type="text" placeholder="Nhập sản phẩm bạn muốn tìm kiếm ..."
                        value={wordEntered}
                        onKeyPress={(e) => {handleSearch(e,wordEntered)}}
                        onChange={handleSuggest}
                        onFocus={() => setOpen(true)}
                        onBlur={e => {
                            e.relatedTarget?.classList.contains('result-link') ?
                                e.preventDefault() :
                                setOpen(false)
                        }}
                    />
                    <button className="search-btn" onClick={() => handleSearchBtn(wordEntered)}>
                        <GoIcons.GoSearch />
                    </button>
                    {
                        open && filterData.length > 0 ?
                            <ul className="result-list">
                                {
                                    filterData.map((item, index) => {
                                        return index > 4 ? null :
                                            <li key={item._id} className="result-item">
                                                <a href="#!" className="result-link" onClick={(e) => {
                                                    setWordEntered(e.target.innerText)
                                                    setSearch(e.target.innerText.toLowerCase())
                                                    setItemOffset(0)
                                                    setOpen(false)
                                                }}>
                                                    {item.title}
                                                </a>
                                            </li>
                                    })
                                }
                            </ul>
                            : null
                    }
                </div>
            </div>
            <div className="tool-wrapper">
                <div className='filter_right_side'>
                    <div className="filter">
                        <span>Lọc theo</span>
                        <select name="category" value={category} onChange={handleCategory}>
                            <option value="">Tất cả sản phẩm</option>
                            {
                                categories.map(category => (
                                    <option value={"category=" + category._id} key={category._id}>
                                        {category.name}
                                    </option>
                                ))
                            }
                        </select>
                    </div>
                    <div className="sort">
                        <span>Sắp xếp theo</span>
                        <select value={sort} onChange={e => setSort(e.target.value)}>
                            <option value="">Mới nhất</option>
                            <option value="sort=oldest">Cũ nhất</option>
                            <option value="sort=-sold">Best sales</option>
                            <option value="sort=-price">Giá: Cao -&gt; Thấp</option>
                            <option value="sort=price">Giá: Thấp -&gt; Cao</option>
                        </select>
                    </div>
                </div>
            </div>

        </div >
    )
}

export default Filters