# What2Wear

Welcome to What2Wear, your digital wardrobe and smart stylist! 

## Current Repository Structure 
Note: this structure will be extended as we develop more project components; this is our basic beginning structure.
```
.
├── __tests__           # Tests should go in this folder
├── backend             # All files for the backend 
├── docs                # Additional docs used in wiki 
├── frontend            # All files for the frontend 
└─├── app                 # Here is where the What2Wear app lies
    └─├── (tabs)/           # Contains the typeScript files for running the application
      ├──services/          # API calls, data fetching logic
      ├── navigation/       # React navigation or any routing logic 
   ├── assets              # Static assets like images, fonts, etc. 
   ├── components          # Reusable UI components like buttons, headers, etc.
   ├── constants           # Store constant values like colors, API endpoints, etc.
   ├── hooks               # Custom React hooks for reusable logic
   ├── scripts             # JavaScript for resetting project, generated by Expo app creation
   ├── .gitignore          # Specified files to be ignored by Git
   ├── app.json            # Info about the App
   ├── babel.config.js     # Static JSON file to allow other tools using Babel to cache the results of Babel safely
   ├── package-lock.json   # Records the exact versions of all packages and dependencies in the Node.js project
   ├── package.json        # Node.js dependencies and scripts
   ├── tsconfig.json       # Specifies how the TypeScript compiler processes code
├── .gitignore          # Specified files to be ignored by Git
├── README.md           # This file, including setup specification and breakdown
└── package-lock.json   # Records the exact versions of all packages and dependencies in the Node.js project

```

## Getting started

1. Clone the repository to your device. 

2. Install dependencies using: 

   ```bash
   npm install
   ```
   (You may need to install Expo, Node, etc.) 

3. Start the app

   ```bash
    npx expo start
   ```

4. Viewing the app:
* You can scan the QR code with your mobile device (iOS or Android) to view the mobile version of the app on your device. (NOTE: you must have the Expo Go application downloaded on your mobile device). 
* You also have the option to use a virtual emulator to view the mobile versions of the application through your computer screen.
* If all else fails, Press 'w' on your keyboard to launch the web version of the app on your computer in a new window (this is not exactly what the mobile app will look like, but you will get an idea of the UI). 
