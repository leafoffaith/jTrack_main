/**
 * Use axios to make a call to localhost:3001/api/kuroshiro with a text query param and return the response
 * @param {string} text - the text to convert to hiragana with furigana for kanji
 * @returns {Promise<string>} - the converted text
 * @example
 * 
 */

import axios from 'axios';

export const getHint1 = async (text) => {
    const response = await axios.get('http://localhost:3001/api/kuroshiro', {
        params: {
        text: text
        }
    });
    return response.data;
    }

    