import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Typography from '@material-ui/core/Typography';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import Link from '@material-ui/core/Link';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import Minimize from '@material-ui/icons/Minimize';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import { withMainContext } from '../context/MainContext';
import { getCategoryTypes, createShortenedIRILink, downloadTextFile, extractEntityName } from '../utils';
import RecursiveTreeView from './RecursiveTreeView';
import { OWL_EQUIVALENTCLASS, OWL_ONPROPERTY, OWL_RESTRICTION, OWL_SOMEVALUESFROM, OWL_HASVALUE, OWL_THING } from '../config';
import { RDFS_SUBCLASSOF, RDF_TYPE } from '../config';

const shortUUID = () => uuidv4().slice(-12);

const useStyles = makeStyles((theme) => ({
  section: {
    margin: theme.spacing(1),
  },
}));

const getRecursiveCheckedNodeIds = (id, data, checkedNodes, checkedNodeIds) => {
  // console.log(id, data);
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

const ReuseSummaryDialog = withMainContext(({ context }) => {
  const classes = useStyles();
  const [checkedNodes, setCheckedNodes] = useState({});
  const onCheckNode = (id, data) => {
    const newCheckedNodes = { ...checkedNodes };
    const checkedNodeIds = [];
    getRecursiveCheckedNodeIds(id, data, checkedNodes, checkedNodeIds);
    // console.log(checkedNodeIds);
    checkedNodeIds.forEach((cnid) => {
      if (checkedNodes[id]) {
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
        const fci = focusClassIri.replace(/^</, '').replace(/>$/, '');
        if (!focusClasses[fci]) {
          focusClasses[fci] = categoryTypes[t][focusClassIri].map((iri) => ({ iri, categoryType: t }));
        } else {
          categoryTypes[t][focusClassIri].map((iri) => ({ iri, categoryType: t })).forEach((expression) => {
            focusClasses[fci].push(expression);
          });
        }
      })
    });
    // console.log(focusClasses);
    return Object.keys(focusClasses).map((focusClassIri) => {
      const data = {
        id: `${focusClassIri} <focus class>`,
        name: createShortenedIRILink(focusClassIri, vocabData.nsp, vocabData.prefix),
        children: [],
        type: '<focus class>',
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
        let subject;
        switch (expression.categoryType) {
          case 't1':
            t1Children[expression.iri.replace(/^</, '').replace(/>$/, '')] = expression.iri.replace(/^</, '').replace(/>$/, '');
            break;
          case 't2':
            property = expression.iri.replace('.owl:Thing', '').replace(/^</, '').replace(/>$/, '');
            item = {
              id: `${property} .owl:Thing`,
              type: 'owl:Thing',
              name: createShortenedIRILink(property, vocabData.nsp, vocabData.prefix),
            };
            if (!t234Children[property]) {
              t234Children[property] = [item];
            } else {
              t234Children[property].push(item);
            }
            break;
          case 't3':
            parts = expression.iri.split('>.<');
            property = parts[0].replace(/^</, '');
            subject = parts[1].replace(/>$/, '');
            item = {
              id: `${property} <classes>`,
              type: '<classes>',
              name: createShortenedIRILink(property, vocabData.nsp, vocabData.prefix),
              children: [{
                id: expression.iri,
                name: [
                  createShortenedIRILink(property, vocabData.nsp, vocabData.prefix, 'secondary'),
                  <Minimize key="arrow" />,
                  createShortenedIRILink(subject, vocabData.nsp, vocabData.prefix)
                ],
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
            property = parts[0].replace(/^</, '');
            subject = parts[1].replace(/}$/, '').replace(/^</, '').replace(/>$/, '');
            item = {
              id: `${property} <individuals>`,
              type: '<individuals>',
              name: createShortenedIRILink(property, vocabData.nsp, vocabData.prefix),
              children: [{
                id: expression.iri,
                name: [
                  createShortenedIRILink(property, vocabData.nsp, vocabData.prefix, 'secondary'),
                  <Minimize key="arrow" />,
                  createShortenedIRILink(subject, vocabData.nsp, vocabData.prefix)
                ],
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
      const checkedSubclassCount = Object.keys(t1Children).filter((cid) => !!checkedNodes[cid]).length;
      data.children.push({
        id: `${data.id} <named subclasses>`,
        type: '<named subclasses>',
        name: `subclasses (${checkedSubclassCount}/${Object.keys(t1Children).length})`,
        children: Object.keys(t1Children).map((iri) => ({
          id: iri,
          name: createShortenedIRILink(iri, vocabData.nsp, vocabData.prefix),
        })),
      });
      // console.log(vocabData);
      // console.log('----------');
      // console.log(t234Children);
      // console.log('----------');
      Object.keys(t234Children).forEach((property) => {
        const item = {
          id: `${property} <expressions>`,
          type: '<expressions>',
          name: createShortenedIRILink(property, vocabData.nsp, vocabData.prefix),
          children: [],
        };
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
        let expressionCount = 0;
        let checkedChildrenCount = 0;
        // console.log(checkedNodes);
        item.children.forEach((c) => {
          expressionCount += !c.children ? 1 : c.children.length;
          if (!c.children) {
            checkedChildrenCount += checkedNodes[c.id] ? 1 : 0;
          } else {
            c.children.forEach((cc) => {
              checkedChildrenCount += checkedNodes[cc.id] ? 1 : 0;
            });
          }
        });
        item.name = [
          item.name,
          <span key="count">&nbsp;({checkedChildrenCount}/{expressionCount})</span>
        ];
        data.children.push(item);
      });
      // console.log(data);
      return (
        <Paper elevation={1} key={focusClassIri} style={{ marginBottom: 10, padding: 10 }}>
          <Button
            endIcon={<CloudDownloadIcon />}
            onClick={exportSelectedExpressions(focusClassIri)}
            color="primary"
            variant="contained"
          >
            Export selected expressions (N-triples)
          </Button>
          <RecursiveTreeView data={data} onCheckNode={onCheckNode} checkedNodes={checkedNodes} defaultExpandedId={data.id} />
        </Paper>
      )
    })
  };
  const exportSelectedExpressions = (subject) => () => {
    // console.log(context);
    let triples = Object.keys(checkedNodes)
      .filter((e) => !/(<expressions>|<classes>|<individuals>|<named subclasses>|<focus class>)$/.test(e));
    if (!triples.length) {
      return context.setSnackBarContent({ msg: 'Please select at least one expression for export', color: 'error' });
    }
    
    const subjectName = extractEntityName(subject);
    triples = triples.map((e) => {
      // console.log(e);
      let categoryPattern = 'c1';
      if (e.includes('.owl:Thing')) {
        categoryPattern = 'c2';
      } else if (e.includes('.<')) {
        categoryPattern = 'c3';
      } else if (e.includes('.{<') && e.includes('>}')) {
        categoryPattern = 'c4';
      }
      let result = e
        .replace('.<', ' <')
        .replace('.{<', ' <').replace('>}', '>')
        .replace('.owl:Thing', `<${OWL_THING}>`);
      const contextName = `${context.generatedClassNamespace}${subjectName}Having`;
      if (result.endsWith(`<${OWL_THING}>`)) { // category pattern c2
        const property = result.replace(`<${OWL_THING}>`, '').trim();
        const propertyName = extractEntityName(property);
        const anonymousEntity = `_:${shortUUID()}`;
        result = '\n' + [
          `<${contextName}${propertyName}> <${OWL_EQUIVALENTCLASS}> ${anonymousEntity}`,
          `${anonymousEntity} <${RDF_TYPE}> <${OWL_RESTRICTION}>`,
          `${anonymousEntity} <${OWL_ONPROPERTY}> <${property}>`,
          `${anonymousEntity} <${OWL_SOMEVALUESFROM}> <${OWL_THING}>`,
        ].join(' .\n');
      } else if (!/^<.+>$/.test(result) && !/> </.test(result)) { // category pattern c1
        result = `<${result}> <${RDFS_SUBCLASSOF}> <${subject}>`;
      } else { // category pattern c3+c4
        const [predicate, object] = result.split('> <').map((p, i) => `${i === 1 ? '<' : ''}${p}${i === 0 ? '>' : ''}`);
        const predicateName = extractEntityName(predicate.slice(1, -1));
        const objectName = extractEntityName(object.slice(1, -1));
        const anonymousEntity = `_:${shortUUID()}`;
        result = '\n' + [
          `<${contextName}${predicateName}${objectName}> <${OWL_EQUIVALENTCLASS}> ${anonymousEntity}`,
          `${anonymousEntity} <${RDF_TYPE}> <${OWL_RESTRICTION}>`,
          `${anonymousEntity} <${OWL_ONPROPERTY}> ${predicate}`,
          `${anonymousEntity} <${categoryPattern === 'c3' ? OWL_SOMEVALUESFROM : OWL_HASVALUE}> ${object}`,
        ].join(' .\n');
      }
      return result;
    });
    
    // console.log(triples.join(' .\n') + ' .');
    const fileName = `fcp-${subjectName}-${moment().format('YYYYMMDD-HHmmss')}.n3`;
    downloadTextFile(fileName, `${triples.join(' .\n')} .`);
  };
  return (
    <Dialog fullWidth={true} maxWidth="md" open={context.isReuseSummaryDialogOpen} onClose={() => context.setIsReuseSummaryDialogOpen(false)}>
      <DialogTitle>Re-use summary</DialogTitle>
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
