import React, { useContext, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { GlobalState } from '../../../../GlobalState'
import { GoSearch } from 'react-icons/go'

function SearchBar() {

    const state = useContext(GlobalState)
    const [data, setData] = state.productsAPI.suggestions
    const [filterData, setFilterData] = useState([])
    const [wordEntered, setWordEntered] = useState('')
    const [sort, setSort] = state.productsAPI.sort
    const [search, setSearch] = state.productsAPI.search
    const [category, setCategory] = state.productsAPI.category

    const [open, setOpen] = useState(false)

    useEffect(() => {
        setSearch('')
        setSort('')
        setCategory('')
    }, [])

    const handleSearch = (e, keySearch) => {
        if (e.key === 'Enter') {
            setWordEntered(keySearch)
            setOpen(false)
        }
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

    const handleCloseSearch = () => {
        setWordEntered('')
        setFilterData([])
    }

    return (
        <div className="filter_menu product">

            <div className="search search__bar_wrapper" >
                <div className="search__input_icon">
                    <GoSearch />
                </div>
                <input className="search-input-bd-none search__bar_input" type="text" placeholder="Nhập sản phẩm bạn muốn tìm kiếm ..."
                    value={wordEntered}
                    onKeyPress={(e) => {handleSearch(e,wordEntered)}}
                    onChange={handleSuggest}
                    onFocus={() => setOpen(true)}
                    onBlur={e => {
                        e.relatedTarget?.classList.contains('redirect_item_result') ?
                            e.preventDefault() :
                            setOpen(false)
                    }}
                />
                <div className='close_search_bar' style={{opacity: wordEntered ? 1 : 0}}
                onClick={handleCloseSearch}>
                    Hủy
                </div>
                {
                    open && filterData.length > 0 ?
                        <ul className="list_item_suggest">
                            <li className='key_search_msg'>
                                <GoSearch /> kết quả cho '{wordEntered}'
                            </li>
                            {
                                filterData.map((item, index) => {
                                    return index > 15 ? null :
                                        <li key={item._id} className="item_suggest_result">
                                            <div className='left__item_suggest_result'>
                                                <Link to={`/detail/${item._id}`} className="redirect_item_result" onClick={(e) => {
                                                    setWordEntered(e.target.innerText)  
                                                    setSearch('')  
                                                    setCategory('')                                        
                                                    setOpen(false)
                                                }}>
                                                    {item.title}
                                                </Link>
                                                <span>{item.price} $</span>
                                            </div>
                                            <div className='right__item_suggest_result'>
                                                <Link to={`/detail/${item._id}`} className="redirect_item_result" onClick={(e) => {
                                                    setSearch('')
                                                    setCategory('')
                                                    setWordEntered(e.target.innerText)                                            
                                                    setOpen(false)
                                                }}>
                                                    <img src={item.images[0].url}/>
                                                </Link>    
                                            </div>                                          
                                        </li>
                                })
                            }
                        </ul>
                        : open && filterData.length === 0 && wordEntered ? 
                        <ul className="list_item_suggest">
                            <li className='not__found_msg'>
                                <GoSearch /> Không có kết quả cho '{wordEntered}'
                            </li>
                        </ul> : null
                }
            </div>

        </div >
    )
}

export default SearchBar

