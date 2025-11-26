# Record details input panel

[Help index](/help.html?page=index)

<img src="/docs/images/nav-list.png" style="float: right; width: 40px; margin: 10px" />On desktop, the record details input panel is found to the right of the record summary panel which is reached by tapping the list icon on the bottom navigation bar (and shown on the right). The record details input panel shows the details for the record currently selected in the record summary panel (i.e. the one highlighted in yellow).

<img src="/docs/images/nav-edit.png" style="float: right; width: 40px; margin: 10px" /><img src="/docs/images/nav-details.png" style="float: right; width: 40px; margin: 10px" />On mobile, the record details page can be reached by tapping the on the navigation button shown on the near right. The record details input panel is then displayed by checking on the edit button shown on the far right.

## Field types
What fields appear in the record details panel depends, in part, on what fields you've selected in the [options](/help.html?page=options). Looks at the options help page for descriptions of the fields. There are three types of input field:

- date, e.g. *Record date*,
- free text, e.g. *Quantity*,
- free text combined with a filtered selectable list ('combo box') e.g. *Stage* and *Scientific name*, and
- free text area, e.g. *Comment*.

The only type of record field which imposes an input standard is *date*. This will allow you to enter an invalid date. Everything else is some sort of *free text* meaning that it will allow you to enter what you want (even if it provides suggestions). That is true even of fields like *Grid reference* - so be aware that it is possible for you to enter invalid values, e.g. grid references, so some care is required.

## Entering record field values
The *Recorder* and *Determiner* fields are free text. Since the value of both these fields is likely to be your own name, you can specify defaults for these fields in the [options](/help.html?page=options) and you will not normally need to change them.

The *Date* field provides access to your device/browser's calendar control so you can set a date using familar methods. The initial date value is the date on which the voice recording associated with the record was made, so usually you will not need to change it.

To use any of the fields that provide a filtered selectable list, start typing a value and a selectable list will appear below the input control with values that match, in part, the value you have typed. When you see the value you want in the list, you can tap/click on it or, on desktop, use the *Tab* or *Arrow down*/*Arrow up* keys to navigate to the value before pressing the *Enter* key to select it. (Note that using *Tab* and *Shift* together is like using the *Arrow up* key.) You can also type a value that is not in the list if you want - but be careful that you do not transgress any rules of the system you will eventually import to if you do this.

The *Scientific name* and *Common name* fields are a special case of the filtered selectable list type - they are linked together and the values in their filterable lists are generated on the fly using the NBN's species search API. If you start typing a scientific name and select an item from the list that has both a common name and scientific name shown, then both the *Scientific name* and *Common name* fields are populated with values. If you start typing in the *Common name* field and select a value, both the *Scientific name* and *Common name* fields are populated (because a common name *always* has a scientific name associated with it). It doesn't matter whether you use the *Scientific name* or *Common name* field to select a taxon - the *Scientific name* field is always populated with a taxon name. The *Common name* field is really there as a data entry convenience - you will normally only import the scientific name to an external system such as iRecord. Note that either field will allow you to search on *both* scientific and common names.

Some of the fields that provide a filtered selectable list also have a default value provided, e.g. *Stage* has the value *not recorded* as it's default. In order to see the list values for these fields, you will need to delete all or part of the default value. A relatively quick way to do that on desktop is to highlight the whole field by pressing the *Ctrl* and *A* keys together and then hitting your *Backspace* or *Delete* key.

The *Grid reference* field (and *Latitude*/*Longitude* fields) are, of course, is pre-set to the value retreived from your devices GPS when you made the record. For grid references, the precision used (e.g. 8 figure or 6 figure) depends upon your [options](/help.html?page=options). Quite commonly you will want to change the grid reference in your record details panel, e.g. to change from the default precision you have specified in the options or to refine the location. You can, of course, edit these values directly in the record details input panel, but more usually you will do it indirectly through the [location details panel](/help.html?page=location).

A note on the *Location name* field: if you used the old Gilbert 21 Desktop application, you will be used to the application suggesting location names based on import CSV gazetteer files from the OS. This function is not present in the g21u web app for technical reasons  - instead you have to enter a location name yourself. In actual fact, I feel that this is a good thing since the temptation to accept the proposed location names (in the interest of rapid processing) could result in some confusing and innapropriate location names against records with the old software. Several features (described below and on other help pages) have been added to g21u to make discovering and entering location names easier.

As the value of any field changes from that already saved against the record, the background colour of the field changes from green to orange. That's a useful visual indication that you have pending edits.

