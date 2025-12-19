// This file is not currently used but kept for potential future use
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const renderButtons = (
  options: string[],
  back: string,
  handlePractice1: () => void,
  handlePractice5: () => void
) => {
  return options.map((option: string, index: number) => {
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
