import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
// import HeadToHeadSpeciesSelector from "./HeadToHeadSpeciesSelector";
import 'react-bootstrap-typeahead/css/Typeahead.css';
import 'react-bootstrap-typeahead/css/Typeahead.bs5.css';



// const onHeadToHeadSpeciesSelected = (speciesList) => {
//     console.log(speciesList);
// }

// function App() {
//   return <div><h1>Head-to-Head Birdsong quiz</h1>
// <HeadToHeadSpeciesSelector onSelectionComplete={headToHeadSpeciesList => onHeadToHeadSpeciesSelected(headToHeadSpeciesList)}/> 
//   </div>;
// }

const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<App tab="home" />);