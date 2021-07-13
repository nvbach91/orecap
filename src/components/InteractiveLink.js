import React, { useEffect, useState } from 'react';
import Link from '@material-ui/core/Link';
import axios from 'axios';

const axiosConfig = {
  headers: {
    "accept": "application/sparql-results+json,*/*;q=0.9",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
  }
};


const prefixes = {
  vann:     'http://purl.org/vocab/vann/',
  voaf:     'http://purl.org/vocommons/voaf#',
  rdfs:     'http://www.w3.org/2000/01/rdf-schema#',
  owl:      'http://www.w3.org/2002/07/owl#',
  skos:     'http://www.w3.org/2004/02/skos/core#',
  rdf:      'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  dcterms:  'http://purl.org/dc/terms/',
  dc:       'http://purl.org/dc/elements/1.1/',
  dcmit:    'http://purl.org/dc/dcmitype/',
};

const PREFIXES = Object.keys(prefixes).map((prefix) => `PREFIX ${prefix}: <${prefixes[prefix]}>`).join('\n') + '\n';

const getEntityLabelQuery = (iri) => `
SELECT ?label WHERE {
  VALUES (?l) { (rdfs:label) (dc:title) (dcterms:title) (skos:prefLabel) }
  ${/^<.*>$/.test(iri) ? iri : `<${iri}>`} ?l ?label .
}`;

const InteractiveLink = (props) => {
  const { iri } = props;
  const [label, setLabel] = useState('');
  useEffect(() => {
    // console.log(iri);
    let entityLabels = {};
    try {
      entityLabels = JSON.parse(localStorage.entityLabels);
    } catch (e) {
      localStorage.entityLabels = '{}';
    }
    if (entityLabels[iri]){//} && new Date() - new Date(entityLabels[iri].timestamp) < 1000 * 60 * 60 * 24 * 30) {
      setLabel(entityLabels[iri].label);
    } else {
      const payload = `query=${PREFIXES}${getEntityLabelQuery(iri)}`;
      axios.post('https://lov.linkeddata.es/dataset/lov/sparql', payload, axiosConfig).then((resp) => {
        if (resp.data.results.bindings.length) {
          const label = resp.data.results.bindings.filter((b) => b.label && b.label.value).map((b) => b.label.value).join('/');
          setLabel(label);
          entityLabels[iri] =  { label, timestamp: new Date().toISOString() };
          entityLabels = { ...entityLabels, ...JSON.parse(localStorage.entityLabels), };
          localStorage.entityLabels = JSON.stringify(entityLabels);
        }
      });
    }
  }, [iri]);

  return (
    <Link {...props} title={`Label: ${label || 'N/A'}`}>
      {props.children}
    </Link>
  );
};
export default InteractiveLink;
