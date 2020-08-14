import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Typography from '@material-ui/core/Typography';
import Link from '@material-ui/core/Link';

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
        <Typography variant="h6" align="center" gutterBottom>
          {''}
        </Typography>
        <Typography variant="subtitle1" align="center" color="textSecondary" component="p">
          OReCaP - A tool based on Focused Categorization Power of Ontologies
        </Typography>
        <Typography variant="subtitle2" align="center" color="textSecondary" component="p">
          <Link target="_blank" href="http://www.semantic-web-journal.net/content/focused-categorization-power-ontologies-general-framework-and-study-simple-existential">Publications</Link> |&nbsp;
          GitHub Projects: <Link target="_blank" href="https://github.com/nvbach91/FCP_api">FCP API</Link>, <Link target="_blank" href="https://github.com/nvbach91/fcp-demo">FCP Demo</Link>
        </Typography>
        <Typography variant="subtitle2" align="center" color="textSecondary" component="p">
          Powered by Linked Open Vocabularies (LOV) - <Link target="_blank" href="https://lov.linkeddata.es/dataset/lov">https://lov.linkeddata.es/dataset/lov</Link>
        </Typography>
        <Copyright />
      </Container>
    </footer>
  );
}

