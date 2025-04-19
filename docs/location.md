# Location details panel

[Help index](/help.html?page=index)

<img src="/docs/images/nav-mapping.png" style="float: right; width: 40px; margin: 10px" /><img src="/docs/images/nav-list.png" style="float: right; width: 40px; margin: 10px" />On desktop, the location details panel is one of three selectable panels found to the right of the record details input panel which is reached by tapping the list icon on the bottom navigation bar (shown on the near right). If the location details panel is not already displayed, you can display it clicking on the map navigation button (shown on the far right).

<img src="/docs/images/nav-mapping.png" style="float: right; width: 40px; margin: 10px" /><img src="/docs/images/nav-details.png" style="float: right; width: 40px; margin: 10px" />On mobile, the record details page can be reached by tapping the on the navigation button (shown on the near right). The location details panel is then displayed by checking on the map button (shown on the far right).

The record location panel shows the location for the record currently selected in the record summary panel (i.e. the one highlighted in yellow) and allows you to alter the grid reference (or lat/lon) of the selected record.

The g21u app uses [Leaflet technology](https://leafletjs.com/) to display a map showing the location of the currently selected record. At the top right of the map is a layer control which allows you to switch between several different mapping styles (including some satellite imagery layers). See the [options](/help.html?page=options) documentation for details on what layers are available and extra layers that can be made available with a free Ordnance Survey key.

## Using the map to view the location
If you have set the *Geolocation format* to *OSGR* in the [options](/help.html?page=options), you will see a square in the centre of the map representing the grid reference of the currently selected record (it may be small until you zoom in). If you have set the *Geolocation format* to *Lat/lon*, you will see a marker rather than a square.

You can zoom the map by using Leaflet's zoom controls in the top-left corner of the map. If you are on desktop, you can use a mouse wheel to zoom in and out and on mobile you can use the usual pinch and swipe gestures. You can use Leaflet's layer control in the top-right corner of the map to switch between different map layers.

## Using the map to modify the record location
This feature is slightly different depending on whether you have the *Geolocation format* to *OSGR* or *Lat/lon* in your [options](/help.html?page=options), so these are described separately below.

### Modify the grid reference
The grid reference can be modified in two different ways:
1. You can alter the precision of the grid reference.
2. You can change the grid reference completely.

Underneath the map you will see the current grid reference of the record. To keep this location but change the precision, use the drop-down to the right of it to select the required precision that will update the current grid reference square (in red) that appears on the map. To update the currently selected record with the new grid reference reflecting the changed precision, tap/click the *Use* button. That will update the grid reference on the [record details input panel](/help.html?page=record-details) (but not save the record).

If you click on a new location on the map you will see the clicked grid reference appear (underneath the current grid reference) and the grid reference square will also be drawn (in blue) on the map. You can change the precision of this clicked grid reference by using the precision drop-down list to the right of it. To use the new grid reference (and precision) for the current record, tap/click the *Use* button. That will update the grid reference on the [record details input panel](/help.html?page=record-details) (but not save the record).

### Modify the latitude & longitude
If you tap/click on the map you will see the latitude & longitude at your the clicked location appear under the map. If you tap/click the *Use* button next to the new location the [record details input panel](/help.html?page=record-details) will be updated with the new latitude and longitude (the changed record will not be saved).

### Don't forget to save the changed grid ref or lat/lon!
As indicated above, the *Use* button updates the value in the *Grid reference* field (or *Latitude* and *Longitude* fields) on the [record details input panel](/help.html?page=record-details) so that it has pending edits, but these are not saved until you actually click the *Save* button on that panel.

<img src="/docs/images/nav-edit.png" style="float: right; width: 40px; margin: 10px" />This is pretty obvious when you are using the desktop, but it is not so obvious if you are doing this with mobile. In the latter case, after tapping the *Use* button you will need click on the edit navigation button (shown on the right) to move to the [record details input panel](/help.html?page=record-details) and then click the *Save* button

## Using the map to help with location names
The map is a useful tool for finding a meaningful location name for your record if you don't know it already. Open Street Map and Ordnance Survey maps often use different names, particularly in rural locations. It can be helpful to know if the recording schemes who will eventually verify your records have any rules or preferences for location names. For example some will prefer those that can be located on Ordnance Survey 1:50,000 or 1:25,000 maps. Those aren't available through g21u, but the Ordnance Survey layers that you can see (if you specify an OS API key in your [options](/help.html?page=options)), are likely to be quite close.

Although not available directly in g21u, it does include a feature than can let you see your record location on OS 1:50,000 and 1:25,000 maps hosted outside the app. The grid references (or lat/lon pairs) displayed below the map are actually links that will take you to a [Bing Maps website](https://www.bing.com/maps) showing OS map layers centred on the location whose link you clicked. Note that this feature only works on a widescreen (desktop) views - it won't work on mobile.

One final feature to help with location names is the use of the [Nominatim reverse geocoding API](https://nominatim.org/release-docs/latest/api/Reverse/). When you click on the map, as well as updating the clicked location grid reference (or lat/lon) underneath the map, g21u also displays the results of a call to the Nominatim API underneath this. Nominatim is built on a gazetteer based on Open Street Mapping. It seems to be most useful in urban areas.

