import RcTree from 'rc-tree';
import { DataNode } from 'rc-tree/lib/interface';
import React, { useEffect, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faCaretDown, faCaretRight } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeTreeNodeStyles } from './iconGenerators';
import { useWorkbenchDB } from '../../contexts/workbenchContext';

import defaultTreeData from './dummyTreeData';

import './FileTree.css';

const motion = {
  motionName: 'node-motion',
  motionAppear: false,
  onAppearStart: () => ({ height: 0 }),
  onAppearActive: (node: HTMLElement) => ({ height: node.scrollHeight }),
  onLeaveStart: (node: HTMLElement) => ({ height: node.offsetHeight }),
  onLeaveActive: () => ({ height: 0 }),
};

const switcherIcon = (obj: unknown) => {
  const node = obj as DataNode & { expanded: boolean };

  if (node.isLeaf) {
    // return <i></i>
    return false;
  }

  if(node.expanded){
    return (
      <FontAwesomeIcon
        icon={faCaretDown}
        // icon={["far", "caret-down"]}
        // fontVariant='regular'
        // type='regular'
        style={{
          ...FontAwesomeTreeNodeStyles,
          transform: 'rotate(315deg)',
        }}
      />
    );
    // return getTreeNodeIconCustomComponent(DownArrow);
    // return getTreeNodeIconFromSvgPath(
    //   arrowPath,
    //   { cursor: 'pointer', backgroundColor: 'white' },
    //   { transform: `rotate(90deg)` },
    // );
  }

  return (
    <FontAwesomeIcon
      icon={faCaretRight}
      // icon={["far", "caret-right"]}
      style={FontAwesomeTreeNodeStyles}
    />
  );
  // return getTreeNodeIconCustomComponent(RightArrow);
  // return getTreeNodeIconFromSvgPath(
  //   arrowPath,
  //   { cursor: 'pointer', backgroundColor: 'white' },
  // )
};

const FileTree = (props: React.HTMLProps<HTMLDivElement>) => {
  const workbenchDB = useWorkbenchDB();
  const { db, initialized, importedFile } = workbenchDB;

  const [treeData, setTreeData] = useState<DataNode[]>(defaultTreeData);
  // const [treeData2, setTreeData2] = useState<IdObj & any>();

  useEffect(() => {
    if(!initialized || !db || !importedFile)
      return;
    
    // console.log("pathtest File tree init started", db, initialized);
    
    db.sync
      .then(() => {
        db.findAllJSTree()
          .then((treeData) => {
            // console.log(`pathtest Tree data for file ${importedFile}: `, treeData);
            // console.log("pathtest File tree init completed", db, initialized);
            setTreeData(treeData as unknown as DataNode[]);
            // setTreeData2(treeData[0]);
          });
    })
  }, [importedFile]);

  function selectPath(path: string){
    if(!workbenchDB.initialized)
      return;
    // console.log("pathtest selected path:", path);
    workbenchDB.updateCurrentPath(path);
  }

  return (
    <div className="file-tree-container" {...props}>
      <RcTree
        showLine
        motion={motion}
        treeData={treeData}
        switcherIcon={switcherIcon}
        onActiveChange={selectPath}
        onSelect={keys => selectPath(keys[0].toString())}
      />
    </div>
  )
}

export default FileTree