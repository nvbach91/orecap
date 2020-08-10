import React, { useState, useEffect, useRef } from 'react';
import { makeStyles } from '@material-ui/core/styles';

import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import Avatar from '@material-ui/core/Avatar';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import CategoryIcon from '@material-ui/icons/Category';
import ClassIcon from '@material-ui/icons/Class';
import CircularProgress from '@material-ui/core/CircularProgress';
import green from '@material-ui/core/colors/green';

import axios from 'axios';
import moment from 'moment';
import { lovApiBaseUrl, dateFormat, rdfIconUrl, fcpApiUrl } from '../config';
import { copyToClipboard } from '../utils';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import { withMainContext } from '../context/MainContext';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';

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
}));


const VocabDetailsDialog = withMainContext(({ context, vocab, handleClose }) => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [vocabData, setVocabData] = useState(null);
  const [fcpData, setFcpData] = useState(null);
  const [vocabDownloadUrl, setVocabDownloadUrl] = useState('');
  const _copyCanvas = useRef();
  const tryFetchVocabDetails = async (iris, index) => {
    if (!iris[index]) return null;
    try {
      const vocabResp = await axios.get(`${lovApiBaseUrl}/api/v2/vocabulary/info?vocab=${iris[index]}`);
      setVocabData(vocabResp.data);
      const ontologyFileURL = [...vocabResp.data.versions].sort((a, b) => new Date(b.issued) - new Date(a.issued))[0].fileURL;
      const fcpResp = await axios.get(`${fcpApiUrl}?iris=${ontologyFileURL}`);      
      setFcpData(fcpResp.data);
      setVocabDownloadUrl(ontologyFileURL);
    } catch (e) {
      return tryFetchVocabDetails(iris, index + 1);
    }
  };
  const fetchVocabDetails = async () => {
    if (!vocab) return;
    setVocabData(null);
    setFcpData(null);
    setVocabDownloadUrl('');
    setLoading(true);
    await tryFetchVocabDetails([vocab._id, vocab._source.uri, vocab._source.prefix], 0);
    setLoading(false);
  };
  useEffect(() => {
    fetchVocabDetails();
  }, [vocab]);

  const handleCopyToClipboard = (text) => () => {
    copyToClipboard(text, _copyCanvas.current);
    context.setSnackBarContent('Copied to clipboard');
  };

  const renderStatement = (s, categoryType) => {
    switch (categoryType) {
      case 'v1':
        return renderCategoryType1Statement(s);
      case 'v2':
        return renderCategoryType2Statement(s);
      case 'v3':
        return renderCategoryType3Statement(s);
      case 'v4':
        return renderCategoryType4Statement(s);
      default:
    }
  };

  const renderCategoryType1Statement = (s) => {
    const parts = s.split(' | ');
    const focusClass = parts[1].replace(/[<>]/g, '');
    /*eslint no-useless-escape: "off"*/
    const categories = parts[2].replace(/[\[\]]/g, '').split(', ').map((c) => c.replace(/[<>]/g, ''));
    return (
      <Grid container>
        <Grid container item xs={6} className={classes.gridItem}>Focus class</Grid>
        <Grid container item xs={6} className={classes.gridItem}>Categories ({categories.length})</Grid>
        <Grid container item xs={6} className={classes.gridItem}>
          <List>
            <ListItem button className={classes.gridItem} onClick={handleCopyToClipboard(focusClass)} title={`Copy to clipboard: ${focusClass}`}>
              <ListItemIcon><ClassIcon /></ListItemIcon>
              <ListItemText>{focusClass.replace(vocabData.uri, '')}</ListItemText>
            </ListItem>
          </List>
        </Grid>
        <Grid container item xs={6}>
          <List>
            {categories.map((c) => (
              <ListItem button key={c} className={classes.gridItem} onClick={handleCopyToClipboard(c)} title={`Copy to clipboard: ${c}`}>
                <ListItemIcon><CategoryIcon /></ListItemIcon>
                <ListItemText>{c.replace(vocabData.uri, '')}</ListItemText>
              </ListItem>
            ))}
          </List>
        </Grid>
      </Grid>
    )
  };

  const renderCategoryType2Statement = (s) => { };

  const renderCategoryType3Statement = (s) => { };

  const renderCategoryType4Statement = (s) => { };

  const calculateFcpScore = () => {
    let score = 0;
    if (!vocabDownloadUrl) return score;
    Object.keys(fcpData[vocabDownloadUrl]).forEach((categoryType, index) => {
      score += context.categoryTypeWeightValues[index] * fcpData[vocabDownloadUrl][categoryType].length;
    });
    return score.toFixed(2);
  };
  return (
    <Dialog fullWidth={true} maxWidth="md" open={!!vocab} onClose={handleClose}>
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
            {[...vocabData.versions].sort((a, b) => new Date(b.issued) - new Date(a.issued)).map((v, index) => (
              <Card key={v.name} className={classes.versionCard}>
                <CardContent>
                  <Typography variant="h6"><span style={{ color: index ? 'inherit' : green[500] }}>{`${v.name}${!index ? ' | Latest' : ''}`}</span></Typography>
                  <Typography variant="body2"><strong>Issued</strong>: {moment(v.issued).format(dateFormat)} | <Link target="_blank" href={v.fileURL}>Download RDF</Link></Typography>
                  <Typography variant="body2"><strong>Classes</strong>: {v.classNumber}</Typography>
                  <Typography variant="body2"><strong>Properties</strong>: {v.propertyNumber}</Typography>
                  <Typography variant="body2"><strong>Datatypes</strong>: {v.datatypeNumber}</Typography>
                  <Typography variant="body2"><strong>Instances</strong>: {v.instanceNumber}</Typography>
                </CardContent>
              </Card>
            ))}
            <Typography variant="body2"><strong>FCP score</strong>: {calculateFcpScore()} (Weight values: {context.categoryTypeWeightValues.map((v, i) => `v${i + 1}: ${v}`).join(', ')})</Typography>
            <Typography variant="body2"><strong>FCP data</strong>:</Typography>
            {vocabDownloadUrl && Object.keys(fcpData[vocabDownloadUrl]).map((categoryType) => (
              <Card key={categoryType}>
                <CardContent>
                  <Typography variant="h6">Category type {categoryType}</Typography>
                  {fcpData[vocabDownloadUrl][categoryType].map((statement, index) => (
                    <Card key={index}>
                      <CardContent>{renderStatement(statement, categoryType)}</CardContent>
                    </Card>
                  ))}
                </CardContent>
              </Card>
            ))}
          </DialogContent>
        </>}
      <DialogActions>
        <Button onClick={handleClose} color="primary">Close</Button>
      </DialogActions>
    </Dialog>
  );
});

export default VocabDetailsDialog;
