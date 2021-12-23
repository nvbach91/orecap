import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import CategoryIcon from '@material-ui/icons/Category';
import ClassIcon from '@material-ui/icons/Class';
import CloudDownloadIcon from '@material-ui/icons/CloudDownload';
import PlaylistAddCheckIcon from '@material-ui/icons/PlaylistAddCheck';
import PlaylistAddIcon from '@material-ui/icons/PlaylistAdd';
import SettingsIcon from '@material-ui/icons/Settings';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import LinearProgress from '@material-ui/core/LinearProgress';
import green from '@material-ui/core/colors/green';

import axios from 'axios';
import moment from 'moment';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Chip from '@material-ui/core/Chip';
import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import Paper from '@material-ui/core/Paper';
import Skeleton from '@material-ui/lab/Skeleton';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { lovApiBaseUrl, dateFormat, rdfIconUrl, fcpApiUrl } from '../config';
import { copyToClipboard, getMatchedConceptMetadata, calculateTotalFcpScore, getCategoryTypes } from '../utils';
import { withMainContext } from '../context/MainContext';

const useStyles = makeStyles((theme) => ({
  versionCard: {
    marginBottom: 5,
  },
  dialogTitle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gridItem: {
    wordBreak: 'break-all',
  },
  chip: {
    marginRight: 5,
  },
  statementCard: {
    marginBottom: 2,
  },
  skeleton: {
    height: 200,
  },
}));


