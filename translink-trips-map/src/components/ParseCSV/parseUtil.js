import {
  DATE_TIME,
  TRANSACTION,
  PRODUCT,
  LINE_ITEM,
  AMOUNT,
  BALANCE_DETAILS,
  ORDER_DATE,
  PAYMENT,
  ORDER_NUMBER,
  AUTH_CODE,
  TOTAL,
} from '../constants';

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

  let combinedCell = output[index][TRANSACTION] + output[index + 1][0];
  output[index].splice(1, 1, combinedCell);
  output[index + 1].splice(0, 1);
  output[index] = output[index].concat(output[index + 1]);
  output.splice(index + 1, 1);
}

export function getDaysOfWeek(csvArray) {
  let dayCount = [0, 0, 0, 0, 0, 0, 0];
  for (let i = 1; i < csvArray.length; i++) {

    let dayNum = new Date(csvArray[i][DATE_TIME]).getDay();
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
    let hourNum = new Date(csvArray[i][DATE_TIME]).getHours();
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

    let transactionItem = String(csvArray[i][TRANSACTION]);

    if (!isTrip(transactionItem)) {
      if (transactionItem.includes('Purchase') || transactionItem.includes('Web Order')) {
        output[4]++;
      } else if (transactionItem.includes('Loaded')) {
        output[5]++;
      } else if (transactionItem.includes('Removed')) {
        output[6]++;
      } else {
        console.log("is not trip " + csvArray[i]);
        console.log(transactionItem);
        output[7]++;
      }
    } else if (transactionItem.includes('Tap out')) {
      output[3]++;
    } else if (transactionItem.includes('Bus')) {
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

function isTrip(input) { // includes missing tap out 
  let isTrip = false;
  let transfer = 'Transfer';
  let tapIn = 'Tap in';
  let tapOut = 'Tap out';
  let busStop = 'Bus Stop';
  let station = 'Stn';
  let missing = 'Missing';
  // has to be bus stop or stn
  if (input.includes(busStop) || input.includes(station) || input.includes(missing)) {
    // has to be transfer, tap in, or tap out
    if (input.includes(transfer) || input.includes(tapIn) || input.includes(tapOut)) {
      isTrip = true;
    }
  }
  return isTrip;
}

function isStartTrip(input) { // does not include missing tap out
  let isTrip = false;
  let transfer = 'Transfer';
  let tapIn = 'Tap in';
  let busStop = 'Bus Stop';
  let station = 'Stn';
  // has to be bus stop or stn
  if (input.includes(busStop) || input.includes(station)) {
    // has to be transfer, tap in, or tap out
    if (input.includes(transfer) || input.includes(tapIn)) {
      isTrip = true;
    }
  }
  return isTrip;
}

export function getStartAndEndDate(csvArray) {
  let startDate = csvArray[csvArray.length - 2][0];
  let endDate = csvArray[1][0];

  return [startDate, endDate];
}

export function getLocationCount(csvArray) {
  let splitToken = ' at ';
  let locationCount = {};
  let sortableLocationCount = [];
  let curLocation = '';
  let splitLocationArray = [];
  for (let i = 1; i < csvArray.length; i++) {
    if (csvArray[i].length < 2) continue;
    if (!isTrip(csvArray[i][TRANSACTION])) continue;

    if (csvArray[i][TRANSACTION].includes(splitToken)) {
      splitLocationArray = csvArray[i][TRANSACTION].split(splitToken);
      if (csvArray[i][11]) {
        curLocation = String(csvArray[i][11].stop_name);
      } else {
        curLocation = splitLocationArray[1];
      }

      if (locationCount.hasOwnProperty(curLocation)) {
        locationCount[curLocation].count++;
      } else {
        locationCount[curLocation] = {
          count: 1,
          stopDetail: null,
        };
        if (csvArray[i][11]) {
          locationCount[curLocation].stopDetail = csvArray[i][11];
        }
      }
    }
  }
  for (let location in locationCount) {
    sortableLocationCount.push([location, locationCount[location]]);
  }
  sortByValueDescending(sortableLocationCount);
  return sortableLocationCount;
}

export function parseDetailedLocation(csvArray, busGTFS, trainGTFS, wceGTFS) {
  csvArray[0].push("GTFS");

  let splitToken = ' at ';
  let curLocation = '';
  let splitLocationArray = [];
  let busStop = 'Bus Stop ';
  let station = ' Stn';
  let curBusStopID = '';
  let curStationName = '';
  let transactionItem = '';
  let platformToken = 'Platform';
  let foundTrainStationName = '';
  let foundBusStopID = '';

  for (let i = 1; i < csvArray.length; i++) {
    transactionItem = String(csvArray[i][TRANSACTION]);
    if (transactionItem.includes(splitToken)) {
      splitLocationArray = transactionItem.split(splitToken);
      curLocation = splitLocationArray[1];

      if (curLocation.includes(busStop)) {
        curBusStopID = Number(curLocation.split(busStop)[1]);
        for (let j = 0; j < busGTFS.length; j++) {
          foundBusStopID = Number(busGTFS[j].stop_code);
          if (foundBusStopID === curBusStopID) {
            csvArray[i].push(busGTFS[j]);
            break;
          }
        }
      } else if (curLocation.includes(station)) {
        curStationName = curLocation.split(station)[0];

        for (let j = 0; j < trainGTFS.length; j++) {
          foundTrainStationName = String(trainGTFS[j].stop_name);
          if (foundTrainStationName.includes(curStationName) && !foundTrainStationName.includes(platformToken)) {
            csvArray[i].push(trainGTFS[j]);
            break;
          }
        }
      } else {
        console.log("unidentified: " + curLocation);
      }
    }
  }
}

export function sortByValueDescending(binaryArray) {
  binaryArray.sort(function (a, b) { return b[1].count - a[1].count });
}

export function getBalance(csvArray) {
  let balanceTimeSeries = [];
  let balanceString = '';
  let balanceNum = 0;
  for (let i = 1; i < csvArray.length; i++) {
    if (csvArray[i][BALANCE_DETAILS]) {
      balanceString = csvArray[i][BALANCE_DETAILS];
      balanceNum = Number(balanceString.slice(1, balanceString.length - 1));
      balanceTimeSeries.push([new Date(csvArray[i][DATE_TIME]), balanceNum]);
    }
  }
  return balanceTimeSeries;
}

export function wait(ms) {
  var d = new Date();
  var d2 = null;
  do { d2 = new Date(); }
  while (d2 - d < ms);
}

export function csvToGTFS(csvArray) {

}