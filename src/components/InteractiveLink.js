import React, { useEffect, useState } from 'react';
import Link from '@material-ui/core/Link';
import axios from 'axios';

import { PREFIXES } from '../config';

const axiosConfig = {
  headers: {
    "accept": "application/sparql-results+json,*/*;q=0.9",
    "accept-language": "en-US,en;q=0.9",
    "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
  }
};


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
    if (entityLabels[iri] && new Date() - new Date(entityLabels[iri].timestamp) < 1000 * 60 * 60 * 24 * 14) {
      setLabel(entityLabels[iri].label);
    } else {
      const saveLabel = (label) => {
        setLabel(label);
        entityLabels[iri] = { label, timestamp: new Date().toISOString() };
        entityLabels = { ...entityLabels, ...JSON.parse(localStorage.entityLabels), };
        localStorage.entityLabels = JSON.stringify(entityLabels);
      }
      if (iri.includes('wikidata')) {
        axios.get(`https://cors-proxy.itake.cz/get?url=${iri}`, { headers: { "accept": "application/json" } }).then((resp) => {
          let label = '';
          Object.keys(resp.data.entities).forEach((id) => {
            if (resp.data.entities[id].labels && resp.data.entities[id].labels.en) {
              label = resp.data.entities[id].labels.en.value;
            }
          });
          saveLabel(label);
        });
      } else {
        const payload = `query=${PREFIXES}${getEntityLabelQuery(iri)}`;
        axios.post('https://lov.linkeddata.es/dataset/lov/sparql', payload, axiosConfig).then((resp) => {
          if (resp.data.results.bindings.length) {
            saveLabel(resp.data.results.bindings.filter((b) => b.label && b.label['xml:lang'] === 'en' && b.label.value).map((b) => b.label.value).join('/'))
          }
        });
      }
    }
  }, [iri]);

  return (
    <Link {...props} title={`Label @en: ${label || 'N/A'}`}>
      {props.children}
    </Link>
  );
};
export default InteractiveLink;
