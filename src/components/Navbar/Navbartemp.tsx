import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { ProSidebar, Menu, MenuItem, SidebarFooter, SidebarContent } from 'react-pro-sidebar';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArchive, faBars, faChartColumn, faGavel, faHome, faInfoCircle, faQuestion, faTable } from '@fortawesome/free-solid-svg-icons';

import 'react-pro-sidebar/dist/css/styles.css';
import './navbarTemp.css';
import { ROUTES } from '../../constants/routes';

const MENU_ITEMS = [
    {
        title: "Welcome page",
        route: "",
        icon: faHome,
    },
    {
        title: "Table View",
        route: ROUTES.TABLE_VIEW,
        icon: faTable,
    },
    {
        title: "File Info Dashboard",
        route: ROUTES.FILE_DASHBOARD,
        icon: faInfoCircle,
    },
    {
        title: "License Info Dashboard",
        route: ROUTES.LICENSE_DASHBOARD,
        icon: faGavel,
    },
    {
        title: "Package Info Dashboard",
        route: ROUTES.PACKAGE_DASHBOARD,
        icon: faArchive,
    },
    {
        title: "Chart Summary View",
        route: ROUTES.PACKAGE_DASHBOARD,
        icon: faChartColumn,
        // icon: faBarChart,
    },
    {
        title: "Help with Application",
        route: ROUTES.HELP,
        icon: faQuestion,
    },
]

const NavbarTemp = () => {
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
                                active={menuItem.route === "" + location.pathname}
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
        <div style={{ width: 65, minWidth: 65, minHeight: '100vh'}}>
        </div>
        </>
    )
}

export default NavbarTemp