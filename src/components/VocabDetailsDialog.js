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
import CircularProgress from '@material-ui/core/CircularProgress';
import green from '@material-ui/core/colors/green';

import axios from 'axios';
import moment from 'moment';
import { lovApiBaseUrl, dateFormat, rdfIconUrl, fcpApiUrl } from '../config';
import { copyToClipboard, getMatchedConceptMetadata, calculateTotalFcpScore, getCategoryTypes } from '../utils';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import { withMainContext } from '../context/MainContext';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Chip from '@material-ui/core/Chip';

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
}));


const VocabDetailsDialog = withMainContext(({ context, vocabPrefix, handleClose, selectedConcepts, matchedConcepts }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [vocabData, setVocabData] = useState(null);
  const [fcpData, setFcpData] = useState(null);
  const [vocabDownloadUrl, setVocabDownloadUrl] = useState('');
  const _copyCanvas = useRef();
  const getWeightValues = () => {
    if (context.savedOntologies[vocabPrefix]) {
      return context.savedOntologies[vocabPrefix].weights;
    }
    return [...context.categoryTypeWeightValues];
  };
  useEffect(() => {
    if (!vocabPrefix) return;
    const fetchData = async () => {
      setVocabData(null);
      setFcpData(null);
      setVocabDownloadUrl('');
      setLoading(true);
      try {
        const vocabResp = await axios.get(`${lovApiBaseUrl}/api/v2/vocabulary/info?vocab=${vocabPrefix}`);
        setVocabData(vocabResp.data);
        const ontologyFileURL = [...vocabResp.data.versions].sort((a, b) => new Date(b.issued) - new Date(a.issued))[0].fileURL;
        setVocabDownloadUrl(ontologyFileURL);
        const fcpResp = await axios.get(`${fcpApiUrl}?iris=${ontologyFileURL}`);
        getWeightValues().forEach((v, index) => {
          if (!fcpResp.data[ontologyFileURL][`v${index + 1}`]) {
            fcpResp.data[ontologyFileURL][`v${index + 1}`] = [];
          }
        });
        setFcpData(fcpResp.data);
      } catch (e) {

      }
      setLoading(false);
    };
    fetchData();
  }, [vocabPrefix]);

  const handleCopyToClipboard = (text) => () => {
    copyToClipboard(text, _copyCanvas.current);
    context.setSnackBarContent('Copied to clipboard');
  };

  const renderFocusCategories = () => {
    if (!fcpData || !vocabDownloadUrl) {
      return (
        <Chip color="secondary" label="Failed to calculate FCP, please try again later" className={classes.chip} avatar={<Avatar><ReportProblemIcon /></Avatar>} />
      );
    }
    const categoryTypes = getCategoryTypes({ fcpData, vocabDownloadUrl });
    return Object.keys(categoryTypes).map((categoryType) => (
      <Card key={categoryType}>
        <CardContent>
          <Typography variant="body2"><strong>Category type {categoryType}</strong></Typography>
          {renderCategoryType(categoryTypes[categoryType], categoryType)}
        </CardContent>
      </Card>
    ));
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
        <Card key={focusClass} className={classes.statementCard}>
          <CardContent>
            <Grid container>
              <Grid container item xs={6} className={classes.gridItem}>Focus class | partial score =&nbsp;<strong>{score}</strong>&nbsp;(= {weight} * {data[focusClass].length})</Grid>
              <Grid container item xs={6} className={classes.gridItem}>{`Categories (${data[focusClass].length})`}</Grid>
              <Grid container item xs={6} className={classes.gridItem}>
                <List>
                  <ListItem button className={classes.gridItem} onClick={handleCopyToClipboard(focusClass)} title={`Copy to clipboard: ${focusClass}\n\nPrefixed name: ${prefixedName}\n\nLabel: ${label}\n\nDescription: ${description}`}>
                    <ListItemIcon><ClassIcon /></ListItemIcon>
                    <ListItemText>{focusClass.replace(new RegExp(vocabData.uri, 'g'), '').replace(/[<>]/g, '')}</ListItemText>
                  </ListItem>
                </List>
              </Grid>
              <Grid container item xs={6}>
                <List>
                  {data[focusClass].map((category) => (
                    <ListItem key={category} button className={classes.gridItem} onClick={handleCopyToClipboard(category)} title={`Copy to clipboard: ${category}`}>
                      <ListItemIcon><CategoryIcon /></ListItemIcon>
                      <ListItemText>{(() => {
                        const cat = category.replace(new RegExp(vocabData.uri, 'g'), '');
                        if (cat.includes('.owl:Thing')) {
                          return <><strong>{cat.replace('.owl:Thing', '').replace(/[<>]/g, '')}</strong>.owl:Thing</>
                        }
                        if (cat.includes('>.<')) {
                          return <><strong>{cat.split('>.<')[0].replace(/[<>]/g, '')}</strong>.{cat.split('>.<')[1].replace(/[<>]/g, '')}</>
                        }
                        if (cat.includes('.{')) {
                          return <><strong>{cat.split('.{')[0].replace(/[<>]/g, '')}</strong>{`.{${cat.split('.{')[1].replace(/[<>}]/g, '')}}`}</>
                        }
                        return cat.replace(/[<>]/g, '');
                      })()}
                      </ListItemText>
                    </ListItem>
                  ))}
                </List>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      );
    });
  };
  return (
    <Dialog fullWidth={true} maxWidth="md" open={!!vocabPrefix} onClose={handleClose}>
      <div ref={_copyCanvas}></div>
      {loading ? <DialogContent><CircularProgress /></DialogContent> :
        !vocabData ? <></> : <>
          <DialogTitle>
            <div className={classes.dialogTitle}><strong>{vocabData.prefix}:</strong> {vocabData.titles.filter((t) => t.lang === 'en')[0].value} <Avatar src={rdfIconUrl} /></div>
          </DialogTitle>
          <DialogContent>
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
                      }}>Save calculation to library</Button>
                      :
                      <Button color="secondary" variant="outlined" endIcon={<PlaylistAddCheckIcon />} onClick={() => context.removeSavedOntology(vocabData.prefix)}>Remove calculation from library</Button>}
                  </Typography>
                  <div>
                    <Typography display="inline" variant="body2"><strong>Issued</strong>: {moment(v.issued).format(dateFormat)}</Typography>
                    <Button color="primary" target="_blank" href={v.fileURL} endIcon={<CloudDownloadIcon />}>Download RDF</Button>
                  </div>
                  <Typography display="inline" variant="body2"><strong>Classes</strong>: {v.classNumber}, </Typography>
                  <Typography display="inline" variant="body2"><strong>Properties</strong>: {v.propertyNumber}, </Typography>
                  <Typography display="inline" variant="body2"><strong>Datatypes</strong>: {v.datatypeNumber}, </Typography>
                  <Typography display="inline" variant="body2"><strong>Instances</strong>: {v.instanceNumber}</Typography>
                </CardContent>
              </Card>
            ))}
            <Typography variant="h4"><strong>Total FCP score</strong>: {calculateTotalFcpScore({ vocabDownloadUrl, fcpData, weights: getWeightValues(), selectedConcepts, categoryTypes: getCategoryTypes({ fcpData, vocabDownloadUrl }) })}</Typography>
            <div>
              <Typography variant="body2" display="inline">Weight values: </Typography>
              {getWeightValues().map((v, i) => (
                <Chip key={i} label={v} className={classes.chip} avatar={<Avatar>{`v${i + 1}`}</Avatar>} />
              ))}
              <IconButton onClick={() => context.setIsSettingsDialogOpen(true)}>
                <SettingsIcon />
              </IconButton>
            </div>
            <Typography variant="h6"><strong>FCP data</strong>:</Typography>
            {renderFocusCategories()}
          </DialogContent>
        </>}
      <DialogActions>
        <Button onClick={handleClose} color="secondary">Close</Button>
      </DialogActions>
    </Dialog>
  );
});

export default VocabDetailsDialog;
