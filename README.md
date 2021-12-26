# MX Simulator Automatic Statistics Generator

Very **very** rough, but funcitonal, statistics generator for Mx Simulator in raceFactory Gaming series. It utilizes a web scraper built in JavaScript to write to an output text file in BBCode format. I haven't had time to update anything or slim down the code, so funcitonality should work, but may be limited or need slight changes.

## Web Scraper
The web scraper is built utilizing puppeteer.

## GUI
The GUI is in HTML and CSS packed by electron.

## Upcoming projects
- MSI installer to install the program and all dependencies for ease of use.
- Add EMF series
- Update GUI to be more user friendly
- Automatically grab series race URL's from qualifying URL
- Chrome extension?


## Installation Instructions
> Only tested on Windows

1. Install [NodeJS](https://nodejs.org/en/download/)
2. Open a command prompt in administrator mode
3. Run the command `npm install --global yarn`
4. Clone the [no-app](https://github.com/iMoto251/stats-gui/tree/no-app) repository or [download the zip file](https://github.com/iMoto251/stats-gui/archive/refs/heads/no-app.zip) and extract the folder to your desired location
5. Open a command prompt and navigate to the extracted folder
6. Run the command `yarn` to install the dependencies
7. After the dependencies are installed, run `yarn start` to start the app
