import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { withMainContext } from '../context/MainContext';

import TreeView from '@material-ui/lab/TreeView';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import TreeItem from '@material-ui/lab/TreeItem';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
}));

const RecursiveTreeView = withMainContext(({ context, data, checkedNodes, onCheckNode, defaultExpandedId }) => {
  const classes = useStyles();
  const getTypeColor = (type) => {
    switch (type) {
      case 'owl:Thing': return 'primary';
      case '<focus class>': return 'default';
      case '<named subclasses>': return 'primary';
      case '<expressions>': return 'secondary';
      case '<classes>': return 'secondary';
      case '<individuals>': return 'secondary';
      default: return 'primary';
    }
  };
  const renderTree = (nodes) => {
    return (
      <TreeItem 
        key={nodes.id} 
        nodeId={nodes.id} 
        label={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <span style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
              <Checkbox color="primary" checked={!!checkedNodes[nodes.id]} onClick={(e) => { e.stopPropagation(); onCheckNode(nodes.id, data); }}/>
              <span style={{ marginRight: 'auto' }}>{nodes.name}</span> {nodes.type ? <Chip size="small" color={getTypeColor(nodes.type)} label={nodes.type} /> : <></>}
            </span>
            <span></span>
          </div>
        }
        title={nodes.title || ''}>
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
