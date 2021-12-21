import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Slider from '@material-ui/core/Slider';
import Input from '@material-ui/core/Input';
import EqualizerIcon from '@material-ui/icons/Equalizer';
import Typography from '@material-ui/core/Typography';
import { withMainContext } from '../context/MainContext';
import CardContent from '@material-ui/core/CardContent';
import Card from '@material-ui/core/Card';

const useStyles = makeStyles((theme) => ({
  settingSection: {
    margin: theme.spacing(1),
  },
}));

const SettingsDialog = withMainContext(({ context, selectedVocabPrefix }) => {
  const classes = useStyles();
  const handleSliderChange = (index) => (e, value) => {
    context.changeCategoryTypeWeightValue(index, value, selectedVocabPrefix);
  };
  // const handleInputChange = (index) => (e) => {
  //   context.changeCategoryTypeWeightValue(index, e.target.value, selectedVocabPrefix);
  // };
  const handleResetCategoryTypeWeightValues = () => {
    context.resetCategoryTypeWeightValues(selectedVocabPrefix);
  };
  const handleClose = () => {
    context.setIsSettingsDialogOpen(false);
  };
  return (
    <Dialog fullWidth={true} maxWidth="md" open={context.isSettingsDialogOpen} onClose={handleClose}>
      <DialogTitle>FCP Weight Settings {context.savedOntologies[selectedVocabPrefix] ? `for ontology "${selectedVocabPrefix}"` : 'Global'}</DialogTitle>
      <DialogContent>
        {(context.savedOntologies[selectedVocabPrefix] ? context.savedOntologies[selectedVocabPrefix].weights : context.categoryTypeWeightValues).map((value, index) => (
          <Card key={index} className={classes.settingSection}>
            <CardContent>
              <Typography variant="h6">Category pattern c{index + 1} weight value</Typography>
              <Grid container spacing={2} alignItems="center">
                <Grid item><EqualizerIcon /></Grid>
                <Grid item xs>
                  <Slider marks step={0.01} min={0} max={1} value={value} onChange={handleSliderChange(index)} />
                </Grid>
                <Grid item>
                  <Input value={value} margin="dense"
                    // onChange={handleInputChange(index)}
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
  );
});

export default SettingsDialog;
