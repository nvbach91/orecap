import React from 'react';
import InteractiveLink from './components/InteractiveLink';

export const copyToClipboard = (textToCopy, container) => {
  // console.log(container);
  const textField = document.createElement('textarea');
  textField.value = textToCopy;
  const cont = container || document.body;
  cont.appendChild(textField);
  textField.select();
  document.execCommand('copy');
  cont.removeChild(textField);
};

export const createShortenedIRILink = (iri, nsp, prefix, secondary) => {
    return (
      <InteractiveLink key={iri} iri={iri} color={secondary ? 'inherit' : 'primary'} target="_blank" href={iri}>
        {iri.includes(nsp) ? `${prefix}:` : '' }<strong>{iri.replace(nsp, '')}</strong>
      </InteractiveLink>
    );
};

export const getMatchedConceptMetadata = ({ highlight, prefixedName }) => {
  let label = '';
  let description = '';
  Object.keys(highlight).forEach((key) => {
    [
      'http://www.w3.org/2000/01/rdf-schema#label',
      'http://purl.org/dc/terms/title',
      'http://www.w3.org/2004/02/skos/core#prefLabel',
      'localName.ngram',
    ].forEach((p) => {
      if (!label && key.includes(p)) {
        label = highlight[key].join('').replace(/<\/?b>/g, '');
      }
    });
    [
      'http://www.w3.org/2000/01/rdf-schema#comment',
      'http://purl.org/dc/terms/description',
      'http://www.w3.org/2004/02/skos/core#note',
      'http://www.w3.org/2004/02/skos/core#scopeNote',
      'http://www.w3.org/ns/prov#definition',
      'http://www.w3.org/2004/02/skos/core#definition',
      'http://purl.org/imbi/ru-meta.owl#definition',
    ].forEach((p) => {
      if (!description && key.includes(p)) {
        description = highlight[key].join('').replace(/<\/?b>/g, '');
      }
    })
  });
  return { label, description, prefixedName };
};

export const calculateTotalFcpScore = ({ vocabDownloadUrl, fcpData, weights, selectedConcepts, categoryTypes }) => {
  let score = 0;
  if (!vocabDownloadUrl || !fcpData) {
    return score;
  }
  Object.keys(categoryTypes).forEach((categoryType) => {
    const weight = weights[categoryType.slice(1) - 1];
    Object.keys(categoryTypes[categoryType]).forEach((focusClass) => {
      if (selectedConcepts && selectedConcepts[focusClass.replace(/[<>]/g, '')]) {
        score += weight * categoryTypes[categoryType][focusClass].length;
      }
    });
  });
  return score.toFixed(2);
};

export const getCategoryTypes = ({ fcpData, vocabDownloadUrl }) => {
  if (!fcpData || !vocabDownloadUrl) {
    return {};
  }
  const categoryTypes = {};
  Object.keys(fcpData[vocabDownloadUrl]).forEach((categoryType) => {
    const focusClasses = {}
    fcpData[vocabDownloadUrl][categoryType].forEach((statement) => {
      const parts = statement.split(' | ');
      if (categoryType === 't1') {
        /*eslint no-useless-escape: "off"*/
        focusClasses[parts[1]] = parts[2].replace(/[\[\]]/g, '').split(', ');
      } else {
        if (!focusClasses[parts[4]]) {
          focusClasses[parts[4]] = [parts[2]];
        } else {
          focusClasses[parts[4]].push(parts[2]);
        }
      }
    });
    categoryTypes[categoryType] = focusClasses;
  });
  return categoryTypes;
};


export const getCamelCaseTokens = (str) => {
  if (str.includes('-')) {
    return str.split('-').filter((str) => !!str);
  }
  if (str.includes('_')) {
    return str.split('_').filter((str) => !!str);;
  }
  return str.replace(/([^A-Z])([A-Z])/g, '$1 $2').split(' ').filter((str) => !!str);;
};
