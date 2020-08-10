import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import Grid from '@material-ui/core/Grid';
import Container from '@material-ui/core/Container';
import SearchIcon from '@material-ui/icons/Search';
import Header from './Header';
import VocabDetailsDialog from './VocabDetailsDialog';
import Footer from './Footer';
import TextField from '@material-ui/core/TextField';
import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';
import { lovApiBaseUrl } from '../config';
import SearchResult from './SearchResult';
import { withMainContext } from '../context/MainContext';

import Snackbar from '@material-ui/core/Snackbar';
import MuiAlert from '@material-ui/lab/Alert';

const Alert = (props) => <MuiAlert elevation={6} variant="filled" {...props} />;

const useStyles = makeStyles((theme) => ({
  mainGrid: {
    marginTop: theme.spacing(3),
  },
}));

const App = withMainContext(({ context }) => {
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVocab, setSelectedVocab] = useState(null);
  const [loading, setLoading] = useState(false);
  const classes = useStyles();
  const fetchSearchResults = async (e) => {
    e && e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    const resp = await axios.get(`${lovApiBaseUrl}/api/v2/vocabulary/search?q=${searchQuery.trim()}`);
    setSearchResults(resp.data.results);
    setLoading(false);
  };
  const openDetailsDialog = (vocab) => () => {
    setSelectedVocab(vocab);
  };
  const handleSectionClick = (keyword) => () => {
    if (keyword !== searchQuery) {
      setLoading(true);
      setSearchQuery(keyword);
    }
  };
  useEffect(() => {
    const timeout = setTimeout(() => fetchSearchResults(), 500);
    return () => { clearTimeout(timeout); };
  }, [searchQuery]);
  return (
    <React.Fragment>
      <CssBaseline />
      <Container maxWidth="lg">
        <Header onSectionClick={handleSectionClick} />
        <main>
          <form className={classes.form} onSubmit={fetchSearchResults}>
            <TextField variant="outlined" margin="normal" required fullWidth label="Search for ontologies using keywords" name="keywords"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment>
                    {loading ? <CircularProgress /> :
                      <IconButton type="submit">
                        <SearchIcon />
                      </IconButton>}
                  </InputAdornment>
                )
              }}
            />
          </form>
          <Grid container spacing={2}>
            {searchResults.map((item) => (
              <SearchResult key={item._id} item={item} onOpenDetails={openDetailsDialog(item)}/>
            ))}
          </Grid>
        </main>
      </Container>
      <Footer/>
      <VocabDetailsDialog vocab={selectedVocab} handleClose={() => setSelectedVocab(null)} />
      
      <Snackbar open={!!context.snackBarContent} autoHideDuration={5000} onClose={() => context.setSnackBarContent('')}>
        <Alert onClose={() => context.setSnackBarContent('')} severity="success">{context.snackBarContent}</Alert>
      </Snackbar>
    </React.Fragment>
  );
});

export default App;
