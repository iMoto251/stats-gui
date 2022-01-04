# MX Simulator Automatic Statistics Generator

Very **very** rough, but functional, statistics generator for Mx Simulator in raceFactory Gaming series. It utilizes a web scraper built in JavaScript to write to an output text file in BBCode format. I haven't had time to update anything or slim down the code, so funcitonality should work, but may be limited or need slight changes.

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
4. Clone the [repository](https://github.com/iMoto251/stats-gui.git) or [download the zip file](https://github.com/iMoto251/stats-gui/archive/refs/heads/main.zip) and extract the folder to your desired location
5. Run the Install.bat file to install necessary dependencies (This can take a while depending on internet speed)
6. Run the StartApp.bat file to start the app

## FAQ
> How do I use this thing?
[Here](https://i.gyazo.com/499bb0e46dbb63a50bdfb4488c4014da.png) is an example picture of how it should look when it is filled out. Here is some example data to use that should give an accurate representation of what the data should look like.

> What if there isn't a coast, like it's an east/west shootout?
Choose "None" for the 250 Coast

> How do I use this for EMF?
EMF stats can be made by just using the stats pushed to the server pages, and by checking the "No qualifying" box. This will not generate qualifying or points, as the only data I have it pulling from right now is RF. EMF qualifying and points are coming soon.

> Teams are the wrong color, how do I edit that?
Use Notepad++ to open the teams.json file. Find the rider/team/UID and change the bike value to the correct color code needed on the forums.

> Where does the teams data come from?
[This](https://docs.google.com/spreadsheets/d/1aPu8IwZD60baEHk8dSsKf3Ib7vSnH_SEZ4GGTCjDPFA/edit#gid=138797587) google sheet located [here](https://raw.githubusercontent.com/iMoto251/stats-gui/main/teams.json) in the repository using [this](https://forms.gle/DHX4kjSjMvyu7eEr9) google form. Anytime an update is made, you can copy and paste all the data into the teams.json file and the app will now have the updated info after you restart it.
