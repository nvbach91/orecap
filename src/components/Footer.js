import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';
import Divider from '@material-ui/core/Divider';
import GitHubIcon from '@material-ui/icons/GitHub';
import { Grid } from '@material-ui/core';

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://fis.vse.cz">
        Faculty of Informatics and Statistics, University of Economics, Prague
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const useStyles = makeStyles((theme) => ({
  footer: {
    backgroundColor: theme.palette.background.paper,
    // marginTop: theme.spacing(8),
    padding: theme.spacing(6, 0),
  },
}));

export default function Footer(props) {
  const classes = useStyles();
  return (
    <footer className={classes.footer}>
      <Container maxWidth="lg">
        <Grid container>
          <Grid item xs={2}></Grid>
          <Grid item xs={8}>
            <Divider />
            <br />
            <Typography variant="body2" align="center" gutterBottom>
              The focus class is a class that you want to further partition by subcategories, using the discovered ontologies. 
              Enter a keyword (or, multiple synonymous ones) likely to appear in the name of the focus class, and possibly some additional keywords (for finer ranking). 
              Then you will be able to calculate the FCP – the focus categorization power (as a specific quality measure) - of each discovered ontology, 
              respective to the selected focus class, and view the subcategories the ontology offers – including the subcategories that are not named classes but 
              compound concept expressions. Finally, you can save each relevant ontology to a list, and eventually view the list as ranked by the overall FCP values.
            </Typography>
            <br />
            <Divider />
            <br />
          </Grid>
          <Grid item xs={2}></Grid>
        </Grid>
        <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
              OReCaP - A tool based on <Link target="_blank" href="http://www.semantic-web-journal.net/content/focused-categorization-power-ontologies-general-framework-and-study-simple-existential">Focused Categorization Power of Ontologies</Link>
            </Typography>
            <Typography variant="subtitle2" align="center" color="textSecondary" component="p">
              <GitHubIcon /> GitHub Projects: <Link target="_blank" href="https://github.com/nvbach91/FCP_api">FCP API</Link> | <Link target="_blank" href="https://github.com/nvbach91/fcp-demo">FCP Demo</Link>
            </Typography>
            <Typography variant="subtitle2" align="center" color="textSecondary" component="p">
              Powered by <Link target="_blank" href="https://lov.linkeddata.es/dataset/lov">Linked Open Vocabularies (LOV)</Link> and <Link target="_blank" href="https://github.com/owlcs/owlapi">OWL API 5</Link>
            </Typography>
            <Copyright />
      </Container>
    </footer>
  );
}

