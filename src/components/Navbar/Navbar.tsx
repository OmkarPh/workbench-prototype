import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ProSidebar, Menu, MenuItem, SidebarFooter, SidebarContent } from 'react-pro-sidebar';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive, faBars, faChartColumn, faGavel, faHome, faInfoCircle, faQuestion, faTable } from '@fortawesome/free-solid-svg-icons';

import 'react-pro-sidebar/dist/css/styles.css';
import './navbar.css';

const MENU_ITEMS = [
    {
        title: "Welcome page",
        route: "/",
        icon: faHome,
    },
    {
        title: "Table View",
        route: "/table-view",
        icon: faTable,
    },
    {
        title: "File Info Dashboard",
        route: "/file-dashboard",
        icon: faInfoCircle,
    },
    {
        title: "License Info Dashboard",
        route: "/license-dashboard",
        icon: faGavel,
    },
    {
        title: "Package Info Dashboard",
        route: "/package-dashboard",
        icon: faArchive,
    },
    {
        title: "Chart Summary View",
        route: "/chart-summary",
        icon: faChartColumn,
        // icon: faBarChart,
    },
    {
        title: "Help with Application",
        route: "/help",
        icon: faQuestion,
    },
]

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    const [collapsed, setCollapsed] = useState<boolean>(true);
    const expandOnHover = true;


    return (
        <>
        <ProSidebar
            collapsed={collapsed}
            onMouseEnter={() => expandOnHover && setCollapsed(false)}
            onMouseLeave={() => expandOnHover && setCollapsed(true)}
            className='navbar-wrapper'
        >
            <SidebarContent>
                <Menu iconShape="round">
                    {
                        MENU_ITEMS.map(menuItem => (
                            <MenuItem
                                key={menuItem.route}
                                active={menuItem.route === location.pathname}
                                icon={<FontAwesomeIcon icon={menuItem.icon} />}
                                onClick={() => navigate(menuItem.route)}
                            >
                                { menuItem.title }
                            </MenuItem>
                        ))
                    }
                </Menu>
            </SidebarContent>
            <SidebarFooter>
                <Menu iconShape="round">
                    <MenuItem
                        icon={<FontAwesomeIcon icon={faBars} />}
                        onClick={() => setCollapsed(prev => !prev)}
                    >
                        {/* <FontAwesomeIcon icon={faArrowLeft} className="mx-2" /> */}
                        Collapse 
                    </MenuItem>
                </Menu>
                {/* <button
                    id="toggle-btn"
                    className="btn btn-sidebar"
                    onClick={() => setCollapsed(prev => !prev)}
                >
                    <FontAwesomeIcon icon={faBars} />
                </button> */}
            </SidebarFooter>
        </ProSidebar>
        {/* Dummy sidebar to occupy space in dom */}
        <div className='dummy-sidebar'>
        </div>
        </>
    )
}

export default Navbar