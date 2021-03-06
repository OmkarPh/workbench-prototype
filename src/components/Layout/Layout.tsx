import React, { useEffect } from 'react'
import SplitPane from 'react-split-pane-v2'
import { useLocation } from 'react-router-dom';
import { ReflexContainer, ReflexElement, ReflexSplitter } from 'react-reflex';

// TODO - FIX THIS !!!!
// eslint-disable-next-line import/namespace
import { Allotment } from 'allotment';

import Navbar from '../Navbar/Navbar';
import FileTree from '../FileTree/FileTree'
import Navbar2 from '../Navbar/Navbar2';

import { FILE_TREE_ROUTES } from '../../constants/routes';

import './layout.css';
import "allotment/dist/style.css";


const Layout = (props: React.PropsWithChildren) => {
  const { pathname } = useLocation();
  
  const showFileTree = FILE_TREE_ROUTES.find(route => pathname.includes(route)) !== undefined;

  return (
    <div className='d-flex flex-row'>
      <Navbar2 />
      {/* <Navbar /> */}

      <Allotment className='pane-container'>
        <Allotment.Pane
          visible={showFileTree}
          minSize={120}
          maxSize={400}
          className="file-tree-pane overflow-scroll"
          preferredSize="20%"
        >
          <FileTree style={{ minHeight: "100vh" }} />
        </Allotment.Pane>
        <Allotment.Pane className='overflow-scroll'>
          <div className='content-container'>
            { props.children }
          </div>
        </Allotment.Pane>
      </Allotment>
      

      {/* <ReflexContainer orientation="horizontal">
        {
          show &&
          <>
            <ReflexElement className="left-pane">
              <div>
                <FileTree style={{ minHeight: "100vh" }} className="pane-content" />
              </div>
            </ReflexElement>
            <ReflexSplitter/>
          </>
        }
        <ReflexElement className="right-pane">
          <div className="pane-content">
            { props.children }
          </div>
        </ReflexElement>
      </ReflexContainer> */}


      {/* <SplitPane>
        { 
          show &&
          <FileTree style={{ minHeight: "100vh" }} />
        }
        <div> */}
        {/* <div style={{ minWidth: '90vw'}}> */}
          {/* { props.children }
        </div>
      </SplitPane> */}
    </div>
  )
}

export default Layout