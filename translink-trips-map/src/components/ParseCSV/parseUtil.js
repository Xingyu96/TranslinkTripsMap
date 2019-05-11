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

export function getDaysOfWeek(csvArray) {
  let dayCount = [0, 0, 0, 0, 0, 0, 0];
  for (let i = 1; i < csvArray.length; i++) {

    let dayNum = new Date(csvArray[i][0]).getDay();
    if (dayNum) {
      dayCount[dayNum]++;
    }
  }
  return dayCount;
}

export function getUsageByHour(csvArray) {
  let hourCount = [];
  for (let i = 0; i < 24; i++) {
    hourCount.push(0);
  }
  for (let i = 1; i < csvArray.length; i++) {
    let hourNum = new Date(csvArray[i][0]).getHours();
    if (hourNum) {
      hourCount[hourNum]++;
    }
  }
  return hourCount;
}

export function sumByTransportType(csvArray) {
  //0: by bus 1: by train/seabus 2: tap out 3: purchase/weborder 4: loaded 5: removed 6: other
  let output = [0, 0, 0, 0, 0, 0, 0, 0];
  for (let i = 1; i < csvArray.length; i++) {
    if (csvArray[i].length < 2) continue;

    let transactionItem = String(csvArray[i][1]);

    if (!isTrip(transactionItem)) {
      if (transactionItem.includes('Tap out')) {
        output[3]++;
      } else if (transactionItem.includes('Purchase') || transactionItem.includes('Web Order')) {
        output[4]++;
      } else if (transactionItem.includes('Loaded')) {
        output[5]++;
      } else if (transactionItem.includes('Removed')) {
        output[6]++;
      } else {
        console.log(csvArray[i]);
        console.log(transactionItem);
        output[7]++;
      }
    }
    else if (transactionItem.includes('Bus')) {
      output[0]++;
    } else if (transactionItem.includes('Stn')) {
      if (transactionItem.includes('Tap in')) {
        output[1]++;
      } else if (transactionItem.includes('Transfer')) {
        output[2]++;
      }

    } else {
      console.log(csvArray[i]);
      console.log(transactionItem);
      output[7]++;
    }
  }
  return output;
}

function isTrip(input) {
  let isTrip = false;
  let transfer = 'Transfer';
  let tapIn = 'Tap in';
  if (input.includes(transfer) || input.includes(tapIn)) {
    isTrip = true;
  }
  return isTrip;
}