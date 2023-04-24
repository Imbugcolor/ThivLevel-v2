import React, { useContext } from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'
import * as BiIcons from 'react-icons/bi'
import * as AiIcons from 'react-icons/ai'
import { GlobalState } from '../../GlobalState'
import { SidebarData } from './SidebarData'
import SubMenu from './SubMenu'
import { IconContext } from 'react-icons/lib'
import MainPages from '../mainpages/Pages'
import axios from 'axios'
import Logo from '../logo/thivlevel-logo-4.png'
import Unknow from '../../images/unknow.jpg'
import { RiArrowDropDownLine } from 'react-icons/ri'

const Nav = styled.div`
  border-bottom: 1px solid #ddd;
  background: #fff;
  height: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const NavIcon = styled(Link)`
  margin-left: 2rem;
  font-size: 2rem;
  height: 80px;
  color: #6d6e70;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
`;

const SidebarNav = styled.nav`
  background: #eee;
  width: 100%;
  height: calc(100vh - 80px);
  z-index: 10;
  display: flex;
  margin-top: 15px;
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  background-color: #eee;
`;

const SidebarWrap = styled.div`
  border-radius: 10px;
  overflow: hidden;
  margin-right: 20px;
  background: #fff;
  border: 1px solid #ddd;
`;

const FlexDiv = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const Logout = styled(Link)`
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 18px;
  color: #6d6e70;
  padding: 5px;
  margin-right: 20px;
`

const AdminProfile = styled(Link)`
  margin: 0 20px;
  font-size: 18px;
  color: #6d6e70;
  font-weight: 500;
  display: flex;
  align-items: center;
`

function Sidebar() {

  const state = useContext(GlobalState)
  const [isAdmin] = state.userAPI.isAdmin
  const [user] = state.userAPI.user

  const logoutUser = async () => {
    await axios.get('/user/logout')

    localStorage.removeItem('firstLogin')

    window.location.href = "/"
  }

  if (!isAdmin) return null;
  return (
    <>
      <IconContext.Provider value={{ color: '#6d6e70' }}>
        <Nav>
          <NavIcon to="/">
            <img src={Logo} style={{height: '50px'}}/>
          </NavIcon>

          <FlexDiv>
            <AdminProfile to='/user'>
              <div className='user__name' style={{display: 'flex', alignItems: 'center', fontWeight: '300'}}>
                  <span>{user.username}</span>
                  <RiArrowDropDownLine />
              </div>
              <img className="admin_img_profile" src={user.imageProfile?.url ?? Unknow} referrerPolicy="no-referrer" alt="profile-avt" />
            </AdminProfile>

            <Logout to="/" onClick={logoutUser}>
              <BiIcons.BiLogOut style={{ marginRight: 10 }} />
              Đăng xuất
            </Logout>
          </FlexDiv>
        </Nav>

        <SidebarNav>
          <SidebarWrap>
            {SidebarData.map((item, index) => (
              <SubMenu
                item={item}
                key={index}
              />
            ))}
          </SidebarWrap>
          <Content>
            <MainPages></MainPages>
          </Content>
        </SidebarNav>
      </IconContext.Provider>
    </>
  )
}

export default Sidebar