import React, { useState } from 'react';

const MainContext = React.createContext();
const defaultCategoryTypeWeightValues = [1, 0.3, 0.5, 0.7];

export function MainContextProvider({ children }) {
  const [savedOntologies, setSavedOntologies] = useState({});
  const [isSavedOntologiesDialogOpen, setIsSavedOntologiesDialogOpen] = useState(false);
  const [isReuseSummaryDialogOpen, setIsReuseSummaryDialogOpen] = useState(false);
  const [snackBarContent, setSnackBarContent] = useState('');
  const [categoryTypeWeightValues, setCategoryTypeWeightValues] = useState(
    JSON.parse(localStorage.getItem('categoryTypeWeightValues') || JSON.stringify(defaultCategoryTypeWeightValues))
  );
  const changeCategoryTypeWeightValue = (index, newValue, selectedVocabPrefix) => {
    if (!savedOntologies[selectedVocabPrefix]) {
      const newValues = [...categoryTypeWeightValues];
      newValues[index] = newValue;
      setCategoryTypeWeightValues(newValues);
      localStorage.setItem('categoryTypeWeightValues', JSON.stringify(newValues));
    } else {
      const newSavedOntologies = { ...savedOntologies };
      const newValues = newSavedOntologies[selectedVocabPrefix].weights;
      newValues[index] = newValue;
      const so = newSavedOntologies[selectedVocabPrefix];
      so.weights = newValues;
      setSavedOntologies(newSavedOntologies);
    }
  };
  const resetCategoryTypeWeightValues = (selectedVocabPrefix) => {
    if (!savedOntologies[selectedVocabPrefix]) {
      setCategoryTypeWeightValues(defaultCategoryTypeWeightValues);
      localStorage.setItem('categoryTypeWeightValues', JSON.stringify(defaultCategoryTypeWeightValues));
    } else {
      const newSavedOntologies = { ...savedOntologies };
      const so = newSavedOntologies[selectedVocabPrefix];
      so.weights = defaultCategoryTypeWeightValues;
      setSavedOntologies(newSavedOntologies);
    }
  };
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);
  const addSavedOntology = (ontology) => {
    setSavedOntologies({ ...savedOntologies, [ontology.vocabData.prefix]: ontology });
  };
  const removeSavedOntology = (prefix) => {
    const so = { ...savedOntologies };
    delete so[prefix];
    setSavedOntologies(so);
  };
  const resetSavedOntologies = () => {
    setSavedOntologies({});
  };
  const getValues = () => ({
    categoryTypeWeightValues,
    changeCategoryTypeWeightValue,
    resetCategoryTypeWeightValues,
    snackBarContent,
    setSnackBarContent,
    isSettingsDialogOpen,
    setIsSettingsDialogOpen,
    savedOntologies,
    addSavedOntology,
    removeSavedOntology,
    resetSavedOntologies,
    isSavedOntologiesDialogOpen,
    setIsSavedOntologiesDialogOpen,
    isReuseSummaryDialogOpen,
    setIsReuseSummaryDialogOpen,
  });
  return (
    <MainContext.Provider value={getValues()}>
      {children}
    </MainContext.Provider>
  );
}

export function withMainContext(Component) {
  return function ComponentWithContext(props) {
    return (
      <MainContext.Consumer>
        {(value) => /* eslint-disable-line react/jsx-props-no-spreading */ <Component {...props} context={value} />}
      </MainContext.Consumer>
    );
  };
}
