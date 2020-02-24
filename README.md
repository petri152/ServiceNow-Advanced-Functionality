# ServiceNow Advanced Functionality
A userscript and stylesheet to make ServiceNow less crap.

Installing this:
So you're going to need a plugin/add-on/extension called Tampermonkey (if you run Firefox you're going to use Greasemonkey). This can be obtained from here: https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en

1. Install Tampermonkey
2. Click here.
3. Confirm installation.
4. Done.

# Prerequisites.

In order to get this to work, a few things must be met.

## Filters

In ServiceNow, you must setup a number of filters that the script is expecting to have already been set beforehand.
![Filters](https://github.com/petri152/ServiceNow-Advanced-Functionality/raw/master/screenshots/filters2%20(3).png "Filters")

1. Login to ServiceNow and click All Incidents on the left-hand sidebar.
2. Once loaded, add the following filters and save these as custom filters using the "Save Current Filter" button.  
2a. When creating filters you may have to reselect All Incidents for each one to ensure everything works correctly

![filter1](https://github.com/petri152/ServiceNow-Advanced-Functionality/raw/master/screenshots/filters1%20(2).png "Filter1")  
Active: is true  
Assignment Group: is \[Your Team Name\]  
Incident State: is not one of Resolved, or Closed  
Save this filter as "@G\[Your Team Name\]" (note the @G! this is very important)

![filter2](https://github.com/petri152/ServiceNow-Advanced-Functionality/raw/master/screenshots/filters2%20(2).png "Filter2")  
For each of your team members, create filters for each and name them accordingly:  
Assigned To: is \[Team Member Name\]  
Incident State: is not one of Resolved, or Closed  
Save this filter as "@T\[Team Member Name\]" (note the @T! this is very important)

![filter3](https://github.com/petri152/ServiceNow-Advanced-Functionality/raw/master/screenshots/filters3.png "Filter3")  
Active: is true  
Assignment Group: is \[Your Team Name\]  
Infident State: is not one of Resovled, or Closed  
Assigned To: is empty  
Save this filter as "@U"

![filter4](https://github.com/petri152/ServiceNow-Advanced-Functionality/raw/master/screenshots/filters4.png "Filter4")  
Assigned To: is \[Your Name\]  
Incident State: is not one of Resolved, or Closed  
Created On: before Last 30 Days  
Save this filter as "30 Day+" (the script is expecting this exact syntax)

![filter5](https://github.com/petri152/ServiceNow-Advanced-Functionality/raw/master/screenshots/filters5.png "Filter5")  
Assigned To: is \[Your Name\]  
Incident State: is one of Resolved or Closed  
Save this filter as "My Closed Tickets"

![filter6](https://github.com/petri152/ServiceNow-Advanced-Functionality/raw/master/screenshots/filters6.png "Filter6")  
Assigned To: is \[Your Name\]  
Incident State: is NOT one of Resolved or Closed  
Save this filter as "My Open Tickets"
