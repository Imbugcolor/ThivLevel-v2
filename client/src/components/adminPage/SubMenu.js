import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

const SidebarLink = styled(Link)`
    display: flex;
    color: #8a93a2;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    height: 60px;
    font-size: 18px;
    box-shadow: inset 0 0 0 0 8a93a2;
    transition: box-shadow linear .2s;
    font-weight: 300;
    width: 250px;
    &:hover {
        box-shadow: inset 5px 0 0 0 #8a93a2;
    }

`;

const SidebarLabel = styled.span`
    margin-left: 16px
`;

const SidebarItem = styled.div`
    display: flex;
    align-items: center;
`

function SubMenu({ item }) {


    return (
        <>
            <SidebarLink to={item.path || '#!'}>
                <SidebarItem>
                    {item.icon}
                    <SidebarLabel>{item.title}</SidebarLabel>
                </SidebarItem>
            </SidebarLink>

        </>
    )
}

export default SubMenu