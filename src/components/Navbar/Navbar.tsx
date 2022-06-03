import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ProSidebar, Menu, MenuItem, SidebarFooter, SidebarContent } from 'react-pro-sidebar';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive, faBars, faChartColumn, faGavel, faHome, faInfoCircle, faQuestion, faTable } from '@fortawesome/free-solid-svg-icons';

import 'react-pro-sidebar/dist/css/styles.css';
import './navbar.css';

const MENU_ITEMS = [
    {
        title: "Welcome page",
        link: "/",
        icon: faHome,
    },
    {
        title: "Table View",
        link: "/table-view",
        icon: faTable,
    },
    {
        title: "File Info Dashboard",
        link: "/file-dashboard",
        icon: faInfoCircle,
    },
    {
        title: "License Info Dashboard",
        link: "/license-dashboard",
        icon: faGavel,
    },
    {
        title: "Package Info Dashboard",
        link: "/package-dashboard",
        icon: faArchive,
    },
    {
        title: "Chart Summary View",
        link: "/chart-summary",
        icon: faChartColumn,
        // icon: faBarChart,
    },
    {
        title: "Help with Application",
        link: "/help",
        icon: faQuestion,
    },
]

const Navbar = () => {
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState<boolean>(true);



    return (
        <ProSidebar
            collapsed={collapsed}
            onMouseOver={() => setCollapsed(false)}
            onMouseOut={() => setCollapsed(true)}
            className='navbar-wrapper'
        >
            <SidebarContent>
                <Menu iconShape="round">
                    {
                        MENU_ITEMS.map(menuItem => (
                            <MenuItem
                                icon={<FontAwesomeIcon icon={menuItem.icon} />}
                                onClick={() => navigate(menuItem.link)}
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
    )
}

export default Navbar