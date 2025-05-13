# CSV file management panel

[Help index](/help.html?page=index)

<img src="/docs/images/nav-csv.png" style="float: right; width: 40px; margin: 10px" />The CSV file management panel can be reached by tapping the CSV icon on the bottom navigation bar. On desktop the display is split into three panels: on the left is the CSV list panel showing all the CSVs you have within scope (i.e. those that are held in the device's storage as specified in the [options](/help.html?page=options)), in the middle are brief summary details for each record in the selected CSV (selected by clicking/tapping on its name in the CSV list panel) and on the right are full record details for any record you have selected in the CSV summary details (selected by clicking/tapping on the record). On moble, only the CSV list panel is available. It is anticipated that most people will want to manage CSVs using this facility on a desktop machine.

The CSV management is designed for three things:
- moving CSVs around (by sharing or downloading them);
- combining two or more CSVs into a single CSV; and 
- deleting CSVs.

Above the CSV list is a toolbar that you use to perform these functions (shown below).

<img src="/docs/images/nav-csv-toolbar.png" />

It is *not* a tool for editing individual CSVs or the records within them. To do that, use dedicated tools such as Microsoft Excel with your CSVs.

## Checking CSVs
To work with functions on the CSV list toobar you must first indicate which CSVs you wish to work with by checking (ticking) them. To check a CSV, just tap/click on the chekbox on the right of the CSV name. To uncheck a CSV just do the same - checking/unchecking is a toggle action.

<img src="/docs/images/function-check-all.png" style="float: right; width: 40px; margin: 10px" />To check all the CSVs, you can use the *check all* button on the CSV list toolbar (shown on the right).

<img src="/docs/images/function-uncheck-all.png" style="float: right; width: 40px; margin: 10px" />To uncheck all the CSVs, you can use the *uncheck all* button on the CSV list toolbar (shown on the right).

## Deleting CSVs
To delete checked CSVs tap/click the delete button. You will be presented with a confirmation dialog like the one shown below.

<img src="/docs/images/csv-delete-dialog.png" style="" />

The option to delete rather than archive the record files will only be presented if you have selected the *native file system* storage option in the [options](/help.html?page=options) (which is available on desktop). If you have selected any other storage option (e.g. on mobile), you can't archive the files - they will be deleted from your device.

## Sharing CSVs
To share (transfer) checked CSVs, tap/click the share button. What happens then depends partly on your platform (e.g. Windows, Android or iOS). Your platform will likely ask you to select a method/location to share the CSV files.

Note that most browsers, e.g. Chrome, impose a limit on the number of files that can be shared in one go. On Chrome the limit is 10 files at once.

## Downloading CSVs
To download checked CSVs tap/click the download button. What happens then depends partly on your platform (e.g. Windows, Android or iOS). Each checked CSV file is downloaded to accessible storage on your device (e.g. the downloads folder on Android). Your platform may ask you to accept the download - either all of them or individually.

## Merging CSVs
<img src="/docs/images/nav-merge.png" style="float: right; width: 40px; margin: 10px" />You may find that you would like to merge several CSVs into a single CSV, e.g. for upload into an external recording platform. To do that, check the CSV files you wish to merge and then click the merge button. You will be presented with a dialog similar to that shown below.

<img src="/docs/images/csv-merge-dialog.png" style="" />

This dialog allows you to set the name of the new merged file. You can choose for the app to auto-generate a new name (which is based on the date and time of the merge) or to use one of the existing names of the files being merged. For the latter, select the name you want to use from the drop-down list in the dialog.

Note that when you merge CSVs, the source CSVs are automatically deleted. (Of course if you reuse one of the existing CSV file names, that doesn't disappear.)

**How I use it...**<br/>
Because I only create and manage CSV files using the app on my desktop and using the *native file system* storage [option](/help.html?page=options), my CSV files are created in a folder on my dekstop where I can easily access them using standard Windows tools for managing files. I have never needed to use the share or download functions for CSV files. However, I do use the merge CSV functionality very often.

I normally process all the records from a day's recording as soon as I can after spending time in the field and export these to a CSV file. However, I tend to upload records to the iRecord platform from a CSV once a month. So I keep a CSV on the go named for the current month/year and after I create a new CSV for a day's recording, I merge that and the monthly CSV, keeping the name of the monthly CSV.

Once I have uploaded to iRecord, I use the app's function to delete the file, but because I have the *archive* folder [option](/help.html?page=options) set, it is actually archived to the folder I have specified, rather than deleted.

## Changing the name of a CSV file
Although you can't specify a name of your own during a merge operation, you can change the name of an existing CSV file by selecting it in the CSV list, changing its name in the editable box at the top of the *CSV details* pane (middle pane on desktop displays) and finally clicking the *Rename* button. Note that this functionality is only available when using the app on desktop.



