export const dateFormat = 'DD MMMM YYYY'
export const lovApiBaseUrl = 'https://lov.linkeddata.es/dataset/lov';
export const rdfIconUrl = 'https://www.w3.org/RDF/icons/rdf_w3c.svg';
export const fcpApiUrl = 'https://fcp.vse.cz/fcpapi/fcp';
export const RDFS_SUBCLASSOF = 'http://www.w3.org/2000/01/rdf-schema#subClassOf';
export const RDF_TYPE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
export const RDF_NIL = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#nil';
export const RDF_FIRST = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#first';
export const RDF_REST = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#rest';
export const OWL_THING = 'http://www.w3.org/2002/07/owl#Thing';
export const OWL_RESTRICTION = 'http://www.w3.org/2002/07/owl#Restriction';
export const OWL_CLASS = 'http://www.w3.org/2002/07/owl#Class';
export const OWL_NAMEDINDIVIDUAL = 'http://www.w3.org/2002/07/owl#NamedIndividual';
export const OWL_EQUIVALENTCLASS = 'http://www.w3.org/2002/07/owl#equivalentClass';
export const OWL_EQUIVALENTPROPERTY = 'http://www.w3.org/2002/07/owl#equivalentProperty';
export const OWL_ONPROPERTY = 'http://www.w3.org/2002/07/owl#onProperty';
export const OWL_INTERSECTIONOF = 'http://www.w3.org/2002/07/owl#intersectionOf';
export const OWL_SOMEVALUESFROM = 'http://www.w3.org/2002/07/owl#someValuesFrom';
export const OWL_HASVALUE = 'http://www.w3.org/2002/07/owl#hasValue';
// export const fcpApiUrl = window.location.host.includes('localhost') ? 'http://localhost:8080/fcp' : 'https://fcp.vse.cz/fcpapi/fcp';
export const prefixes = {
  vann: 'http://purl.org/vocab/vann/',
  voaf: 'http://purl.org/vocommons/voaf#',
  rdfs: 'http://www.w3.org/2000/01/rdf-schema#',
  owl: 'http://www.w3.org/2002/07/owl#',
  skos: 'http://www.w3.org/2004/02/skos/core#',
  rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
  dcterms: 'http://purl.org/dc/terms/',
  dc: 'http://purl.org/dc/elements/1.1/',
  dcmit: 'http://purl.org/dc/dcmitype/',
};
export const PREFIXES = Object.keys(prefixes).map((prefix) => `PREFIX ${prefix}: <${prefixes[prefix]}>`).join('\n') + '\n';
