import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import IconButton from '@material-ui/core/IconButton';
import VolumeUp from '@material-ui/icons/VolumeUp';
import SettingsIcon from '@material-ui/icons/Settings';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import { withMainContext } from '../context/MainContext';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';

const useStyles = makeStyles((theme) => ({
  toolbar: {
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  toolbarTitle: {
    flex: 1,
  },
  toolbarSecondary: {
    justifyContent: 'space-between',
    overflowX: 'auto',
  },
  toolbarLink: {
    padding: theme.spacing(1),
    flexShrink: 0,
  },
  settingSection: {
    margin: theme.spacing(1),
  },
}));


const sections = [
  { title: 'Technology', url: '#' },
  { title: 'Design', url: '#' },
  { title: 'Culture', url: '#' },
  { title: 'Business', url: '#' },
  { title: 'Politics', url: '#' },
  { title: 'Opinion', url: '#' },
  { title: 'Science', url: '#' },
  { title: 'Health', url: '#' },
  { title: 'Style', url: '#' },
  { title: 'Travel', url: '#' },
];

const Header = withMainContext(({ context, onSectionClick }) => {
  const classes = useStyles();
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const handleClose = () => {
    setIsSettingsDialogOpen(false);
  };
  const handleSliderChange = (index) => (e, value) => {
    context.changeCategoryTypeWeightValue(index, value);
  };
  const handleInputChange = (index) => (e) => {
    context.changeCategoryTypeWeightValue(index, e.target.value);
  };
  const handleResetCategoryTypeWeightValues = () => {
    context.resetCategoryTypeWeightValues();
  };
  return (
    <React.Fragment>
      <Toolbar className={classes.toolbar}>
        {/*<Button size="small">Subscribe</Button>*/}
        <Typography component="h2" variant="h5" color="inherit" align="center" noWrap className={classes.toolbarTitle}>
          Focused Categorization Power of Ontologies
        </Typography>
        <IconButton onClick={() => setIsSettingsDialogOpen(true)}>
          <SettingsIcon />
        </IconButton>
        {/*<Button variant="outlined" size="small">
          Sign up
        </Button>*/}
      </Toolbar>
      <Toolbar component="nav" variant="dense" className={classes.toolbarSecondary}>
        {sections.map((section) => (
          <Link color="inherit" noWrap key={section.title} variant="body2" href={section.url} onClick={onSectionClick(section.title)} className={classes.toolbarLink}>
            {section.title}
          </Link>
        ))}
      </Toolbar>
      <Dialog fullWidth={true} maxWidth="md" open={isSettingsDialogOpen} onClose={handleClose}>
        <DialogTitle>FCP Weight Settings</DialogTitle>
        <DialogContent>
          {context.categoryTypeWeightValues.map((weight, index) => (
            <Card key={index} className={classes.settingSection}>
              <CardContent>
                <Typography variant="h6">Category type {index + 1}</Typography>
                <Grid container spacing={2} alignItems="center">
                  <Grid item><VolumeUp /></Grid>
                  <Grid item xs>
                    <Slider marks step={0.01} min={0} max={1} value={weight} onChange={handleSliderChange(index)} />
                  </Grid>
                  <Grid item>
                    <Input value={weight} margin="dense"
                      onChange={handleInputChange(index)}
                      inputProps={{ step: 0.01, min: 0, max: 1, type: 'number' }}
                    />
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleResetCategoryTypeWeightValues} color="primary">Reset values to default</Button>
          <Button onClick={handleClose} color="secondary">Close</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
});

export default Header;
