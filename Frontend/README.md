# CPS Frontend

## Description

The CPS is part of the ICON Republic DAO governance. The CPS supports worthy projects through grants from the Contribution Proposal Fund (CPF), which grows through the daily accumulation of block rewards. Learn how to submit a proposal and get paid to contribute to the ICON DAO by working on infrastructure, development, or community activities.

## Installation
- Clone the repo in your terminal by typing ```git clone https://github.com/ibriz/CPS.git```. This will copy all the files from this repo down to your computer
- In your terminal, cd into the directory you just created by typing ```cd CPS```
- Type ```cd Frontend``` to navigate to the frontend directory.
- Type ```npm install``` to install all dependencies
- Type ```npm start``` to run the app locally.

## Folder Structure

    ├── src                             # The source directory in the project
    │   ├── Assets                      # Assets of the Project
        │   ├── Images                  # The images used in the project
    │   ├── Components                  # Presentational Components used in the project
    │   └── Constants                   # Constants Used in the Project
    │   └── Containers                  # Container Components (Pages) used in the project
    │   └── helpers                     # Helper files used in the project
    │   └── Hooks                       # Custom Hooks for the project
    │   └── Redux                       # The directory for all the redux related files
        │   └── Constants               # The constants used in redux sagas (url endpoints)
        │   └── ICON                    # The helper files for communicating with ICONEX
            │   └── CustomEvents        # The custom events dispatched to send request to ICONEXX
            │   └── EventHandler        # Event Handlers used to listen events from ICONEX
            │   └── FrontendEndWalelt   # The wallet used in the frontend
        │   └── Reducers                # Redux Reducers / Slice used in the project.
        │   └── Sagas                   # The Redux Sagas used in the project
        │   └── Store                   # The redux store used in the project
    │   └── Router                      # The custom files for react-router in the project
    │   └── Selectors                   # The selectors used in the project
    │   └── styles                      # The styles (css/scss) used in the project.

## Documents

- User Guide: https://medium.com/ibriz-iconosphere how-to-use-the-contribution-proposal-system-1efe714c9182 
- CPS Whitepaper: https://docs.google.com/document/d/1g1idSDN7D64gHaBjOyhNw2dAD2YqEQcon_kB1WLJhas/edit
