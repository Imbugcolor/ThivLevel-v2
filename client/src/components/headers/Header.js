import React, { useContext, useState, useEffect } from 'react'
import { GlobalState } from '../../GlobalState'
import Logo from '../logo/thivlevel-logo-4.png'
import Unknow from '../../images/unknow.jpg'
import * as CgIcons from 'react-icons/cg'
import * as MdIcons from 'react-icons/md'
import * as BiIcons from 'react-icons/bi'
import { Link, useLocation } from 'react-router-dom'
import axios from 'axios'
import { Twirl as Hamburger } from 'hamburger-react'
import { CiUser } from 'react-icons/ci'
import SearchBar from '../mainpages/utils/searchBar/SearchBar'
import { RiArrowDropDownLine } from 'react-icons/ri'
import { MdKeyboardArrowRight } from 'react-icons/md'
import { HiOutlineShoppingBag } from 'react-icons/hi'

function Header() {
    const state = useContext(GlobalState)
    const [isLogged] = state.userAPI.isLogged
    const [isAdmin] = state.userAPI.isAdmin
    const [user] = state.userAPI.user
    const [cart] = state.userAPI.cart

    const [open, setOpen] = useState(false)

    const location = useLocation ()
    const pathname = location.pathname
    const pathnames = pathname.split("/").filter(x => x);
    

    useEffect(() =>{
        if (pathnames.length <= 0) {
            document.querySelector('.nav_1').classList.add('menu_nav_active')
            document.querySelector('.nav_2').classList.remove('menu_nav_active')
            document.querySelector('.nav_3').classList.remove('menu_nav_active')        
        }
        if (pathnames.includes('products') || pathnames.includes('detail')) {
            document.querySelector('.nav_2').classList.add('menu_nav_active')
            document.querySelector('.nav_1').classList.remove('menu_nav_active')
            document.querySelector('.nav_3').classList.remove('menu_nav_active')
        }
        if (pathnames.includes('pages')) {
            document.querySelector('.nav_3').classList.add('menu_nav_active')
            document.querySelector('.nav_1').classList.remove('menu_nav_active')
            document.querySelector('.nav_2').classList.remove('menu_nav_active')
        }
        if (pathnames.length > 0 && !pathnames.includes('pages') && !pathnames.includes('products') && !pathnames.includes('detail')) { 
            document.querySelector('.nav_3').classList.remove('menu_nav_active')
            document.querySelector('.nav_1').classList.remove('menu_nav_active')
            document.querySelector('.nav_2').classList.remove('menu_nav_active')
        }
     
    },[pathnames])

    const logoutUser = async () => {
        await axios.get('/user/logout')
        localStorage.removeItem('firstLogin')
        window.location.href = "/"
        setOpen(false)
    }

    window.onscroll = function() {
        headerFixedHandle()
    }

    function headerFixedHandle() {
        const header = document.querySelector('header')
        if(header) {
            if (document.body.scrollTop > 50 || document.documentElement.scrollTop > 50) {
                document.querySelector('header').classList.add('fix-scroll')
            } else {
                document.querySelector('header').classList.remove('fix-scroll')
            }
        }
        return;
    }

    const loggedRouter = () => {
        return (
            <>
                <li className="user__container">
                    <div className="user__wrapper">
                        <div className='user__name'>
                            <span>{user.username}</span>
                            <RiArrowDropDownLine />
                        </div>
                        <img src={user.imageProfile?.url ?? Unknow} referrerPolicy="no-referrer" alt="profile-avt" />
                    </div>
                    <ul className="user__dropdown">
                        <li>
                            <Link to="/user">
                                <CgIcons.CgProfile style={{ fontSize: 20 }} />
                                <span>Thông tin</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/history">
                                <MdIcons.MdHistory style={{ fontSize: 20 }} />
                                <span>Đơn hàng của tôi</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/" onClick={logoutUser}>
                                <BiIcons.BiLogOut style={{ fontSize: 20 }} />
                                <span>Đăng xuất</span>
                            </Link>
                        </li>
                    </ul>
                </li>
                <li>
                    <div className="cart-icon">
                        <span>{cart ? cart.cart.items.length : 0}</span>
                        <Link to="/cart">
                            <HiOutlineShoppingBag />
                        </Link>
                    </div>
                </li>
            </>
        )
    }
    const loggedRouterMobile = () => {
        return (
            <>
                <li className="user__container-mobile">
                    <ul>
                        <li className="cart-icon">
                            <span>{cart ? cart.cart.items.length : 0}</span>
                            <Link to="/cart" onClick={() => setOpen(false)}>
                                <HiOutlineShoppingBag style={{ fontSize: 24, marginRight: 15 }} />
                                <span>Giỏ hàng</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/user" onClick={() => setOpen(false)}>
                                <CgIcons.CgProfile style={{ fontSize: 24, marginRight: 15 }} />
                                <span>Thông tin</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/history" onClick={() => setOpen(false)}>
                                <MdIcons.MdHistory style={{ fontSize: 24, marginRight: 15 }} />
                                <span>Đơn hàng của tôi</span>
                            </Link>
                        </li>
                        <li>
                            <Link to="/" onClick={logoutUser}>
                                <BiIcons.BiLogOut style={{ fontSize: 20, marginRight: 15 }} />
                                <span>Đăng xuất</span>
                            </Link>
                        </li>
                    </ul>
                </li>
            </>
        )
    }
    if (isAdmin) return null;
    return (
        <header>
            <div className='header__top'>
                <div className="logo">
                    <div style={{ width: 'fit-content' }}>
                        <Link to="/">
                            <img src={Logo} alt="" className="header-logo" />
                        </Link>
                    </div>
                </div>
                <div className='search__bar_header'>
                    <SearchBar />
                </div>
            
                <ul className="header-nav left__top_header">
                    {
                        isLogged ? loggedRouter() : 
                        <li>
                            <div className='login__nav_icon'>
                                <Link to="/login"><span><CiUser /></span></Link>
                            </div>
                            <div className='login_sign_up_nav'>
                                <span><Link to="/login">Đăng nhập</Link></span>                
                            </div>
                        </li>
                    }
                </ul>
               
            </div>
            <div className='menu__nav_header_bottom'>
                <ul className="header-nav">
                    <li className="nav_1 menu_nav_li"><Link to="/">Trang chủ</Link></li>
                    <li className="nav_2 menu_nav_li"><Link to="/products">Sản phẩm</Link></li>
                    <li className="nav_3 menu_nav_li"><Link to="/pages/introduction">Giới thiệu</Link></li>
                </ul>
            </div>
         
            
            <div className="header-nav-tablet-mobile">
                {
                    isLogged ?
                        <div className="user__wrapper">
                            <img src={user.imageProfile?.url ?? Unknow} referrerPolicy="no-referrer" alt="profile-avt" />
                        </div>
                    : null
                }
                <div className="navbar-icon">
                    <Hamburger
                        color="rgb(64, 64, 64)" toggled={open}
                        size="40" rounded toggle={setOpen}
                    />
                </div>
                <div className={`navbar-tablet-mobile-wrapper ${open ? 'active' : ''}`}>
                    <div className='search__bar_mobile'>
                        <SearchBar />
                    </div>
                    <ul>
                        <li><Link to="/" onClick={() => setOpen(false)}>Trang chủ</Link></li>
                        <li><Link to="/products" onClick={() => setOpen(false)}>Shop</Link></li>
                        <li><Link to="/pages/introduction" onClick={() => setOpen(false)}>About us</Link></li>
                        {
                            isLogged ? loggedRouterMobile() : null
                        }
                    </ul>
                    <div className='sign_in__mobile_wrapper'>
                        {
                            isLogged ? null : 
                            <Link to="/login" onClick={() => setOpen(false)}>
                                <div className='sign_in__mobile'>
                                    <CiUser />
                                    <h4>ĐĂNG NHẬP</h4>
                                    <MdKeyboardArrowRight />
                                </div>
                            </Link>
                        }
                    </div>
                </div>
            </div>
            {open ? <div className="header-nav-tablet-mobile overlay"
                onClick={() => setOpen(false)}
            ></div> : null}

        </header>
    )
}

export default Header