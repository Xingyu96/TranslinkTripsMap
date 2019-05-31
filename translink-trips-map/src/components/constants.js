export const APP_NAME = 'Compass Card Tracker';
export const DEFAULT_COORD = {
  center: {
    lat: 49.1916,
    lng: -123.0207
  },
  zoom: 11
};

export const BOUNDS = {
  northwest: {
    lat: 49.419930,
    lng: -123.389572
  },
  southeast: {
    lat: 49.029974,
    lng: -122.221991
  }
}

export const RECT_BOUNDS = {
  north: 49.419930,
  south: 49.029974,
  east: -122.221991,
  west: -123.389572,
}

// Google map
export const GMAP_API_KEY = 'AIzaSyBDvkef8wBUZkmHrWsIpi62yE70JrW-S0w';

export const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const DATE_TIME = 0;
export const TRANSACTION = 1;
export const PRODUCT = 2;
export const LINE_ITEM = 3;
export const AMOUNT = 4;
export const BALANCE_DETAILS = 5;
export const ORDER_DATE = 6;
export const PAYMENT = 7;
export const ORDER_NUMBER = 8;
export const AUTH_CODE = 9;
export const TOTAL = 10;
export const GTFS = 11;

export const COMPASSCSV = {
  DATE_TIME: DATE_TIME,
  TRANSACTION: TRANSACTION,
  PRODUCT: PRODUCT,
  LINE_ITEM: LINE_ITEM,
  AMOUNT: AMOUNT,
  BALANCE_DETAILS: BALANCE_DETAILS,
  ORDER_DATE: ORDER_DATE,
  PAYMENT: PAYMENT,
  ORDER_NUMBER: ORDER_NUMBER,
  AUTH_CODE: AUTH_CODE,
  TOTAL: TOTAL,
  GTFS: GTFS,
}

// google map animation
export const TO_START = 0;
export const PAUSE = 1;
export const PLAY = 2;

export const PLAYBACK = {
  SPEED_1: 0,
  SPEED_2: 1,
  SPEED_3: 2,
  SPEED_4: 3,
  SPEED_1_INC: 360000,
  SPEED_2_INC: 4320000,
  SPEED_3_INC: 4320000 * 2,
  SPEED_4_INC: 4320000 * 14,
  REFRESH_RATE: 100,
}

// Colours
export const DARK_GREY = 'rgb(52,58,64)';
export const MEDIUM_GREY = '#43494E';
export const DARK_BLUE = '#1B4E6B';
export const LIGHT_BLUE = '#6CCEF5';

// d3 svg
export const SVG_HEIGHT = 300;
export const SVG_WIDTH = 500;

// gtfs 
export const GTFS_COL_IND = {
  stop_lat: 0,
  stop_code: 1,
  stop_lon: 2,
  stop_id: 3,
  stop_url: 4,
  parent_station: 5,
  stop_desc: 6,
  stop_name: 7,
  location_type: 8,
  zone_id: 9
}

export const GTFS_COL_STR = {
  stop_lat: "stop_lat",
  stop_code: "stop_code",
  stop_lon: "stop_lon",
  stop_id: "stop_id",
  stop_url: "stop_url",
  parent_station: "parent_station",
  stop_desc: 'stop_desc',
  stop_name: "stop_name",
  location_type: "location_type",
  zone_id: "zone_id"
}
