function ltnSidebarCalendarSelected(tree)
{
   getCompositeCalendar().defaultCalendar = ltnSelectedCalendar();
}

function ltnSelectedCalendar()
{
    var index = document.getElementById("calendarTree").currentIndex;
    return getCalendars()[index]; 
}

function ltnDeleteSelectedCalendar()
{
    ltnRemoveCalendar(ltnSelectedCalendar());
}

function ltnEditSelectedCalendar()
{
    ltnEditCalendarProperties(ltnSelectedCalendar());
}

function today()
{
    var d = Components.classes['@mozilla.org/calendar/datetime;1'].createInstance(Components.interfaces.calIDateTime);
    d.jsDate = new Date();
    return d.getInTimezone(calendarDefaultTimezone());
}

function nextMonth(dt)
{
    var d = new Date(dt);
    d.setDate(1); // make sure we avoid "June 31" when we bump the month

    var mo = d.getMonth();
    if (mo == 11) {
        d.setMonth(0);
        d.setYear(d.getYear() + 1);
    } else {
        d.setMonth(mo + 1);
    }

    return d;
}

var gMiniMonthLoading = false;
function ltnMinimonthPick(minimonth)
{
    if (gMiniMonthLoading)
        return;

    var cdt = new CalDateTime();
    cdt.jsDate = minimonth.value;
    cdt = cdt.getInTimezone(calendarDefaultTimezone());
    cdt.isDate = true;

    if (document.getElementById("displayDeck").selectedPanel != 
        document.getElementById("calendar-view-box")) {
        showCalendarView('month');
    }

    currentView().goToDay(cdt);
}

function ltnOnLoad(event)
{
    gMiniMonthLoading = true;

    var today = new Date();
    var nextmo = nextMonth(today);

    document.getElementById("ltnMinimonth").value = today;

    gMiniMonthLoading = false;

    // nuke the onload, or we get called every time there's
    // any load that occurs
    document.removeEventListener("load", ltnOnLoad, true);

    // Hide the calendar view so it doesn't push the status-bar offscreen
    collapseElement(document.getElementById("calendar-view-box"));

    // Start observing preferences
    var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(Components.interfaces.nsIPrefService);
    var rootPrefBranch = prefService.getBranch("");
    ltnPrefObserver.rootPrefBranch = rootPrefBranch;
    var pb2 = rootPrefBranch.QueryInterface(
        Components.interfaces.nsIPrefBranch2);
    pb2.addObserver("calendar.", ltnPrefObserver, false);
    ltnPrefObserver.observe(null, null, "");

    // fire up the alarm service
    var alarmSvc = Components.classes["@mozilla.org/calendar/alarm-service;1"]
                   .getService(Components.interfaces.calIAlarmService);
    alarmSvc.startup();

    // Add an unload function to the window so we don't leak the pref observer
    document.getElementById("messengerWindow")
            .addEventListener("unload", ltnFinish, false);

    return;
}

function currentView()
{
    var calendarViewBox = document.getElementById("calendar-view-box");
    return calendarViewBox.selectedPanel;
}

function showCalendarView(type)
{
    // If we got this call while a mail-view is being shown, we need to
    // hide all of the mail stuff so we have room to display the calendar
    var calendarViewBox = document.getElementById("calendar-view-box");
    if (calendarViewBox.style.visibility == "collapse") {
        collapseElement(GetMessagePane());
        collapseElement(document.getElementById("threadpane-splitter"));
        var searchBox = findMailSearchBox();
        if (searchBox) {
            collapseElement(searchBox);
        }
        uncollapseElement(calendarViewBox);

        // Thunderbird is smart.  It won't reload the message list if the user
        // clicks the same folder that's already selected.  Therefore, we need
        // to not only remove the tree selection (so clicking triggers an event)
        // but also reset some of TB's internal variables.
        var treeSel = document.getElementById("folderTree").view.selection;
        treeSel.selectEventsSuppressed = true;
        treeSel.clearSelection();
        treeSel.selectEventsSuppressed = false;
        gMsgFolderSelected = null;
        msgWindow.openFolder = null;
    }

    document.getElementById("displayDeck").selectedPanel =  calendarViewBox;
    var calendarViewBox = document.getElementById("calendar-view-box");

    var selectedDay;
    try {
        var selectedDay = calendarViewBox.selectedPanel.selectedDay;
    } catch(ex) {} // This dies if no view has even been chosen this session

    if (!selectedDay)
        selectedDay = today();

    calendarViewBox.selectedPanel = document.getElementById(type+"-view");
    var view = calendarViewBox.selectedPanel;

    if (view.displayCalendar != getCompositeCalendar()) {
        view.displayCalendar = getCompositeCalendar();
        view.controller = ltnCalendarViewController;
    }

    view.goToDay(selectedDay);

    // Set the labels for the context-menu
    var nextCommand = document.getElementById("context_next");
    nextCommand.setAttribute("label", nextCommand.getAttribute("label-"+type));
    var previousCommand = document.getElementById("context_previous")
    previousCommand.setAttribute("label", previousCommand.getAttribute("label-"+type));
}

