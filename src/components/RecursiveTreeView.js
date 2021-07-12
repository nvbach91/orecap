import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { withMainContext } from '../context/MainContext';

import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import Checkbox from '@material-ui/core/Checkbox';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
}));

const RecursiveTreeView = withMainContext(({ context, data, checkedNodes, onCheckNode, defaultExpandedId }) => {
  const classes = useStyles();
  const renderTree = (nodes) => {
    return (
      <TreeItem 
        key={nodes.id} 
        nodeId={nodes.id} 
        label={
          <span>
            <Checkbox color="primary" checked={!!checkedNodes[nodes.id]} onClick={(e) => { e.stopPropagation(); onCheckNode(nodes.id, data); }}/>
            {nodes.name} {nodes.type ? <strong>{`<${nodes.type}>`}</strong> : <></>}
          </span>
        }>
        {Array.isArray(nodes.children) ? nodes.children.map((node) => renderTree(node)) : null}
      </TreeItem>
    );
  };

  return (
    <TreeView
      className={classes.root}
      defaultCollapseIcon={<ExpandMoreIcon />}
      defaultExpanded={[defaultExpandedId]}
      defaultExpandIcon={<ChevronRightIcon />}
    >
      {renderTree(data)}
    </TreeView>
  );
});

export default RecursiveTreeView;
