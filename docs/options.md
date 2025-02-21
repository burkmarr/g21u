# The options screen
The options screen can be reached by tapping the small gear icon on the bottom navigation bar. The options are described below.

## Filename format
You can select either of these two values:
- OSGR
- Lat/lon

The former uses an OS grid reference in the name of the WAV file and the latter uses the lat/lon in the filename. Both are compatible with Gilbert 21 desktop.

## Automatic playback
If this toggle is on, a recording is played back immediately upon completion. (On iPhone the playback may occur after you've dealt with a download dialog if you have the 'immediate download' storage option set -see below.) This can help you judge, in the field, if a recording has been successful, e.g. in windy conditions.

## Playback volume
This indicates the volume that recordings should be played back at. (The actual volume may also depend on the overall volume you have your phone set to.) 

## Sounds signal volume
This indicates the volume used for sounds signals which are emitted, for example, when you start and end (or delete) a recording on the recording screen. For no sound, turn this right down.

## Storage
This option determines how recorded WAV files are handled. 

If set to *private origin file system*, created files are stored in a file system on your device that is visible only to the G21 app (you won't be able to find the files with a file browser). The advantage of doing this is that you can use the *manage recordings* screen to review, playback and, if necessary, delete recordings. (You will also be able to export and download the files from there - see below for further details.)

Unfortunately the *private origin file system* has not worked properly on iPhone when I've tested it (the files are created in the file system but they are zero bytes). Until a fix for this can be found, you will need to use the next option if you are using iPhone.

If set to *immediate download*, files are downloaded to your device from the browser immediately on creation. In Chrome on Android this happens immediately but on iOS you will likely be presented with a download dialog.

If you use the *immediate download* option, you will need to devise a workflow for moving your WAV files to where you want them, e.g. by using a file manager that allows you to share them, e.g. by email or by sending to cloud storage such as Google Drive.

