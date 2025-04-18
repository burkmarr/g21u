# The record summary panel

[Help index](/help.html?page=index)

<img src="/docs/images/nav-list.png" style="float: right; width: 40px; margin: 10px" />The record summary panel can be reached by tapping the list icon on the bottom navigation bar. The panel lists all the records you currently have within scope (i.e. those that are held in the device's storage as specified in the [options](/help.html?page=options)).

## Record summary display
When a record is newly minted, it looks something like this in the record list:

<img src="/docs/images/record-new.png" style="" />

It has the date & time and the location at which the sound file was created. The location is expressed as an OS grid reference or a latitude and longitude pair depending on your selection in the [options](/help.html?page=options).

When you have edited the record and added a taxon's scientific name, this will also be shown in the record list as shown here:

<img src="/docs/images/record-edited.png" style="" />

When you are managing records (normally on the desktop) and download, share or export a record to CSV, then the record in the record summary list is marked with an icon to show that the operation has been performed on the record. For example, the following record is marked to show that it has been downloaded, shared and exported to CSV. (In reality you are only likely to perform one or two of these operations on any one record.)

<img src="/docs/images/record-metadata.png" style="" />

## Selecting and checking records
When you want to edit a record, e.g. adding a taxon name, you must first indicate in the record list which record you wish to work on. You simply do this by tapping/clicking on the record. The selected record will be highlighted in yellow as shown below. Note that only one record can be selected at once.

<img src="/docs/images/record-selected.png" style="" />

To work with functions on the record list toobar you must first indicate which records you wish to work with by checking (ticking) them. To check a record, just tap/click on the chekbox on the right of the record. To uncheck a record just do the same - checking/unchecking is a toggle action.

<img src="/docs/images/function-check-all.png" style="float: right; width: 40px; margin: 10px" />To check all the records, you can use the *check all* button on the record list toolbar (shown on the right). Sometimes, if you want more records checked than unchecked, it is quicker to check all the records and then individually uncheck the ones you don't want.

<img src="/docs/images/function-uncheck-all.png" style="float: right; width: 40px; margin: 10px" />To uncheck all the records, you can use the *uncheck all* button on the record list toolbar (shown on the right).

## Using function buttons on the record list toolbar
Once records are checked, you can indicate which function you wish to perform on them by using the function buttons on record list toolbar. There are too many functions to display all the function buttons together so they have been grouped into two groups. Only one function button from each group is shown at any one time. The two groups (each with one button shown) are indicated in the image below.

<img src="/docs/images/function-button-groups.png" style="" />

To change the displayed function button in a group, tap/click on the button represented by a yellow circle with downward pointing chevron on the right of the button group. Doing so for the left-hand group will present a function selection menu like that shown below.

<img src="/docs/images/function-button-left-group.png" style="" />

The menu for the right-hand group presents the selection menu shown below.

<img src="/docs/images/function-button-right-group.png" style="" />

To change the displayed (and therefore usable) function button, select the one you want from either of these lists. That will change the button visible on the toolbar and you can then use the function button by tapping/clicking it. The following sections describe the various functions that can be performed.

## Deleting records
To delete checked records, ensure that the delete button is the displayed function button from the first group, then tap/click it. You will be presented with a confirmation dialog like the one shown below.

<img src="/docs/images/record-delete-dialog.png" style="" />

The option to delete rather than archive the record files will only be presented if you have selected the *native file system* storage option in the [options](/help.html?page=options) (which is available on desktop). If you have selected any other storage option (e.g. on mobile), you can't archive the files - they will be deleted from your device.

## Managing record metadata
The text file associated with a record stores information about whether (and when) you have downloaded, shared or exported the record. It records multiple operations of each type (so for example if you have downloaded a record multiple times, they are all recorded). This metadata is responsible for causing the metadata icons to be displayed on a record summary (as described above). On occasion, you may wish to edit this data. For example, perhaps you downloaded the record but then lost or deleted the downloaded files. You will likely want to remove the metadata that says the record was downloaded (so that it is not marked as downloaded in the record summary).

To manage the metadata for checked records, ensure that the manage metadata button is the displayed function button from the first group, then tap/click it. You will be presented with a dialog like the one shown below.

<img src="/docs/images/record-metadata-dialog.png" style="" />

For each of the three types of metadata, indicate whether you want to remove all metadata records, just the last one, or none of them, then tap/click the confirm button.

## Deleting sound files associated with records
Sound files can take up quite a bit of storage on your device, so you may want to delete sound files associated with records once you have added a taxon name to a record. You can do that with this function.

To delete the sound files for checked records, ensure that the delete sound files button is the displayed function button from the first group, then tap/click it. You will be presented with a confirmation dialog like that shown below.

<img src="/docs/images/record-sound-delete-dialog.png" style="" />

The option to delete rather than archive the record files will only be presented if you have selected the *native file system* storage option in the [options](/help.html?page=options) (which is available on desktop). If you have selected any other storage option (e.g. on mobile), you can't archive the files - they will be deleted from your device.

**How I use it...**
In practice I have never found it necessary to use this function. I always process my records and move them into CSVs soon after making them. Then delete (on mobile) or archive (on desktop) the whole record - sound and text file together.

## Copying field values from selected record
Sometimes when working on a batch of records - e.g. those from a day's field recording - it can be useful to update multiple records at once. For example sometimes I have entered a location name for multiple records but then decided to use a different location name instead. Rather than select and edit each record individually, it can be much quicker to edit one record and then propate those changes to the other records.

To do this, first update one record with the field value(s) you want to propagate. Then *select* that record by tapping/clicking on it (it will turn yellow). Then check the records you want to propagate the values to. Ensure that the copy record values button is the displayed function button from the first group, then tap/click it. You will see a dialog like that shown below.

<img src="/docs/images/record-copy-field-values-dialog.png" style="" />

The record you selected will be shown at the top of the dialog. Next check all the fields whose value you wish to progagate from this record to all the records you previously checked. Then confirm the dialog.

## Downloading records
To download the files for checked records (sound files and record details text files), ensure that the download button is the displayed function button from the second group, then tap/click it. What happens then depends partly on your platform (e.g. Windows, Android or iOS) and on whether or not you have chosen to zip downloaded records in the [options](/help.html?page=options).

If the *zip downloaded records* option is not set, the individual text and sound files associated with each checked record are downloaded to accessible storage on your device (e.g. the downloads folder on Android). Your platform may ask you to accept the download - either all of them or individually. If the *zip downloaded records* option is set - which is recommended - the text and sound files are first used to create a single zip file which is then downloaded to accessible storage on your device.

**How I use it...** See the section *Transferring records between mobile and desktop in practice* below.

## Sharing records
To share (transfer) the files for checked records (sound files and record details text files), ensure that the share button is the displayed function button from the second group, then tap/click it. What happens then depends partly on your platform (e.g. Windows, Android or iOS). Your platform will likely ask you to select a method/location to share files.

Unfortunately most browsers, e.g. Chrome, impose a limit on the number of files that can be shared in one go which limits the usefulness of this method of transferring records. On Chrome the limit is 10 files at once which normally limits you to 5 records (one sound file and one text details file for each record).

**How I use it...** See the section *Transferring records between mobile and desktop in practice* below.

## Exporting records to CSV files
To export checked records to a CSV file, ensure that the CSV button is the displayed function button from the second group, then tap/click it. A new CSV file will be created in the location indicated by your storage settings in [options](/help.html?page=options).

**How I use it...** I post-process all my records on my desktop after transferring them from my smartphone (see next section) and I have set *Native file system* in my options and specified a folder where I want my CSVs to be created. Therefore I know where to access my CSV files, e.g. for import into iRecord or any checking/tweaking with Excel before importing to iRecord.

## Transferring records between mobile and desktop in practice
On my Android smartphone I always have the *zip downloaded records* option set. After a day's recording in the field, I download all the record files, via a single zipfile, into the *downloads* folder on my phone. From there I use Android's *Files* app to open the download folder, select the zipfile and use that app's share feature to transfer the zipfile to a folder in my cloud storage - Google Drive. I can access that folder from my Desktop, so I go there and unzip the record files into the folder I have specified as the *Main folder* in desktop's g21u app options. Then when I open g21u on my dekstop and go to the records list, they are there ready for processing.

## Technical note
When I encountered the file number limit for sharing files, I had hoped that the zip option would allow the app to first zip them up before sharing. Unfortunately the sharing APIs of many browsers, e.g. Chrome, don't support sharing zip files! My workaround is as described in the preceeding section.