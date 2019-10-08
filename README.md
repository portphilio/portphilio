# Portphilio&mdash;Tell YOUR Story

[![Build Status](https://travis-ci.org/portphilio/portphilio.svg?branch=master)](https://travis-ci.org/portphilio/portphilio)
[![Coverage Status](https://coveralls.io/repos/github/portphilio/portphilio/badge.svg?branch=master)](https://coveralls.io/github/portphilio/portphilio?branch=master)
![GitHub](https://img.shields.io/github/license/portphilio/portphilio)

<p align="center"><img src="public/img/icons/android-chrome-192x192.png" alt="Portphilio"></p>

[Portphilio](https://portphil.io) is a free, open-source app designed to allow users to create and curate portfolios of their professional work. The app has been designed with educational contexts in mind, and will allow users of the system to request and receive feedback on entire portfolios, or individual elements within a portfolio, from other members of the community, i.e. peers, mentors, and instructors.

This repository contains the source code for the main Portphilio app. There is another repository that has [the code for the Portphilio API](https://github.com/portphilio/portphilio_api). If you want to set up your own instance, you will need the code in both repositories. Below are instructions for how to set up a local development version of the main app.

## How To Set Up a Dev Environment

If you would like to contribute to Portphilio development, here's how you can get the API up and running locally. To get the front end running locally, **you'll first have to [install and set up the back end API](https://github.com/portphilio/portphilio_api)**.

1. Install necessary software (if not already installed when you set up the back end):
    1. [NodeJS](https://nodejs.org/) Please install the v10.x LTS version.
    2. [Git](https://git-scm.com/)
    3. [`mkcert`](https://github.com/FiloSottile/mkcert)
    4. [VSCode](https://code.visualstudio.com/)
2. Clone this repo to your local `dev` folder and install NPM dependencies:

    ```sh
    cd ~/dev
    git clone https://github.com/portphilio/portphilio.git
    cd portphilio
    npm install
    ```

3. Edit your `hosts` file ([here's a tutorial](https://www.howtogeek.com/howto/27350/beginner-geek-how-to-edit-your-hosts-file/)) so you can use a "real" domain name on your dev server. Add the entry `127.0.0.1 portphilio.test`
4. Install a local SSL certificate in the root `portphilio` directory (command with example output)

    ```sh
    $ mkcert portphilio.test
    Using the local CA at "/Users/yourusername/Library/Application Support/mkcert" ✨

    Created a new certificate valid for the following names 📜
    - "portphilio.test"

    The certificate is at "./portphilio.test.pem" and the key at "./portphilio.test-key.pem" ✅
    ```

5. Copy the `.env` and `.env.local` files that are in the `protected` directory of [our shared Google Drive folder](https://drive.google.com/open?id=1MIBtHlkTsv0v1Wsjl4I66Euu8nhBhUkB) into the root directory of the project. If you don't have access to the `protected` folder, please contact Morgan.
6. Run `npm install` from the root of the project in your terminal to install all of the dependencies.
7. Start up the API from a **different** window/tab in your terminal with the command `npm run dev:ngrok`
8. Once the API starts up, copy the URL that looks like `https://a837cf3.ngrok.io` (the random code at the beginning will be different)
9. In the terminal tab/window where you want to run the front end, you'll need to set an environment variable that has the ngrok URL you just copied from the API terminal.

    ```sh
    # on Windows
    > set VUE_APP_API_URL https://a837cf3.ngrok.io
    # on Mac/Linux
    $ VUE_APP_API_URL=https://a837cf3.ngrok.io

10. Start up the front end server by running `npm run serve` from the terminal. The server should be able to read the ngrok URL from the environment variable you set in the previous step, and will allow your app to integrate with Auth0, specifically the account-creation process.

## License

Copyright (c) 2019 Morgan C. Benton

Licensed under the [MIT license](LICENSE).
