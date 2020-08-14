export const dateFormat = 'DD MMMM YYYY'
export const lovApiBaseUrl = 'https://lov.linkeddata.es/dataset/lov';
export const rdfIconUrl = 'https://www.w3.org/RDF/icons/rdf_w3c.svg';
// export const fcpApiUrl = 'https://fcp.vse.cz/fcpapi/fcp';
export const fcpApiUrl = window.location.host.includes('localhost') ? 'http://localhost:8080/fcp' : 'https://fcp.vse.cz/fcpapi/fcp';
