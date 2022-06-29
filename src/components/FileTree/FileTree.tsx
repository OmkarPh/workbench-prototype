import Tree from 'rc-tree';
import { DataNode } from 'rc-tree/lib/interface';
import React, { useEffect, useState } from 'react';
import { Op } from 'sequelize';
import { useWorkbenchDB } from '../../contexts/workbenchContext';

import './FileTree.css';

const defaultTreeData = [
  {
    key: '0-0',
    title: 'parent 1',
    children: [
      { key: '0-0-0', title: 'parent 1-1', children: [{ key: '0-0-0-0', title: 'parent 1-1-0' }] },
      {
        key: '0-0-1',
        title: 'parent 1-2',
        children: [
          { key: '0-0-1-0', title: 'parent 1-2-0', disableCheckbox: true },
          { key: '0-0-1-1', title: 'parent 1-2-1' },
          { key: '0-0-1-2', title: 'parent 1-2-2' },
          { key: '0-0-1-3', title: 'parent 1-2-3' },
          { key: '0-0-1-4', title: 'parent 1-2-4' },
          { key: '0-0-1-5', title: 'parent 1-2-5' },
          { key: '0-0-1-6', title: 'parent 1-2-6' },
          { key: '0-0-1-7', title: 'parent 1-2-7' },
          { key: '0-0-1-8', title: 'parent 1-2-8' },
          { key: '0-0-1-9', title: 'parent 1-2-9' },
        ],
      },
    ],
  },
];

const motion = {
  motionName: 'node-motion',
  motionAppear: false,
  onAppearStart: () => ({ height: 0 }),
  onAppearActive: (node: HTMLElement) => ({ height: node.scrollHeight }),
  onLeaveStart: (node: HTMLElement) => ({ height: node.offsetHeight }),
  onLeaveActive: () => ({ height: 0 }),
};

const getSvgIcon = (path: string, iStyle = {}, style = {}) => (
  <i style={iStyle}>
    <svg
      viewBox="0 0 1024 1024"
      width="1em"
      height="1em"
      fill="currentColor"
      style={{ verticalAlign: '-.125em', ...style }}
    >
      <path d={path} />
    </svg>
  </i>
);

const arrowPath =
  'M869 487.8L491.2 159.9c-2.9-2.5-6.6-3.9-10.5-3.9h-88' +
  '.5c-7.4 0-10.8 9.2-5.2 14l350.2 304H152c-4.4 0-8 3.6-8 8v60c0 4.4 3.' +
  '6 8 8 8h585.1L386.9 854c-5.6 4.9-2.2 14 5.2 14h91.5c1.9 0 3.8-0.7 5.' +
  '2-2L869 536.2c14.7-12.8 14.7-35.6 0-48.4z';

const switcherIcon = (obj: any) => {
  // console.log(obj.data);
  
  if (obj.data.key?.startsWith('0-0-3')) {
    return false;
  }
  if (obj.isLeaf) {
    return getSvgIcon(
      arrowPath,
      { cursor: 'pointer', backgroundColor: 'white' },
      { transform: 'rotate(270deg)' },
    );
  }
  return getSvgIcon(
    arrowPath,
    { cursor: 'pointer', backgroundColor: 'white' },
    { transform: `rotate(${obj.expanded ? 90 : 0}deg)` },
  );
};
const treeCls = `myCls customIcon`;



const FileTree = (props: React.HTMLProps<HTMLDivElement>) => {
  
  const workbenchDB = useWorkbenchDB();

  const [treeData, setTreeData] = useState<DataNode[]>(defaultTreeData);

  useEffect(() => {
    const { db, initialized, currentPath } = workbenchDB;
    console.log("pathtest DB updated", db, initialized);
    console.log("pathtest Initialized", initialized);
    console.log("pathtest Current path", currentPath);
    
    if(!initialized || !db || !currentPath)
      return;
    
    db.sync
      .then((db) => db.File.findOne({ where: { path: currentPath }}))
      .then(root => {
        console.log("pathtest", "Root dir", root);
        console.log("pathtest", "Path query", {
          where: {
            parent: root.getDataValue('id'),
          }
        });

        db.sync
        .then(db => db.File.findAll({
          where: {path: {[Op.like]: `${currentPath}%`}},
          // attributes: ['id'],
          raw: true,
        }))
        .then((files) =>{
          console.log("Files", files);
          
        });
        // db.findAllJSTree({
        //   where: {
        //     // parent: root.getDataValue('path'),
        //     // parent: root.getDataValue('id'),
        //     parent: '#',
        //   }
        // })
        // .then(res => {
        //   console.log("pathtest File tree debug", res);
          
        //   // setTreeData();
        // })
      // .then((children) => callback.call(this, children));
    })
  }, [workbenchDB])

  return (
    <div className="file-tree-container" {...props}>
      <Tree
        showLine
        defaultExpandAll={false}
        defaultExpandedKeys={[0]}
        motion={motion}
        treeData={treeData}
        switcherIcon={switcherIcon}
      />
    </div>
  )
}

export default FileTree