import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import SettingsIcon from '@material-ui/icons/Settings';
import ViewListIcon from '@material-ui/icons/ViewList';
import Typography from '@material-ui/core/Typography';
import Badge from '@material-ui/core/Badge';
import Link from '@material-ui/core/Link';
import { withMainContext } from '../context/MainContext';

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
  return (
    <React.Fragment>
      <Toolbar className={classes.toolbar}>
        {/*<Button size="small">Subscribe</Button>*/}
        <Typography component="h2" variant="h5" color="inherit" align="center" noWrap className={classes.toolbarTitle}>
          OReCaP - Ontology Recommendation via Categorization Power
        </Typography>
        <IconButton onClick={() => context.setIsSavedOntologiesDialogOpen(true)}>
          <Badge badgeContent={Object.keys(context.savedOntologies).length} color="primary">
            <ViewListIcon />
          </Badge>
        </IconButton>
        <IconButton onClick={() => context.setIsSettingsDialogOpen(true)}>
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
    </React.Fragment>
  );
});

export default Header;
