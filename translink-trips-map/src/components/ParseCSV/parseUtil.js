export function parseCSVToArray(csvString) {
  let itemDelimiter = ',';
  let newLineDelimiter = '\n';
  let output = [];

  let csvLines = csvString.split(newLineDelimiter);

  for (let i = 0; i < csvLines.length; i++) {
    output.push(csvLines[i].split(itemDelimiter));
  }


  // massage results
  for (let j = 0; j < output.length; j++) {
    // web order - deal with new line character
    if (output[j].length === 2) {
      handleWebOrder(output, j);
    }
  }
  return output;
}

function handleWebOrder(output, index) {
  if (output[index].length !== 2) return output;

  let combinedCell = output[index][1] + output[index + 1][0];
  output[index].splice(1, 1, combinedCell);
  output[index + 1].splice(0, 1);
  output[index] = output[index].concat(output[index + 1]);
  output.splice(index + 1, 1);
}