function goToToday()
{
    // set the current date in the minimonth control;
    // note, that the current view in the calendar-view-box is automatically updated
    var currentDay = today();
    document.getElementById("ltnMinimonth").value = currentDay.jsDate;
}

function selectedCalendarPane(event)
{
    var deck = document.getElementById("displayDeck");

    // If we're already showing a calendar view, don't do anything
    if (deck.selectedPanel.id == "calendar-view-box")
        return;

    deck.selectedPanel = document.getElementById("calendar-view-box");

    showCalendarView('week');
}

function LtnObserveDisplayDeckChange(event)
{
    var deck = event.target;

    // Bug 309505: The 'select' event also fires when we change the selected
    // panel of calendar-view-box.  Workaround with this check.
    if (deck.id != "displayDeck") {
        return;
    }

    var id = null;
    try { id = deck.selectedPanel.id } catch (e) { }

    // Now we're switching back to the mail view, so put everything back that
    // we collapsed in showCalendarView()
    if (id != "calendar-view-box") {
        collapseElement(document.getElementById("calendar-view-box"));
        uncollapseElement(GetMessagePane());
        uncollapseElement(document.getElementById("threadpane-splitter"));
        var searchBox = findMailSearchBox();
        if (searchBox) {
            uncollapseElement(searchBox);
        }
    }
}

function ltnPublishCalendar()
{
    publishEntireCalendar(ltnSelectedCalendar());
}

function ltnFinish() {
    var prefService = Components.classes["@mozilla.org/preferences-service;1"]
                            .getService(Components.interfaces.nsIPrefService);
    // Remove the pref observer
    var pb2 = prefService.getBranch("");
    pb2 = pb2.QueryInterface(Components.interfaces.nsIPrefBranch2);
    pb2.removeObserver("calendar.", ltnPrefObserver);
    return;
}

function ltnEditSelectedItem() {
    ltnCalendarViewController.modifyOccurrence(currentView().selectedItem);
}

function ltnDeleteSelectedItem() {
    ltnCalendarViewController.deleteOccurrence(currentView().selectedItem);
}

function ltnCreateEvent() {
    ltnCalendarViewController.createNewEvent(ltnSelectedCalendar());
}

// Preference observer, watches for changes to any 'calendar.' pref
var ltnPrefObserver =
{
   rootPrefBranch: null,
   observe: function(aSubject, aTopic, aPrefName)
   {
   }
}

function onMouseOverItem(event) {
//set the item's context-menu text here
}

// After 1.5 was released, the search box was moved into an optional toolbar
// item, with a different ID.  This function keeps us compatible with both.
function findMailSearchBox() {
    var tb15Box = document.getElementById("searchBox");
    if (tb15Box) {
        return tb15Box;
    }

    var tb2Box = document.getElementById("searchInput");
    if (tb2Box) {
        return tb2Box;
    }

    // In later versions, it's possible that a user removed the search box from
    // the toolbar.
    return null;
}

document.getElementById("displayDeck").
    addEventListener("select", LtnObserveDisplayDeckChange, true);

document.addEventListener("load", ltnOnLoad, true);
