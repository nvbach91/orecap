import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import Link from '@material-ui/core/Link';
import CheckIcon from '@material-ui/icons/Check';
import MemoryIcon from '@material-ui/icons/Memory';
import ReportProblemIcon from '@material-ui/icons/ReportProblem';
import { lovApiBaseUrl } from '../config';
import { getMatchedConceptMetadata } from '../utils';
import axios from 'axios';
import LinearProgress from '@material-ui/core/LinearProgress';
import Skeleton from '@material-ui/lab/Skeleton';

const useStyles = makeStyles({
  card: {
    display: 'flex',
  },
  cardContent: {
    width: '100%',
  },
  cardDetails: {
    display: 'flex',
  },
  cardMedia: {
    minWidth: 100,
    minHeight: 100,
    marginLeft: 10,
    backgroundSize: 'contain',
  },
  cardDescription: {
    flexGrow: 1,
    wordBreak: 'break-word',
  },
  subCard: {
    marginBottom: 2,
  },
  uri: {
    wordBreak: 'break-all',
  },
  chip: {
    marginRight: 5,
    marginBottom: 2,
  },
  skeleton: {
    height: 150,
  },
});

export default function VocabSearchResult({ vocabPrefix, onOpenDetails, matchedConcepts, keywordResults, selectedConcepts, handleSetSelectedConcept, focusedKeywords }) {
  const classes = useStyles();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      const resp = await axios.get(`${lovApiBaseUrl}/api/v2/vocabulary/info?vocab=${vocabPrefix}`);
      setData(resp.data);
      setLoading(false);
    };
    fetchData();
  }, [vocabPrefix]);
  return (
    <Grid item xs={12} md={6}>
      <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
          {loading ? <><Skeleton className={classes.skeleton} /><LinearProgress /></> : !data ? <ReportProblemIcon /> : <>
            <Typography variant="h5">
              <strong>{data.prefix}</strong>: {data.titles.filter((t) => t.lang === 'en')[0].value}
            </Typography>
            <Typography variant="subtitle2" color="textSecondary" className={classes.uri}>
              <Link href={data.uri} target="_blank">{data.uri}</Link>
            </Typography>
            {/* <div className={classes.cardDetails}>
            <Typography variant="body2" paragraph className={classes.cardDescription}>
              {data.descriptions.filter((d) => d.lang === 'en')[0].value}
            </Typography>
            <CardMedia className={classes.cardMedia} image={rdfIconUrl} title={rdfIconUrl} />
          </div>
          <div>
            {data.tags.map((tag) => (
              <Chip className={classes.chip} key={tag} avatar={<Avatar>{tag.slice(0, 1)}</Avatar>} label={tag} title={`Tag: ${tag}`} onClick={() => {}} />
            ))}
          </div> */}
            <div><Typography variant="body2">Matched keywords</Typography>
              {Object.keys(keywordResults).map((keyword) => {
                const nMatches = Object.keys(keywordResults[keyword]).length;
                return <Chip
                  className={classes.chip}
                  key={keyword}
                  label={`${keyword} (${nMatches})`}
                  title={`${nMatches} matches for ${focusedKeywords.includes(keyword) ? 'focused ' : ''}keyword '${keyword}'`}
                  color={focusedKeywords.includes(keyword) ? 'secondary' : 'default'} />
              })}
            </div>
            <br />
            {!matchedConcepts ? <></> : <div><Typography variant="body2">(Un)select your focus classes</Typography>
              {Object.keys(matchedConcepts).map((uri) => {
                const { label, description, prefixedName } = getMatchedConceptMetadata(matchedConcepts[uri]);
                return <Chip
                  className={classes.chip}
                  key={uri}
                  avatar={<Avatar>{selectedConcepts && selectedConcepts[uri] ? <CheckIcon /> : ' '}</Avatar>}
                  label={prefixedName}
                  color={selectedConcepts && selectedConcepts[uri] ? 'primary' : 'default'}
                  title={`${uri}\n\nLabel: ${label}\n\nDescription: ${description}`}
                  onClick={handleSetSelectedConcept(uri)} />
              })}
            </div>}
            <br />
            <Button
              startIcon={<MemoryIcon />}
              variant="contained"
              color="primary"
              onClick={onOpenDetails}
              disabled={!selectedConcepts || !Object.keys(selectedConcepts).length}
              style={{ float: 'right' }}>
              Calculate FCP
            </Button>
          </>}
        </CardContent>
      </Card>
    </Grid>
  );
}

VocabSearchResult.propTypes = {
  item: PropTypes.object,
};