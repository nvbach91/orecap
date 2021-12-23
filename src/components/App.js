import React, { useState, useRef, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import Button from '@material-ui/core/Button';
import SearchIcon from '@material-ui/icons/Search';
import Header from './Header';
import VocabDetailsDialog from './VocabDetailsDialog';
import Footer from './Footer';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';
import { lovApiBaseUrl } from '../config';
import SettingsDialog from './SettingsDialog';
import VocabSearchResult from './VocabSearchResult';
import SavedOntologiesDialog from './SavedOntologiesDialog';
import ConfirmDialog from './ConfirmDialog';
import { withMainContext } from '../context/MainContext';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';
import { getCamelCaseTokens, getMatchedConceptMetadata } from '../utils';
import ReuseSummaryDialog from './ReuseSummaryDialog';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';


const suggestedKeywords = [
  'vehicle car automobile truck',
  'animal fish insect'
];

const Alert = (props) => <MuiAlert elevation={6} variant="filled" {...props} />;

const useStyles = makeStyles((theme) => ({
  mainGrid: {
    marginTop: theme.spacing(3),
  },
}));

const App = withMainContext(({ context }) => {
  const [vocabPrefixes, setVocabPrefixes] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');//useState('transfer route organization stop servicestop');
  const [focusedSearchQuery, setFocusedSearchQuery] = useState('');//useState('transfer');
  const [selectedVocabPrefix, setSelectedVocabPrefix] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchedConcepts, setMatchedConcepts] = useState({});
  const [keywordResults, setKeywordResults] = useState({});
  const [selectedConcepts, setSelectedConcepts] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [triggerFormSubmit, setTriggerFormSubmit] = useState(false);
  const _submitButton = useRef();
  const classes = useStyles();
  const handleFetchSearchResults = (e) => {
    e && e.preventDefault();
    if (!focusedSearchQuery.trim()) {
      return;
    }
    if (!Object.keys(context.savedOntologies).length) {
      return fetchSearchResults();
    }
    setConfirmOpen(true);
  }
  const fetchSearchResults = async () => {
    context.resetSavedOntologies();
    setLoading(true);
    setVocabPrefixes([]);
    setMatchedConcepts({});
    setKeywordResults({});
    setSelectedConcepts({});
    const vocabsPrefixSet = {};
    const keywords = [...new Set(`${searchQuery.trim()} ${focusedSearchQuery.trim()}`.split(/[\s,]+/))];
    const mc = {};
    const kr = {};
    for (let i = 0; i < keywords.length; i++) {
      const keyword = keywords[i];
      if (!keyword) {
        continue;
      }
      const keywordResp = await axios.get(`${lovApiBaseUrl}/api/v2/term/search?type=class&q=${keyword}`);
      keywordResp.data.results.filter((result) => {
        const hasPrefixedName = result.prefixedName && result.prefixedName.length && result.prefixedName[0].includes(':');
        const keywordMatchesPrefixedNameCamelCaseTokens =
          hasPrefixedName &&
          getCamelCaseTokens(result.prefixedName[0].split(':')[1]).filter((token) => {
            return keyword.toUpperCase() === keyword ? token.startsWith(keyword) : token.toLowerCase() === keyword.toLowerCase();
          }).length
        const resultMetadata = getMatchedConceptMetadata(result);
        const keywordMatchesLabelCamelCaseTokens =
          resultMetadata.label &&
          getCamelCaseTokens(resultMetadata.label).filter((token) => {
            return keyword.toUpperCase() === keyword ? token.startsWith(keyword) : token.toLowerCase() === keyword.toLowerCase();
          }).length;
        return result.type === 'class' && (keywordMatchesPrefixedNameCamelCaseTokens || keywordMatchesLabelCamelCaseTokens);
      }).forEach((result) => {
        const prefixedName = result.prefixedName.join('');
        const highlight = result.highlight;
        const uri = result.uri.join('');
        result['vocabulary.prefix'].forEach((prefix) => {
          vocabsPrefixSet[prefix] = true;
          if (!mc[prefix]) {
            mc[prefix] = { [uri]: { prefixedName, highlight } };
          } else {
            mc[prefix][uri] = { prefixedName, highlight };
          }
          if (!kr[prefix]) {
            kr[prefix] = { [keyword]: { [uri]: true } };
          } else {
            if (!kr[prefix][keyword]) {
              kr[prefix][keyword] = { [uri]: true };
            }
          }
        });
      });
    }
    // Object.keys(kr).forEach((prefix) => {
    //   keywords.forEach((kw) => {
    //     if (!kr[prefix][kw]) {
    //       kr[prefix][kw] = {};
    //     }
    //   });
    // });

    const focusedKeywords = [...new Set(focusedSearchQuery.trim().split(/[\s,]+/))];
    const fmc = {};
    for (let i = 0; i < focusedKeywords.length; i++) {
      const focusedKeywordResp = await axios.get(`${lovApiBaseUrl}/api/v2/term/search?type=class&q=${focusedKeywords[i]}`);
      focusedKeywordResp.data.results.forEach((result) => {
        const prefixedName = result.prefixedName.join('');
        const highlight = result.highlight;
        const uri = result.uri.join('');
        result['vocabulary.prefix'].forEach((prefix) => {
          if (fmc[prefix]) {
            fmc[prefix][uri] = { prefixedName, highlight };
          } else {
            fmc[prefix] = { [uri]: { prefixedName, highlight } };
          }
        });
      });
    }

    const newSelectedConcepts = {};
    Object.keys(fmc).forEach((prefix) => {
      if (mc[prefix]) {
        newSelectedConcepts[prefix] = {};
        Object.keys(fmc[prefix]).forEach((focusedUri) => {
          if (mc[prefix][focusedUri]) {
            newSelectedConcepts[prefix][focusedUri] = true;
          }
        });
      }
    });
    setSelectedConcepts(newSelectedConcepts);

    setMatchedConcepts(mc);
    setKeywordResults(kr);
    const sortedVocabPrefixes = Object.keys(vocabsPrefixSet).sort((prefix1, prefix2) => {
      const c1 = Object.keys(newSelectedConcepts[prefix1] || {}).length;
      const c2 = Object.keys(newSelectedConcepts[prefix2] || {}).length;
      let k1 = 0;
      Object.keys(kr[prefix1] || {}).forEach((k) => {
        k1 += Object.keys(kr[prefix1][k]).length;
      });
      let k2 = 0;
      Object.keys(kr[prefix2] || {}).forEach((k) => {
        k2 += Object.keys(kr[prefix2][k]).length;
      });
      if (c2 > c1) {
        return 1;
      }
      if (c2 < c1) {
        return -1;
      }
      if (k2 > k1) {
        return 1;
      }
      if (k2 < k1) {
        return -1;
      }
      return 0;
    });
    setVocabPrefixes(sortedVocabPrefixes);
    setLoading(false);
  };
  const handleSectionClick = (keyword) => () => {
    if (!searchQuery.split(/[\s,]+/).map((s) => s.toLowerCase()).includes(keyword.toLowerCase())) {
      setSearchQuery(`${searchQuery} ${keyword}`);
      _submitButton.current.click();
    }
  };
  useEffect(() => {
    if (triggerFormSubmit) {
      _submitButton.current.click();
    }
  }, [triggerFormSubmit]);
  // useEffect(() => {
  //   const timeout = setTimeout(() => fetchSearchResults(), 500);
  //   return () => { clearTimeout(timeout); };
  // }, [searchQuery]);
  const handleSetSelectedConcept = (vocabPrefix) => (uri) => () => {
    const newSelectedConcepts = { ...selectedConcepts };
    if (newSelectedConcepts[vocabPrefix]) {
      if (newSelectedConcepts[vocabPrefix][uri]) {
        delete newSelectedConcepts[vocabPrefix][uri];
      } else {
        newSelectedConcepts[vocabPrefix][uri] = true;
      }
    } else {
      newSelectedConcepts[vocabPrefix] = { [uri]: true };
    }
    setSelectedConcepts(newSelectedConcepts);
  };
  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="lg">
        <Header onSectionClick={handleSectionClick} />
        <form className={classes.form} onSubmit={handleFetchSearchResults}>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <TextField variant="outlined" margin="normal" required fullWidth label="Focused class keywords" title="Please fill in a list of keywords separated by a space or a comma"
                value={focusedSearchQuery}
                onChange={e => setFocusedSearchQuery(e.target.value)}
              />
              {!triggerFormSubmit && (
                <span>
                  <Typography>Try keyword</Typography>
                  {suggestedKeywords.map((k) => (
                    <Chip
                      key={k}
                      size="small"
                      color="primary"
                      onClick={(e) => {
                        e.preventDefault();
                        setFocusedSearchQuery(k);
                        setTriggerFormSubmit(true);
                      }}
                      label={k}
                    />
                  ))}
                </span>
              )}
            </Grid>
            <Grid item xs={4}>
              <TextField variant="outlined" margin="normal" fullWidth label="Additional keywords" title="Please fill in a list of keywords separated by a space or a comma"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                InputProps={{
                  endAdornment: <InputAdornment>{loading ? <CircularProgress /> : <IconButton type="submit"><SearchIcon /></IconButton>}</InputAdornment>
                }}
              />
            </Grid>
            <Grid item xs={2} style={{ display: 'flex' }}>
              <Button style={{ flexGrow: 1, height: 54, marginTop: 16 }} buttonRef={_submitButton} size="large" color="primary" type="submit">Search</Button>
            </Grid>
          </Grid>
        </form>
        <ConfirmDialog title="New search?" open={confirmOpen} setOpen={setConfirmOpen} onConfirm={fetchSearchResults}>
          By making a new search, the list of saved ontologies will reset. Do you want to continue?
        </ConfirmDialog>
        <Grid container spacing={2}>
          {vocabPrefixes.map((vocabPrefix) => {
            return (
              <VocabSearchResult
                key={vocabPrefix}
                vocabPrefix={vocabPrefix}
                onOpenDetails={() => setSelectedVocabPrefix(vocabPrefix)}
                matchedConcepts={matchedConcepts[vocabPrefix]}
                keywordResults={keywordResults[vocabPrefix]}
                focusedKeywords={[...new Set(focusedSearchQuery.split(/[\s,]+/))]}
                keywords={searchQuery.split(/[\s,]+/)}
                selectedConcepts={selectedConcepts[vocabPrefix]}
                handleSetSelectedConcept={handleSetSelectedConcept(vocabPrefix)} />
            )
          })}
        </Grid>
      </Container>
      <Footer />
      <VocabDetailsDialog
        vocabPrefix={selectedVocabPrefix}
        handleClose={() => setSelectedVocabPrefix('')}
        selectedConcepts={selectedConcepts[selectedVocabPrefix]}
        matchedConcepts={matchedConcepts[selectedVocabPrefix]} />
      <SettingsDialog selectedVocabPrefix={selectedVocabPrefix} />
      <SavedOntologiesDialog setSelectedVocabPrefix={setSelectedVocabPrefix} />
      <ReuseSummaryDialog />
      {!!context.snackBarContent && (
        <Snackbar open autoHideDuration={5000} onClose={() => context.setSnackBarContent(null)}>
          <Alert onClose={() => context.setSnackBarContent(null)} severity={context.snackBarContent.color}>{context.snackBarContent.msg}</Alert>
        </Snackbar>
      )}
    </React.Fragment>
  );
});

export default App;
