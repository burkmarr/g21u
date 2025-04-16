# The options screen

[Help index](/help.html?page=index)

<img src="/docs/images/nav-options.png" style="float: right; width: 40px; margin: 10px" />The options screen can be reached by tapping the small gear icon on the bottom navigation bar. The options are described below.

## Mode of operation
### V1 emulation
If you used the first release of *g21u*, you will notice some additional navigation buttons (and associated screens) on version two. These needn't change the way you use the app in the field, but if you want the familiar simpler look and feel of version 1 for using in the field, then set this option toggle on.

## File and geolocation handling
### Geolocation format
This option determines two things:
1. The naming convention used for sound files.
2. The spatial referencing system used to display locations.

If you choose *OSGR*, the app will use OS grid references both to record and display locations and to name sound (WAV) files. If you choose *Lat/lon*, the app will use WGS84 latitude and longitude record and display locations and to name sound files.

You can use the *Lat/lon* option to make records anywhere in the world (including Great Britain), but you should only use the *OSGR* option when you are recording in Great Britain. Note however that in Great Britain, you can record sound files using one option and then change to another to process them.

(Both formats are compatible with Gilbert 21 desktop should you still be using that.)

### Default grid ref precision
When sound files are recorded, they are named using a convention which retains maximal location precision (whether using the *OSGR* or *Lat/lon* spatial referencing). If you are using OS grid references to display and record locations, you can use this option to choose the default precision to use to make your records. Whatever option you choose, you can always change the precision of an individual record when editing it.

### Zip downloaded records
Set this option toggle on to zip record files (WAV files and associated record detail text files) together into a single file when downloading records. This is generally much more convenient than downloading individual files. It provides a convenient first step to sharing multiple records (e.g. when sending them to cloud storage to facilitate post-processing of records). There are browser limits on sharing multiple files (records) using *g21u*'s share feature and it is usually more convenient to download a zipped file of multiple records and then share this with cloud storage, e.g. by using the share feature of Andriod's *File* app.

### Reverse sort order
By default, *g21u* lists records from newest to oldest. This is the most convenient order when in the field since when you view the record list screen in the field, you really want your most recent record to appear at the top of the list. But when post-processing records back at home, e.g. on your laptop, you normally what to work through records in the order that they were created - i.e. from oldest to newest. So you can set this option toggle to on in order to reverse the sort order.

### Select first record
By default, *g21u* reselects the previously selected record when you switch to the record list pane or, if this is not available, the first record with no scientific name is selected. That's useful behaviour when post-processing records, but not always so good in the field when you normally always want the last record made (first in list when the *Reverse sort order* option is not set) to be selected (and therefore visible). 

**How I use it...**
On my phone, for field recording, I have the *Reverse sort order* option off and the *Select first record* option on. On my laptop, for post-processing, I have the I have the *Reverse sort order* option on and the *Select first record* option off.

### Storage
This option determines how recorded WAV files and CSV files of records are stored on your device. 

If set to *Private origin file system*, created files are stored in a file system on your device that is visible only to the browser running to *g21u* app. If set to *IndexedDB*, created files are stored in a special database on your device that is visible only to the browser running to *g21u* app. You should use one or other of these options when running *g21u* on a mobile device for field recording. Which option you choose shouldn't much matter - you will not notice any difference between them. Note that the *private origin file system* has not worked properly on iPhone when I've tested it (the files are created in the file system but they are zero bytes), so on iPhone you may need to use the *IndexedDB* option.

The *Native file system* option is only available to browsers running on a laptop or desktop (and I have only tested it on Windows), so you cannot use this option on a phone. The advantage of using this option on a laptop (or desktop) computer for post-processing records is that you can see all the files (e.g. sound WAV file & their associated record text files and consolidated record CSV files) using your operating system's normal file handling tools. So, for example, you can move files around, view/edit CSV files with Excel and, most importantly, select CSV files for uploading to other systems such as iRecord.

The *Immediate download* option is only really useful on mobile devices that, for some reason, cannot use either the *Private origin file system* or *IndexedDB* options. With this option, files are downloaded to your device from the browser immediately on creation. In Chrome on Android this happens immediately but on iOS you will likely be presented with a download dialog.

### Main folder
When using the *Native file system* storage option, you need to indicate a folder on your file system where record files (WAV files and associated detail text files) are stored. Use the browse button under this option to set the folder. You will be prompted to allow your browser to read and edit files in this folder.

### CSV folder
When using the *Native file system* storage option, you need to indicate a folder on your file system where CSV files of completed records are stored. Use the browse button under this option to set the folder. You will be prompted to allow your browser to read and edit files in this folder.

### Archive folder
When using the *Native file system* storage option, you can indicate a folder on your file system where 'deleted' sound and CSV files are archived to (rather than actually be deleted). It's useful to use this option as a safety net so that if you accidentally delete sound or CSV files, they can be recovered. Use the browse button under this option to set the folder. You will be prompted to allow your browser to read and edit files in this folder.

## Sound
### Automatic playback
If this toggle is on, a recording is played back immediately upon completion. This can help you judge, in the field, if a recording has been successful, e.g. in windy conditions.

### Playback volume
This indicates the volume that recordings should be played back at. (The actual volume may also depend on the overall volume you have your phone set to.) 

### Sounds signal volume
This indicates the volume used for sounds signals which are emitted, for example, when you start and end (or delete) a recording on the recording screen. For no sound, turn this right down.

## Mapping options
### OS API key
When viewing or editing a record on *g21u* you can view its location on a map. There are several default mapping options provided:
- Open Street Map
- Stadia Alidade Satellite
- Esri World Imagery
All of these options are available without a license key.

The Ordnance Survey also have a set of freely available maps via their [OS maps API](https://docs.os.uk/more-than-maps/tutorials/geodataviz/how-to-use-the-os-maps-api), but to use those you will need to sign up for an Ordnance Survey Data Hub account, create a project and add an 'OS maps API' key to it. Once you have done that, copy your key and paste it into this option. Then the folliwing maps will become available in *g21u*:
- OS Outdoors
- OS Road
- OS Light

## Record options
### Default recorder
You can use this option to specify that your name is to be used to automatically populate the 'Recorder' field on the record details screen.

### Default determiner
You can use this option to specify that your name is to be used to automatically populate the 'Determiner' field on the record details screen. (The 'determiner' is the person that identified the recorded organism.)

## Record fields
You can determine which fields (from those provided) are to be included with the records you make. Note that the available fields are based on those available when importing into the generic *iRecord Import* dataset on the *iRecord* platform, but many of them will be generally applicable to many recording platforms. 

Some of the fields cannot be unselected - they are mandatory. Descriptions and details about each field is provided on the options page and is not repeated here.


