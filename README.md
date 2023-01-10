# MX Simulator Automatic Statistics Generator

Very **very** rough, but functional, statistics generator for Mx Simulator in raceFactory Gaming series. It utilizes a web scraper built in JavaScript to write to an output text file in BBCode format. I haven't had time to update anything or slim down the code, so functionality should work, but may be limited or need slight changes.

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
2. Install [Git](https://phoenixnap.com/kb/how-to-install-git-windows)
3. Open a command prompt in administrator mode
4. Run the command `npm install --global yarn`
5. Clone the [repository](https://github.com/iMoto251/stats-gui.git) or [download the zip file](https://github.com/iMoto251/stats-gui/archive/refs/heads/main.zip) and extract the folder to your desired location
6. Run the Install.bat file to install necessary dependencies (This can take a while depending on internet speed)
7. Run the StartApp.bat file to start the app

## FAQ
**Triple Crowns are untested. After the first Triple Crown of 2022, I will have it updated to work 100% correctly**
> How do I use this thing?

- [Here](https://i.gyazo.com/c8294b115190b8fb6e8c3e87b6fbeb7b.png) is an example picture of how it should look when it is filled out. The easiest way to get the results, is to go to the rF page and click the links there. If they aren't on rF yet, you can always go to the [server page](https://mxsimulator.com/servers/), navigate to the race server, and find the results manually from there. They're *usually* in incrementing order, but not always. [Here](https://raw.githubusercontent.com/iMoto251/stats-gui/main/example.txt) is some example data to use that should give an accurate representation of what the data should look like.

> What if there isn't a coast, like it's an east/west shootout?

- Choose "None" for the 250 Coast

> There wasn't an LCQ. What do I do now?

- Leave it blank. The Qualifying and LCQ boxes can be left blank and they will skip them. Every other box is required at the moment.

> How do I use this for EMF?

- EMF stats can be made by just using the stats pushed to the server pages, and by leaving the qualifying box blank. This will not generate qualifying or points, as the only data I have it pulling from right now is RF. EMF qualifying and points are coming soon.

> Teams are the wrong color, how do I edit that?

- Editing the google sheet below is the only way to change teams. Send me a message on discord (iMoto#1251) for edit access.

> Where does the teams data come from?

- [This](https://docs.google.com/spreadsheets/d/1aPu8IwZD60baEHk8dSsKf3Ib7vSnH_SEZ4GGTCjDPFA/edit#gid=138797587) google sheet is an older example. I will have instructions on how to copy and use this sheet for your own series later. Data is pulled straight from the sheet.