const VocabDetailsDialog = withMainContext(({ context, vocabPrefix, handleClose, selectedConcepts, matchedConcepts }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [fcpLoading, setFcpLoading] = useState(false);
  const [vocabData, setVocabData] = useState(null);
  const [fcpData, setFcpData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [vocabDownloadUrl, setVocabDownloadUrl] = useState('');
  const [activeCategorizationTabIndex, setActiveCategorizationTabIndex] = useState(0);
  const _copyCanvas = useRef();
  const getWeightValues = () => {
    if (context.savedOntologies[vocabPrefix]) {
      return context.savedOntologies[vocabPrefix].weights;
    }
    return [...context.categoryTypeWeightValues];
  };
  useEffect(() => {
    if (!vocabPrefix) {
      return;
    }
    const fetchData = async () => {
      setActiveCategorizationTabIndex(0);
      setErrorMessage('');
      setVocabData(null);
      setFcpData(null);
      setVocabDownloadUrl('');
      setLoading(true);
      setFcpLoading(true);
      try {
        const vocabResp = await axios.get(`${lovApiBaseUrl}/api/v2/vocabulary/info?vocab=${vocabPrefix}`);
        setVocabData(vocabResp.data);
        const ontologyFileURL = [...vocabResp.data.versions].sort((a, b) => new Date(b.issued) - new Date(a.issued))[0].fileURL;
        setVocabDownloadUrl(ontologyFileURL);
        setLoading(false);
        const fcpResp = await axios.get(`${fcpApiUrl}?iri=${encodeURIComponent(ontologyFileURL)}&selectedClasses=${Object.keys(selectedConcepts).map((sc) => encodeURIComponent(sc)).join(',')}`);
        getWeightValues().forEach((v, index) => {
          if (!fcpResp.data[ontologyFileURL][`t${index + 1}`]) {
            fcpResp.data[ontologyFileURL][`t${index + 1}`] = [];
          }
        });
        setFcpData(fcpResp.data);
        setFcpLoading(false);
        context.addSavedOntology({
          vocabData: vocabResp.data,
          vocabDownloadUrl: ontologyFileURL,
          fcpData: fcpResp.data,
          weights: getWeightValues(),
          fcpScore: calculateTotalFcpScore({
            vocabDownloadUrl: ontologyFileURL,
            fcpData: fcpResp.data,
            weights: getWeightValues(),
            selectedConcepts,
            categoryTypes: getCategoryTypes({ fcpData: fcpResp.data, vocabDownloadUrl: ontologyFileURL }),
          })
        });
      } catch (e) {
        console.error(e);
        if (e.response && e.response.data) {
          setErrorMessage(e.response.data.msg);
        } else if (e.toJSON) {
          setErrorMessage(e.toJSON().message);
        }
      }
    };
    fetchData();
  }, [vocabPrefix, selectedConcepts]);

  const handleCopyToClipboard = (text) => () => {
    copyToClipboard(text.replace(/[<>]/g, ''), _copyCanvas.current);
    context.setSnackBarContent({ msg: 'Copied to clipboard', color: 'success' });
  };

  const handleSwitchCategorizationTab = (e, value) => {
    setActiveCategorizationTabIndex(value);
  };

  const renderFocusCategories = () => {
    const categoryTypes = getCategoryTypes({ fcpData, vocabDownloadUrl });
    if (!Object.keys(categoryTypes).length) {
      return <></>;
    }
    return (
      <>
        <Paper square>
          <Tabs indicatorColor="primary" textColor="primary" value={activeCategorizationTabIndex} onChange={handleSwitchCategorizationTab} aria-label="simple tabs example">
            {Object.keys(categoryTypes).sort().map((categoryType) => (
              <Tab style={{ textTransform: 'none' }} wrapped key={categoryType} label={`Category pattern ${categoryType.replace('t', 'c')} (${Object.keys(categoryTypes[categoryType]).length})`} title={`Found ${Object.keys(categoryTypes[categoryType]).length} focus classes`} />
            ))}
          </Tabs>
        </Paper>
        {Object.keys(categoryTypes).sort().map((categoryType, index) => {
          if (activeCategorizationTabIndex !== index) {
            return null;
          }
          return renderCategoryType(categoryTypes[categoryType], categoryType);
        })}
      </>
    );
  }
  const renderCategoryType = (data, categoryType) => {
    const weight = getWeightValues()[categoryType.slice(1) - 1];
    return Object.keys(data).map((focusClass) => {
      if (selectedConcepts && !selectedConcepts[focusClass.replace(/[<>]/g, '')]) {
        return null;
      }
      if (!matchedConcepts) {
        return null;
      }
      const { label, description, prefixedName } = getMatchedConceptMetadata(matchedConcepts[focusClass.replace(/[<>]/g, '')]);
      const score = (weight * data[focusClass].length).toFixed(2);
      return (
        <Accordion key={focusClass} defaultExpanded={false}>
          <AccordionSummary className={classes.statementCard} expandIcon={<ExpandMoreIcon />}>
            <Grid container>
              <Grid container item xs={5}>
                <Grid item xs={12}>Focus class ({focusClass.includes(vocabData.nsp) ? `${vocabData.prefix}:` : ''}<strong>{focusClass.replace(new RegExp(vocabData.nsp, 'g'), '').replace(/[<>]/g, '')}</strong>)</Grid>
                <Grid item xs={12}>partial score =&nbsp;<strong>{score}</strong>&nbsp;(= {data[focusClass].length} * {weight})</Grid>
              </Grid>
              <Grid item xs={7} className={classes.gridItem}>{`Categories (${data[focusClass].length})`}</Grid>
            </Grid>
          </AccordionSummary>
          <AccordionDetails>
            <Grid container>
              <Grid container item xs={5} className={classes.gridItem}>
                <List>
                  <ListItem button className={classes.gridItem} onClick={handleCopyToClipboard(focusClass)} title={`Copy to clipboard: ${focusClass}\n\nPrefixed name: ${prefixedName}\n\nLabel: ${label}\n\nDescription: ${description}`}>
                    <ListItemIcon><ClassIcon color="primary" /></ListItemIcon>
                    <ListItemText>{focusClass.includes(vocabData.nsp) ? `${vocabData.prefix}:` : ''}<strong>{focusClass.replace(new RegExp(vocabData.nsp, 'g'), '').replace(/[<>]/g, '')}</strong></ListItemText>
                  </ListItem>
                </List>
              </Grid>
              <Grid container item xs={7}>
                <List>
                  {data[focusClass].map((category) => (
                    <ListItem key={category} button className={classes.gridItem} onClick={handleCopyToClipboard(category)} title={`Copy to clipboard: ${category}`}>
                      <ListItemIcon><CategoryIcon /></ListItemIcon>
                      <ListItemText>{(() => {
                        const cat = category.replace(new RegExp(vocabData.nsp, 'g'), category.includes(vocabData.nsp) ? `${vocabData.prefix}:` : '');
                        if (cat.includes('.owl:Thing')) {
                          const parts = cat.replace('.owl:Thing', '').replace(/[<>]/g, '').split(':');
                          return <>{parts[0]}:<strong>{parts[1]}</strong> &bull; owl:<strong>Thing</strong></>
                        }
                        if (cat.includes('>.<')) {
                          const parts = cat.split('>.<').map((p) => p.replace(/[<>]/g, ''));
                          const pa = parts[0].split(':');
                          const pb = parts[1].split(':');
                          return <>{pa[0]}:<strong>{pa[1]}</strong><br />&bull; {parts[1].startsWith('http') ? parts[1] : <>{pb[0]}:<strong>{pb[1]}</strong></>}</>
                        }
                        if (cat.includes('.{')) {
                          const parts = cat.split('.{').map((p) => p.replace(/[<>]/g, ''));;
                          const pa = parts[0].split(':');
                          const pb = parts[1].split(':');
                          return <>{pa[0]}:<strong>{pa[1]}</strong><br />&bull; {parts[1].startsWith('http') ? `{${parts[1]}` : <>{`{${pb[0]}`}:<strong>{pb[1]}</strong></>}</>
                        }
                        return <>{cat.replace(/[<>]/g, '').startsWith('http') ? cat.replace(/[<>]/g, '') : <>{cat.replace(/[<>]/g, '').split(':')[0]}:<strong>{cat.replace(/[<>]/g, '').split(':')[1]}</strong></>}</>;
                      })()}
                      </ListItemText>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </AccordionDetails>
        </Accordion>
      );
    });
  };
  return (
    <Dialog fullWidth={true} maxWidth="lg" open={!!vocabPrefix} onClose={handleClose}>
      <div ref={_copyCanvas}></div>
      <DialogTitle>
        {loading || !vocabData ? <LoadingSkeleton content="Loading vocabulary data, please wait..." /> : <div className={classes.dialogTitle}><strong>{vocabData.prefix}:</strong> {vocabData.titles.filter((t) => t.lang === 'en')[0].value} <Avatar src={rdfIconUrl} /></div>}
      </DialogTitle>
      <DialogContent>
        {loading || !vocabData ? <LoadingSkeleton content="Loading vocabulary data, please wait..." /> :
          <>
            <Typography variant="body2"><strong>Prefix</strong>: {vocabData.prefix}</Typography>
            <Typography variant="body2"><strong>URI</strong>: <Link href={vocabData.uri} target="_blank">{vocabData.uri}</Link></Typography>
            <Typography variant="body2"><strong>Namespace</strong>: <Link href={vocabData.nsp} target="_blank">{vocabData.nsp}</Link></Typography>
            <Typography variant="body2"><strong>Description</strong>: {vocabData.descriptions.filter((d) => d.lang === 'en')[0].value}</Typography>
            <Typography variant="body2"><strong>Authors</strong>: {vocabData.creatorIds && vocabData.creatorIds.length ? vocabData.creatorIds.map((c) => c.name).join(', ') : 'N/A'}</Typography>
            <Typography variant="body2"><strong>Versions</strong>:</Typography>
            {[...vocabData.versions].sort((a, b) => new Date(b.issued) - new Date(a.issued)).slice(0, 1).map((v, index) => (
              <Card key={v.name} className={classes.versionCard}>
                <CardContent>
                  <Typography style={{ display: 'flex', justifyContent: 'space-between' }} variant="h6">
                    <span style={{ color: index ? 'inherit' : green[500] }}>{`${v.name}${!index ? ' | Latest' : ''}`}</span>
                    {!context.savedOntologies[vocabData.prefix] ?
                      <Button color="primary" variant="contained" endIcon={<PlaylistAddIcon />} disabled={!fcpData} onClick={() => {
                        context.addSavedOntology({
                          vocabData,
                          vocabDownloadUrl,
                          fcpData,
                          weights: getWeightValues(),
                          fcpScore: calculateTotalFcpScore({
                            vocabDownloadUrl,
                            fcpData,
                            weights: getWeightValues(),
                            selectedConcepts,
                            categoryTypes: getCategoryTypes({ fcpData, vocabDownloadUrl })
                          })
                        });
                      }}>Save calculation to list</Button>
                      :
                      <Button 
                        color="secondary" 
                        variant="outlined" 
                        endIcon={<PlaylistAddCheckIcon />} 
                        onClick={() => context.removeSavedOntology(vocabData.prefix)}
                      >
                        Remove calculation from list
                      </Button>
                    }
                  </Typography>
                  <div>
                    <Typography display="inline" variant="body2"><strong>Issued</strong>: {moment(v.issued).format(dateFormat)}</Typography>
                    <Button color="primary" target="_blank" href={v.fileURL} title={v.fileURL} endIcon={<CloudDownloadIcon />}>Download RDF</Button>
                  </div>
                  <Typography display="inline" variant="body2"><strong>Classes</strong>: {v.classNumber}, </Typography>
                  <Typography display="inline" variant="body2"><strong>Properties</strong>: {v.propertyNumber}, </Typography>
                  <Typography display="inline" variant="body2"><strong>Datatypes</strong>: {v.datatypeNumber}, </Typography>
                  <Typography display="inline" variant="body2"><strong>Instances</strong>: {v.instanceNumber}</Typography>
                </CardContent>
              </Card>
            ))}
          </>
        }
        {(fcpLoading || !fcpData) && !errorMessage ? <LoadingSkeleton content="Loading FCP categorization data, please wait..." /> :
          <>
            <Typography variant="h4"><strong>Total FCP score</strong>: {calculateTotalFcpScore({ vocabDownloadUrl, fcpData, weights: getWeightValues(), selectedConcepts, categoryTypes: getCategoryTypes({ fcpData, vocabDownloadUrl }) })}</Typography>
            <div>
              <Typography variant="body2" display="inline">Weight values: </Typography>
              {getWeightValues().map((v, i) => (
                <Chip key={i} label={v} className={classes.chip} avatar={<Avatar>{`c${i + 1}`}</Avatar>} />
              ))}
              <IconButton onClick={() => context.setIsSettingsDialogOpen(true)}>
                <SettingsIcon />
              </IconButton>
            </div>
            <Typography variant="h6"><strong>FCP categorizations</strong>:</Typography>
            {renderFocusCategories()}
          </>}
        {!errorMessage ? <></> : (
          <>
            <Chip color="secondary" label="Failed to calculate FCP, please try again later" className={classes.chip} avatar={<Avatar><ReportProblemIcon /></Avatar>} />
            <br />
            <Typography color="secondary" variant="body2">Error message: {errorMessage}</Typography>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} color="secondary">Close</Button>
      </DialogActions>
    </Dialog>
  );
});

const LoadingSkeleton = ({ content }) => {
  const classes = useStyles();
  return <><Typography variant="body2">{content}</Typography><Skeleton className={classes.skeleton} /><LinearProgress /></>
};

export default VocabDetailsDialog;
