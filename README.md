# TranslinkTripsMap
This Tool is a side project developed mainly using the `react-bootstrap` and `d3.js` packages. Its initial goal is to categorize the trip data gathered from Translink's public compass card trip record service. Anyone who has purchassed and who uses a Translink compass card can associate it with an online account through Translink's website and access their compass card usage data. 

I do not have any affiliation with Transklink, and updates to this package from me will be limited due to work.

## Installation
Once you clone this package, simply run `npm run start` in the main folder (`translink-trips-map/`). The server is defaulted to `localhost:3000`

## Features
So far, the available features are very basic, and new ones are still under work.

### Trip usage by hour and by day
Some data are very easy to extract thanks to each compass card data entry's timestamp. This feature gives a breakdown of card usage by hour and by day to give you a visualization on your transit usage pattern. The graphs are generated with `d3`.

### Account balance
You can view your account balance, which is recorded as a stepped line graph.

### Breakdown by station
It would be interesting to see which stops or stations you have visited the most. Surprisingly Google Maps would not be the best idea in this instance, since it does not provide bus stop ID search bias. Luckily, we can still geo-locate compass car usage with the help of static `GTFS` transit information, which is a standardized transit data model. We obtain Translink's `GTFS` information from `transitfeeds.com`, an open source website for transporation data.  Our app searches for keyword matches in stop information files in order to extract precise location coordinates, which is then mapped with Google Maps's Javascript mapping API.

### Animated Usage Map
This component of the app animates each compass car instance with the help of google map and a playback UI to its side. You can play your usage chronologically, pause, and alter the playback speed..

## Next steps


## Technical Details