## Saving changes and moving to another record
To save the changes you have made to a record, tap/click the *Save* button at the bottom of the input panel. You will see any fields with pending edits, and hence a background colour of orange, change to a background colour of green. That indicates that your edits have been saved. To cancel all pending edits, tap/click the *Cancel* button - the values will revert to those previously saved and and the background colour of all fields will be green.

You can tap/click on any record in the record list to select it an make it the current record in the record details input panel. You can also use the *Next* and *Previous* buttons at the bottom of the input panel to quickly move to the next or previous record. If you try to navigate away from the currently selected record without saving or cancelling pending edits you will be prompted to first do so.

## Speed techniques and shortcuts
In the interests of making record processing as fast as possible, some navigation and entry shortcuts have been provided to make it possible to process records on the desktop using the keyboard only (having to use the mouse too often slows things down considerably).

<img src="/docs/images/record-details-playback.png" style="float: right; width: 40px; margin: 10px" />When you first select a record in g21u on desktop, the input focus is on that record. If you then hit the *Enter* key the input focus shifts to the green playback button at the top of the record details input panel. Then you can just press the *Enter* key and the playback starts.

The *Tab* key works much as is does on any other web application - it moves the input focus to the next control on the page. Likewise pressing *Shift* and *Tab* together moves the input focus to the previous control. But very often you would prefer to skip over fields that already have values (e.g. the *Recorder*, *Determiner* and *Date* fields). To this end, pressing the *Enter* key in g21u also moves the focus to the next empty intput field, e.g. *Scientific name*, skipping any fields that already have a value unless that fields value is the default value from a selection list, e.g. *Stage* with a value of *not recorded*. In the latter case, the input focus moves to the field and the default value is highlighted for you so you only need press the *Backspace* or *Delete* key to remove it. Alternatively press *Enter* again to move to the next field, keeping the default value.

Hitting the *Enter* key when the focus is on the green playback button at the top of the record details input panel initiates playback (as previously described), but also moves the input focus to the next unset field. When you are on the last field (usually *Comment*), hitting the *Enter* key moves the focus to the *Save* button. When you hit the *Enter* key on the *Save* button, the record is saved and the focus is moved to the *Next* button.

There is another time saving feature when you press the *Enter* and *Shift* keys together with the focus in an input field. When you do this, the value of the field is set to the value of the same field for the previous record in the record list. This is useful for a number of fields but particularly for *Location name*. If you are processing a bunch of records from a single named location, you only need to type the location name for the first record and then for subsequent records at the same location you can just hold *Shift* down when you press *Enter* and the same location name will automatically be entered.

**How I use it...**<br/>
The screen below shows a typical newly minted record selected and displayed in the record details input panel on my desktop computer. 

<img src="/docs/images/details-panels-desktop-input.png" style="width:100%" />

The first record in the record list is selected. This is how I would proceed:

- I hit the *Enter* key to move the focus to the green playback button in the record details panel.
- I hit the *Enter* key again to initiates playback move the focus to the next empty field which in this case is *Scientific name*
- I listen to the recording to find which taxa was recorded.
- I then either start typing the scientific name, or if I want to type the common name, I first press *Enter* to move to the *Common name* field to move the focus to that field first and then I start typing.
- When I see the taxon I want, in either the *Scientific name* or *Common name* lists, I hit the *Tab* key the required number of times to move the focus to the list element I want.
- I hit *Enter* to select the taxon. (Note that whether I enter via common name or sicentific name, both fields are populated when I select from the list - assuming a common name is available).
- I hit *Enter* again to select the next empty field - or selectable field with a default value, which in my case will be *Stage* field which will be automatically highlighted.
- If I want to change the value:
  - I hit the *Backspace* key to delete the current value and display the list of possible values.
  - If I don't see the value I want straight away, I start typing it to filter the list.
  - When I see the value I want I use *Tab* to shift the focus to it.
  - I hit *Enter* to select it.
- If I want to keep the default value:
  - I just hit *Enter* to move to the next field.
- I proceed as above for the remaining fields.
- When I reach the last field - in my case the *Comment* field, I enter a value (if required) and then hit the *Enter* key which moves the input focus to the *Save* button.
- I hit *Enter* again which saves the record and moves the input focus to the *Next* button.
- I hit *Enter* again to select the next record in the record list.
- I hit *Enter* again to move the focus to the green playback button in the record details panel and start again with the next record.

You can see that I haven't used the mouse once during that process. Of course that is the simplest scenario. If I need to modify things like the date or grid reference, I will usually use the mouse.

For the second and subsequent records, if the desired value for any field with the input focus is the same as the previous record, I will use the *Shift* *Enter* combination to quickly set it to the same value and move the focus to the next field.

