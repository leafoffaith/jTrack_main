import React from 'react';

const renderButtons = (options, back, handlePractice1, handlePractice5) => {
  return options.map((option, index) => {
    if (option === back) {
      return (
        <button key={index} onClick={handlePractice5}>
          {option}
        </button>
      );
    } else {
      return (
        <button key={index} onClick={handlePractice1}>
          {option}
        </button>
      );
    }
  });
};
