import React from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardMedia from '@material-ui/core/CardMedia';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Avatar from '@material-ui/core/Avatar';
import Link from '@material-ui/core/Link';
import VisibilityIcon from '@material-ui/icons/Visibility';
import { rdfIconUrl } from '../config';

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
  uri: {
    wordBreak: 'break-all',
  },
  chip: {
    marginRight: 5,
    marginBottom: 2,
  },
});

export default function SearchResult({ item, onOpenDetails }) {
  const classes = useStyles();
  return (
    <Grid item xs={12} md={6}>
      <Card className={classes.card}>
        <CardContent className={classes.cardContent}>
          <Typography component="h2" variant="h5">
            <strong>{item._source.prefix}</strong>: {item._source['http://purl.org/dc/terms/title@en']}
          </Typography>
          <Typography variant="subtitle2" color="textSecondary" className={classes.uri}>
            <Link href={item._source.uri} target="_blank">{item._source.uri}</Link>
          </Typography>
          <div className={classes.cardDetails}>
            <Typography variant="body2" paragraph className={classes.cardDescription}>
              {item._source['http://purl.org/dc/terms/description@en']}
            </Typography>
            <CardMedia className={classes.cardMedia} image={rdfIconUrl} title={rdfIconUrl} />
          </div>
          <div>
            {item._source.tags.map((tag) => (
              <Chip className={classes.chip} key={tag} avatar={<Avatar>{tag.slice(0, 1)}</Avatar>} label={tag} title={`Tag: ${tag}`} onClick={() => { }} />
            ))}
          </div>
          <Button color="primary" onClick={onOpenDetails}><VisibilityIcon />&nbsp;View details</Button>
        </CardContent>
      </Card>
    </Grid>
  );
}

SearchResult.propTypes = {
  item: PropTypes.object,
};