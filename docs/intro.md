

# Gilbert 21 universal (g21u)

[Help index](/help.html?page=index)

## If you used version 1 of g21u...
If you used version 1 of *g21u* (not the Android app), you will notice extra features in version 2. The new features are explained in these help pages, but if you want a quick way of making version 2 look and feel like version 1 for field recording, switch on the *V1 emulation* toggle under *Mode of operation* in the [options](/help.html?page=options).

## Introduction to g21u
Gilbert 21 universal (*g21u*) is a web application. That means you can run it entirely from the browser, just by entering the URL ([https://g21u.netlify.app/](https://g21u.netlify.app/)) in your browser's address bar. No extra software or installation is required. 

However, it is also a *Progressive Web Application* (PWA), which means that on many platforms you can 'install' it. That puts an icon on your home screen just like a conventionally installed app and when started via this icon, it looks bit different than when run in a browser - you don't see the normal browser decorations such as the address bar or navigation buttons - but under the hood it still runs in the browser you installed it from.

Because it is a PWA, it caches all the vital files it needs when you first load it in your browser. Consequently it will run even when you have no WiFi or data connection, so you can use it in the field without the internet. (Some features do require the internet, but these are not those you typically use in the field.)

*g21u* is the successor to two previous aplications - the Gilbert 21 Android app (a 'native' Android app) and the Gilbert 21 desktop application (a VB.net application). *g21u* has all the capabilities of the Gilbert 21 Android app for making records via georeferenced voice recordings in the field, but can also run on platforms other than Android, e.g. Apple's iOS. New capabilities of *g21u* enable post-processing of the records using the same software - which previously required the separate Gilbert 21 Desktop application.

Unlike the Gilbert 21 Desktop application which managed its own database of records, *g21u* does not. Instead it is  designed around the paradigm of creating CSVs of records which can be easily imported into other biological recording databases such as [iRecord](https://irecord.org.uk/). So if you are used to used to using the Gilbert 21 Desktop application and you want to switch *g21u* for post-processing your voice recordings, you will need to think about a different way of working.

(Note however that voice recordings made with *g21u* are compatible with the old Gilbert 21 Desktop application just as voice recordings made with the old Android app can be post-processed by *g21u*.)

## WARNING - don't store records on your phone for long
When you store records on your phone you must use either the *IndexedDB* or *Object private file system (OPFS)* (see [options](/help.html?page=options) for details). Whilst both of these options give reasonably persistent storage, they can be cleared under certain conditions, notably:

1. **Automatic Storage Eviction**: If your phone runs low on memory, the browser can automatically "evict" (delete) your a web app's data to free up resources. g21u is a web app and so is at risk from automatic storage eviction. It typically clears data from the least recently used websites and web apps first. *This should not be a risk to you unless your device runs critically low on memory.*

2. **Manual User Action**: Clearing "Cookies and other site data" in browser settings will delete all IndexedDB databases and OPFS files for that web site or web app. So don't do this for the g21u app, unless you have already exported your data. *This is not a risk unless you proactively delete your site's data.*

To minimise the risk of losing records, you are advised to build the practice of exporting your records and transferring them to a PC (where you can process them) into your workflow on a regular, e.g. daily, basis.

## Issues
If you use this app and find any problems or want to share information that may help other users use it on particular devices, browsers or operating systems, please use the [GitHub Issues](https://github.com/burkmarr/g21u/issues) associated with this repository and open a new issue. (You need a free GitHub account to do that.)
