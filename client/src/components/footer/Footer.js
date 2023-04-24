import React from 'react'
import Logo from '../logo/thivlevel-logo-4.png'
import FbIcon from '../../images/icon_fbn.webp'
import InsIcon from '../../images/icon_instan.webp'
import TiktokIcon from '../../images/icon_tiktok.webp'
import PaypalIcon from '../../images/Paypal_2014_logo.png'
import CodLogo from '../../images/cod-logo.webp'
import VisaLogo from '../../images/visa-logo.png'
import * as AiIcons from 'react-icons/ai'
import * as ImIcons from 'react-icons/im'
import { Link } from 'react-router-dom'

function Footer() {

    return (
        <footer className="footer res-row">
            <div className="col l-10 l-o-1 m-10 m-o-1 c-12">
                <div className="res-row">
                    <div className="col l-4 m-4 c-12 footer-item">
                        <div className="footer-logo">
                            <img src={Logo} alt="" />
                            <ul>
                                <li>
                                    <AiIcons.AiFillMail />
                                    <span>
                                        vtclothes.shop@gmail.com
                                    </span>
                                </li>
                                <li>
                                    <AiIcons.AiFillPhone />
                                    <span>
                                        0123 456 789
                                    </span>
                                </li>
                                <li>
                                    <ImIcons.ImLocation />
                                    <span>
                                        71/9 XVNT
                                    </span>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col l-4 m-4 c-6 footer-item">
                        <div className="footer-item policy">
                            <h4 className="footer-item-header">Về ThivLevel</h4>
                            <ul>
                                <li>
                                    <Link to="/pages/introduction">
                                        Giới thiệu
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/pages/guarantee">
                                        Chính sách đổi trả
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/pages/privacyPolicy">
                                        Chính sách bảo mật
                                    </Link>
                                </li>
                                <li>
                                    <Link to="/pages/termOfService">
                                        Điều khoản dịch vụ
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                    <div className="col l-4 m-4 c-6 footer-item">
                        <div className="footer-item social-network">
                            <div>
                                <h4 className="footer-item-header">THEO DÕI CHÚNG TÔI</h4>
                                <ul>
                                    <li>
                                        <a href="https://www.facebook.com/profile.php?id=100088054956329" target="_blank">
                                        
                                            <img className="social__media_icon" src={FbIcon} />
                                            <span>
                                                Fanpage ThiV Level
                                            </span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#!">
                                            <img className="social__media_icon" src={InsIcon}/>
                                            <span>
                                                Instagram ThiV Level
                                            </span>
                                        </a>
                                    </li>
                                    <li>
                                        <a href="#!">
                                            <img className="social__media_icon" src={TiktokIcon}/>
                                            <span>
                                                Tiktok ThiV Level
                                            </span>
                                        </a>
                                    </li>
                                </ul>
                            </div>
                            <div className='payment__method_footer'>
                                <h4 className="footer-item-header">Phương thức thanh toán</h4>
                                <div className='payment__method_icon'>
                                    <img className="social__media_icon" src={CodLogo}/>
                                    <img className="social__media_icon" src={PaypalIcon}/>
                                    <img className="social__media_icon" src={VisaLogo}/>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col l-12 m-12 c-12">
                        <h5 className="copyright">@Since 2022 THIVLEVEL</h5>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer