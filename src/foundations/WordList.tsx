import raw from './words.json';

/** One line of the word list. */
export type Word = {term: string; use: string; where: string; avoid: string[]};
const data = raw as {words: Word[]};

/** The word list's table, from src/foundations/words.json: the one source the copy check reads too. */
export function WordList() {
  return (
    <table>
      <thead><tr><th>Word</th><th>What it means here</th><th>Avoid</th><th>Seen in</th></tr></thead>
      <tbody>{data.words.map(w => (
        <tr key={w.term}>
          <td><strong>{w.term}</strong></td>
          <td>{w.use}</td>
          <td>{w.avoid.length ? w.avoid.join(', ') : '–'}</td>
          <td><small>{w.where}</small></td>
        </tr>
      ))}</tbody>
    </table>
  );
}
