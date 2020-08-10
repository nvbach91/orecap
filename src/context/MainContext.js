import React, { useState } from 'react';

const MainContext = React.createContext();
const defaultCategoryTypeWeightValues = [1, 0.3, 0.5, 0.7];

export function MainContextProvider({ children }) {
  const [categoryTypeWeightValues, setCategoryTypeWeightValues] = useState(
    JSON.parse(localStorage.getItem('categoryTypeWeightValues') || JSON.stringify(defaultCategoryTypeWeightValues))
  );
  const [snackBarContent, setSnackBarContent] = useState('');
  const changeCategoryTypeWeightValue = (index, newValue) => {
    const newValues = [...categoryTypeWeightValues];
    newValues[index] = newValue;
    setCategoryTypeWeightValues(newValues);
    localStorage.setItem('categoryTypeWeightValues', JSON.stringify(categoryTypeWeightValues));
  };
  const resetCategoryTypeWeightValues = () => {
    setCategoryTypeWeightValues(defaultCategoryTypeWeightValues);
  }
  const getValues = () => ({
    categoryTypeWeightValues,
    changeCategoryTypeWeightValue,
    resetCategoryTypeWeightValues,
    snackBarContent,
    setSnackBarContent,
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
