import React from 'react'
import * as FaIcons from 'react-icons/fa'
import * as BiIcons from "react-icons/bi"
import * as GiIcons from "react-icons/gi"

export const SidebarData = [

    {
        title: 'Thống kê',
        path: '/chart',
        icon: <FaIcons.FaChartPie />
    },
    {
        title: 'Người dùng',
        path: '/users',
        icon: <FaIcons.FaUsers />
    },
    {
        title: 'Quản lý',
        path: '/staff',
        icon: <FaIcons.FaUserShield />
    },

    {
        title: 'Sản phẩm',
        path: '/products_list',
        icon: <GiIcons.GiClothes />
    },
    {
        title: 'Tạo sản phẩm',
        path: '/create_product',
        icon: <BiIcons.BiAddToQueue />
    },
    {
        title: 'Tạo danh mục',
        path: '/category',
        icon: <BiIcons.BiCategory />
    },

    {
        title: 'Đơn hàng',
        path: '/listorders',
        icon: <BiIcons.BiReceipt />
    }

]