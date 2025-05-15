# Running & installing *g21u*

[Help index](/help.html?page=index)

As described in the [introduction](/help.html?page=intro), *g21u* can either be used directly in the browser (like any web app) or 'installed' to you device. Methods for installation depend on the browser you are using and your platform. Some general instructions are given below and then follow some notes from my own experience of installing on various platforms. 

For the best results, I recommend using the Google Chrome browser regardless of your platform/device. *g21u* has been most thoroughly tested on Google Chrome on an Android phone and Google Chrome on a Windows laptop.

Many of the web technologies that drive this app (e.g. reading from and writing to the native file system) are relatively new and not all browsers support all features fully. Where I know of problems with any particular browsers or platforms I mention them in the help.

## General instructions for installation and use
To install this app, open the browser on your device when you have an internet connection and navigate to this URL: [https://g21u.netlify.app/](https://g21u.netlify.app/).

*g21u* will cache all of the resources it needs to run offiline when you first open it. So, from this point on, you will be able to use it in the field even when you have no internet connection just by navigating to the URL again in your browser. 

But, as previously explained, you can also install the *g21u* so that it looks a feels more like a native app. Look at the following sections for help on how to do that.

Regardless of whether *g21u* is run from a browser URL or as an installed app, you will need to grant certain permissions that the app needs to run, e.g. access to the device's location services (GPS) and to the microphone. Again the steps for providing such permissions vary between browsers and platforms.

## Notes on installing on Android with Chrome
If you are using Chrome on Android, once you have browsed to *g21u*, click the three dots in the top right of the browser and look for the *Add to home screen* link. When you click that, you should see a dialog which offers you the option to confirm or cancel the installation. Click the *Install* link to confirm the installation.

(Note that the precise steps may vary from the above description depending on your platform and browser versions.)

Now you should find a link on your homescreen from which you can run the app. When prompted, you should give the app permission to use your device's microphone and location services.

## Notes on installing on iOS with Chrome
If you are using Chrome on iOS, once you have browsed to *g21u* tap the *Share* icon (usually located in the top right corner) and select *Add to Home Screen*. Confirm the app name and tap *Add* to complete the installation. 

(Note that the precise steps may vary from the above description depending on your platform and browser versions.)

To give *g21u* permission to use location services and the microphone, you may need to go to *Settings > Privacy & Security > Microphone* and *Settings > Privacy & Security > Location Services* and give the app, or the browser you used to install it, permission. It is best to select *while using the app* when prompted.

I have found that browsers on iOS repeatedly ask for permission to use the microphone whenever the recording page is navigated to and the microphone used for the first time. (On Android you only need to give permission once and it is remembered.)

Note that my own experience with installing g21u on (my wife's) iPhone is that the default option to use the *Private origin file system* for storage does not work correctly. However the *IndexedDB* option works perfectly well. There is no particular advantage of using one of these storage methods over the other. For more information on setting the storage option, see the [help page for options](/help.html?page=options).

## Notes installing on Windows with Chrome
If you are using Chrome on Windows, once you have browsed to *g21u*, look for the *Install Gilbert 21 v2* icon on the right of the browser's address bar. <img src="/docs/images/windows-install.png" style="float: right" />When you click that, you should see a dialog which offers you the option to confirm or cancel the installation. Click the *Install* link to confirm the installation.

(Note that the precise steps may vary from the above description depending on your platform and browser versions.)

An icon will be added to your homescreen and, optionally, you can elect to have it pinned to your taskbar too. 

In practice many people installing on Windows will do so to post-process records, but if you are going to use a Windows installation to make records, then when prompted, you should give the app permission to use your device's microphone and location services.

