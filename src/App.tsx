import { Grid, GridItem } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import './App.css';

const START_NEW_ROW = '-';
const MAX_INPUT_LENGTH = 30;
const CHARACTERS_PER_ROW = 5;
const CORRECT_POSITION = 'CORRECT_POSITION';
const INCORRECT_POSITION = 'INCORRECT_POSITION';

const useWordallGame = (_word: string) => {
  const [word] = useState(_word);
  const [input, setInput] = useState('');
  const activeRow = Math.floor(input.length / (CHARACTERS_PER_ROW + 1)); // +1 for START_NEW_ROW signalling a new row
  const minCharsAllowed = activeRow * CHARACTERS_PER_ROW;
  const maxCharsAllowed = minCharsAllowed + CHARACTERS_PER_ROW;
  const inputLength = input
    .split('')
    .filter((letter) => letter !== START_NEW_ROW).length;

  useEffect(function listenToKeyEvents() {
    const handleKeyPress = (event: KeyboardEvent) => onChange(event);

    document.addEventListener('keydown', handleKeyPress);

    return () => document.removeEventListener('keydown', handleKeyPress);
  });

  const onChange = ({ key, code }: KeyboardEvent) => {
    // If the row is full, restrict to only backspace and enter
    if (inputLength === maxCharsAllowed) {
      if (key === 'Enter') {
        if (input.includes(word)) {
          alert("You've won!");
        }
        setInput((prev) => prev + START_NEW_ROW);
      }

      if (key === 'Backspace') {
        setInput((prev) => prev.slice(0, -1));
      }
      return;
    }

    const gameOver =
      input.toLowerCase().includes(word) || inputLength === MAX_INPUT_LENGTH;
    if (gameOver) return null;

    // Only allow backspace to remove active rows letters
    if (inputLength === minCharsAllowed) {
      if (key === 'Backspace') return;
    }

    if (key === 'Backspace') {
      setInput((prev) => prev.slice(0, -1));
      return;
    }

    // Disallowed keys
    if (!code.includes('Key')) return;

    setInput((prev) => prev + key);
  };

  const generateLetterStatuses = () => {
    const wordLetters = word
      .split('')
      .map((letter, index) => ({ letter, index }));

    // Adjust the letters index to be between 0 and 4 repeating to align with the word
    const inputLetters = input
      .toLowerCase()
      .split('')
      .filter((letter) => letter !== START_NEW_ROW)
      .map((letter, index) => ({ letter, index: index % 5 }));

    const inputLettersWithStatuses = inputLetters.map((letter, index) => {
      const matchingLetter = wordLetters.find(
        (wordLetter) => wordLetter.letter === letter.letter
      );

      let status = 'not-in-word';

      if (matchingLetter) {
        status = INCORRECT_POSITION;

        if (matchingLetter.index === letter.index) {
          status = CORRECT_POSITION;
        }
      }

      return {
        ...letter,
        status,
        activeRow: activeRow === Math.floor(index / CHARACTERS_PER_ROW),
      };
    });

    return inputLettersWithStatuses;
  };

  return { letters: generateLetterStatuses() };
};

function App() {
  const { letters } = useWordallGame('unite');

  return (
    <div className="App">
      <Grid
        templateColumns="repeat(5, 1fr)"
        templateRows="repeat(6, 1fr)"
        gap={10}
        h="520px"
        w="520px"
        border="1px solid white"
        p={10}
      >
        {letters.map(({ activeRow, letter, status }) => {
          return (
            <GridItem
              bg={
                activeRow
                  ? 'white'
                  : status === CORRECT_POSITION
                  ? 'green'
                  : status === INCORRECT_POSITION
                  ? 'yellow'
                  : 'gray'
              }
              border={'1px solid white'}
              w="100%"
              display="flex"
              justifyContent="center"
              alignItems="center"
              textColor="black"
              fontSize={24}
              textTransform="uppercase"
            >
              {letter}
            </GridItem>
          );
        })}
      </Grid>
    </div>
  );
}

export default App;
