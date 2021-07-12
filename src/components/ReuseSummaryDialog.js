import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import { withMainContext } from '../context/MainContext';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';
import Link from '@material-ui/core/Link';
import { getCategoryTypes, createShortenedIRILink } from '../utils';
import RecursiveTreeView from './RecursiveTreeView';

const useStyles = makeStyles((theme) => ({
  section: {
    margin: theme.spacing(1),
  },
}));

const getRecursiveCheckedNodeIds = (id, data, checkedNodes, checkedNodeIds) => {
  console.log(id, data);
  // if (!checkedNodes[id]) {
  if (data.id === id || id === 'recursive') {
    checkedNodeIds.push(data.id);
    if (data.children) {
      data.children.forEach((child) => {
        getRecursiveCheckedNodeIds('recursive', child, checkedNodes, checkedNodeIds);
      });
    }
  } else {
    if (data.children) {
      data.children.forEach((child) => {
        getRecursiveCheckedNodeIds(id, child, checkedNodes, checkedNodeIds);
      });
    }
  }

  // }
};

const ReuseSummaryDialog = withMainContext(({ context, setSelectedVocabPrefix }) => {
  const classes = useStyles();
  const [checkedNodes, setCheckedNodes] = useState({});
  const onCheckNode = (id, data) => {
    const newCheckedNodes = { ...checkedNodes };
    const checkedNodeIds = [];
    getRecursiveCheckedNodeIds(id, data, checkedNodes, checkedNodeIds);
    console.log(checkedNodeIds);
    checkedNodeIds.forEach((cnid) => {
      if (checkedNodes[cnid]) {
        delete newCheckedNodes[cnid];
      } else {
        newCheckedNodes[cnid] = true;
      }
    });
    setCheckedNodes(newCheckedNodes);
  };
  const renderReuseTree = ({ fcpData, vocabDownloadUrl, vocabData }) => {
    const categoryTypes = getCategoryTypes({ fcpData, vocabDownloadUrl, vocabData });
    // console.log(categoryTypes);
    const focusClasses = {};
    ['t1', 't2', 't3', 't4'].forEach((t) => {
      if (!categoryTypes[t]) {
        return false;
      }
      Object.keys(categoryTypes[t]).forEach((focusClassIri) => {
        if (!focusClasses[focusClassIri]) {
          focusClasses[focusClassIri] = categoryTypes[t][focusClassIri].map((iri) => ({ iri, categoryType: t }));
        } else {
          categoryTypes[t][focusClassIri].map((iri) => ({ iri, categoryType: t })).forEach((expression) => {
            focusClasses[focusClassIri].push(expression);
          });
        }
      })
    });
    // console.log(focusClasses);
    return Object.keys(focusClasses).map((focusClassIri) => {
      const data = {
        id: focusClassIri,
        name: createShortenedIRILink(focusClassIri, vocabData.nsp, vocabData.prefix),
        children: [],
        // children: [
        //   {
        //     id: '1',
        //     name: 'Child - 1',
        //   },
        //   {
        //     id: '3',
        //     name: 'Child - 3',
        //     children: [
        //       {
        //         id: '4',
        //         name: 'Child - 4',
        //       },
        //     ],
        //   },
        // ],
      };
      const t1Children = {};
      const t234Children = {};
      focusClasses[focusClassIri].forEach((expression) => {
        let parts;
        let property;
        let item;
        switch (expression.categoryType) {
          case 't1':
            t1Children[expression.iri] = expression.iri;
            break;
          case 't2':
            property = expression.iri.replace('.owl:Thing', '');
            item = { id: `${property} .owl:Thing`, type: 'owl:Thing', name: createShortenedIRILink(property, vocabData.nsp, vocabData.prefix), };
            if (!t234Children[property]) {
              t234Children[property] = [item];
            } else {
              t234Children[property].push(item);
            }
            break;
          case 't3':
            parts = expression.iri.split('>.<');
            property = `${parts[0]}>`;
            item = {
              id: `${property} <class>`,
              type: 'class',
              name: createShortenedIRILink(property, vocabData.nsp, vocabData.prefix),
              children: [{
                id: expression.iri,
                name: createShortenedIRILink(expression.iri.replace(property + '.', ''), vocabData.nsp, vocabData.prefix),
              }],
            };
            if (!t234Children[property]) {
              t234Children[property] = [item];
            } else {
              t234Children[property].push(item);
            }
            break;
          case 't4':
            parts = expression.iri.split('>.{');
            property = `${parts[0]}>`;
            item = {
              id: `${property} <individuals>`,
              type: 'individuals',
              name: createShortenedIRILink(property, vocabData.nsp, vocabData.prefix),
              children: [{
                id: expression.iri,
                name: createShortenedIRILink(expression.iri.replace(property + '.{', '').replace(/}$/, ''), vocabData.nsp, vocabData.prefix),
              }],
            };
            if (!t234Children[property]) {
              t234Children[property] = [item];
            } else {
              t234Children[property].push(item);
            }
            break;
          default:
        }
      });
      data.children.push({
        id: `${data.id} <named sublasses>`,
        type: 'named subclasses',
        name: `subclasses (${Object.keys(t1Children).length})`,
        children: Object.keys(t1Children).map((iri) => ({ id: iri, name: createShortenedIRILink(iri, vocabData.nsp, vocabData.prefix), })),
      });
      // console.log('----------');
      // console.log(t234Children);
      // console.log('----------');
      Object.keys(t234Children).forEach((property) => {
        const item = { id: `${property} <expression>`, type: 'expression', name: createShortenedIRILink(property, vocabData.nsp, vocabData.prefix), children: [] };
        const groupedChildren = {};
        t234Children[property].forEach((child) => {
          if (!groupedChildren[child.id]) {
            groupedChildren[child.id] = { name: child.name, type: child.type, children: child.children };
          } else {
            groupedChildren[child.id].children = groupedChildren[child.id].children.concat(child.children);
          }
        });
        item.children = Object.keys(groupedChildren).map((key) => ({
          id: key,
          name: groupedChildren[key].name,
          type: groupedChildren[key].type,
          children: groupedChildren[key].children
        }));
        data.children.push(item);
      });
      // console.log(data);
      return <RecursiveTreeView key={focusClassIri} data={data} onCheckNode={onCheckNode} checkedNodes={checkedNodes} defaultExpandedId={data.id} />
    });
  };
  return (
    <Dialog fullWidth={true} maxWidth="md" open={context.isReuseSummaryDialogOpen} onClose={() => context.setIsReuseSummaryDialogOpen(false)}>
      <DialogTitle>Reuse summary</DialogTitle>
      <DialogContent>
        {Object.keys(context.savedOntologies).sort((prefix1, prefix2) => {
          const o1 = parseFloat(context.savedOntologies[prefix1].fcpScore);
          const o2 = parseFloat(context.savedOntologies[prefix2].fcpScore);
          return o1 > o2 ? -1 : o1 < o2 ? 1 : 0;
        }).map((prefix) => {
          const { vocabDownloadUrl, fcpData, vocabData } = context.savedOntologies[prefix];
          return (
            <Card key={prefix} className={classes.section}>
              <CardContent>
                <Typography variant="h5">{vocabData.titles.filter((t) => t.lang === 'en')[0].value}</Typography>
                <Typography variant="body2"><Link target="_blank" href={vocabData.uri}>{vocabData.uri}</Link></Typography>
                {renderReuseTree({ fcpData, vocabDownloadUrl, vocabData })}
              </CardContent>
            </Card>
          );
        })}
      </DialogContent>
      <DialogActions>
        <Button onClick={() => context.setIsReuseSummaryDialogOpen(false)} color="secondary">Close</Button>
      </DialogActions>
    </Dialog>
  );
});

export default ReuseSummaryDialog;
