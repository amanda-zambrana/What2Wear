# What2Wear

Welcome to What2Wear, your digital wardrobe and smart stylist! 

## Current Repository Structure 
Note: this structure will be extended as we develop more project components; this is our basic beginning structure.
```
.
├── app                 # Here is where the app lies 
└─├── components/       # UI components go here
  ├── styles/           # Global and component-specific styles 
  ├── navigation/       # React navigation or any routing logic 
  ├── assets/           # Static assets like images, fonts, etc. 
  ├── services/         # API calls, data fetching logic
  └── utils/            # Utility functions and helpers
├── docs                # Additional documentation and assets go here 
└─├── prototype-images  # Screenshots of the prototypes go here (used in wiki)
├── app.js              # Entrypoint for the project
├── app.json            # Info about the App
├── images              # Images for assets
├── package.json        # Node.js dependencies and scripts
├── README.md           # This file, including setup spec. and breakdown
└── __tests__           # Tests should go in this folder
```