## Voice recordings with multiple taxa
<img src="/docs/images/duplicate-button.png" style="float: right; height: 40px; margin: 10px" />Sometimes in the field, you may reel off a list of species as you make a record. Obviously when processing the records (typically back at home on the desktop), you need to covert that list from a single voice recording into multiple records. The *Duplicate* button helps you to do that.

When you listen to a playback and it lists multiple taxa, process the record as usual for the first taxon and then tap/click on the *Duplicate* button. That copies the voice recording to create a new record. Note that it also copies the value of *Location name* and *Comment* fields since these will often eed to be the same. You can then process that one in the normal way but specifying the next taxon in the list.

You can also duplicate a record by holding down the *Shift* key as you tap/click the *Duplicate* button. In this case *all* the record values, except *Scientific name* and *Common name* are copied to the new record.

<img src="/docs/images/pause-button.png" style="float: right; height: 40px; margin: 10px" />Sometimes when you have made a long list, if your memory is anything like mine you need to replay the recording again and again to create records for all the taxa. If it's a long recording that can get tedious. To help with this, the *Pause* button allows you to pause the playback after each named taxon.

<img src="/docs/images/resume-button.png" style="float: right; height: 40px; margin: 10px" />To use the *Pause* button, start the playback and after the first taxon tap/click it. (Notice that the text 'Pause' on the button has now changed to 'Resume'.) Fill in the record details and save the record. Then tap/click the *Duplicate* button. A new record is created *with the playback paused at the same point*. So now you can click on the *Resume* button to hear the next taxon then hit *Pause* again, and so on.

## Adding customised taxon lists
For some recorders, e.g. specialist invertebrate, fungi or lichen recorders, the taxonomy available via the NBN's species search API might not include the taxa they want to record. In such cases you can always directly type in the name you need, but this could be tedious and error prone if you have to do it very often.

For these recorders, there is a facility to add custom taxa to those presented by the NBN's service. You can only do this on desktop and if you have specified the *Native file system* storage option.

Create a file called *custom-taxa.csv* in the folder specified for *CSV folder* in your [options](/help.html?page=options) (or the *Main folder* if you haven't set the *CSV folder*). It should have two columns with the headers *scientific* and *common*. Then just list the taxa in the rows under this (a common name is optional). If this file exists, it will be picked up by the app and the entries that match the current filter you have typed will appear first in the filtered list - before any presented by the NBN (though they will look the same).

## Adding commonly used location names
If there are locations that you visit frequently, you can save time when processing records by creating your own custom location filterable list. You can only do this on desktop and if you have specified the *Native file system* storage option.

Create a file called *custom-locations.csv* in the folder specified for *CSV folder* in your [options](/help.html?page=options) (or the *Main folder* if you haven't set the *CSV folder*). It should have just one column with the header *name*. Then on each subsequent row list the location names that you wish to include in a filterable list that will appear when you enter data in the *Location name* field.

## Adding input shortcuts
You may often find that you need to enter similar values for a number of records. For example, if you record territorial birds singing you may often want to set the following values:
- Breeding evidence (birds) - *02: Singing male (S)*
- Stage - *Adult*
- Sex - *male*
- Quantity - *1*

Rather than set the four values individually, you can define a shortcut, e.g. *bs*, which when entered into a particular field will set all of the values automatically. You can only do this on desktop and if you have specified the *Native file system* storage option.

Create a file called *custom-input.csv* in the folder specified for *CSV folder* in your [options](/help.html?page=options) (or the *Main folder* if you haven't set the *CSV folder*). It should have four columns with the headers *colin*, *valin*, *colout*, *valout*. The column *colin* represents the ID of the field you will type your short-cut code into and the column *valin* represents the short-cut code itself. You can get the field IDs for the *colin* column (and *colout* column) by looking at the record field on the [options](/help.html?page=options) page - the *jsonId* values you want are specified at the end of the description of each field.

The column *colout* represents the ID of a field where you want a value to be entered in response to your short-cut code, and the column *valout* represents the value you wish to be entered there.

For the singing bird example outlined above, your CSV file would look something like this:
<pre>
colin,valin,colout,valout
birdbreed,bs,birdbreed,02: Singing male (S)
birdbreed,bs,stage,Adult
birdbreed,bs,sex,male
birdbreed,bs,quantity,1
</pre>

To use this short-cut you would type *bs* into the *Breeding evidence (birds)* column and when you hit enter, the four required field values would be entered automatically.

You can define as many shortcut codes as you like in the file.

## Core short-cuts
There is a short-cut defined in the software itself. It allows you to reset either the grid reference or lat/long fields to their original values if you have changed them. To use it, enter *orig* into either the *Grid reference* or *Latitude* fields.