// ==UserScript==
// @name         ServiceNow Advanced Functionality - Main Functions
// @version      1
// @grant        unsafeWindow
// @match		 https://support.compucom.com/Incidents/*
// @match		 https://support.compucom.com/incidents/*
// @match		 https://iaas.service-now.com/*
// @match        https://support.compucom.com/*
// @run-at       document-idle
// ==/UserScript==

(function(){
    if(typeof $ == 'undefined'){ var $ = unsafeWindow.jQuery; }

    if(document.location.pathname.toLowerCase() == "/incidents/incidentmanagement.aspx"){
        //setTimeout(function (){
        var evt0 = document.createEvent("MouseEvents");
        evt0.initEvent("click", true, true);
        document.getElementById('inc_liSavedFilters').dispatchEvent(evt0);
        $('#panelbar-leftnav').append('<li id="liMyTeam" class="k-item k-state-default" role="menuitem"><span class="k-link k-header">My Team</span><ul id="inc_leftnav_savedFilters" class="leftnavSavedFilters leftnavSavedTeam k-group k-panel" role="group"></li>')
        //}, 10);
        $("#linkSingleSearch").off("click");
        document.getElementById("linkSingleSearch").addEventListener("click", function(){
            searchModif();
        });
        $('txtSingleSearch').off('keypress');
        document.getElementById("txtSingleSearch").addEventListener("keypress", function(e){
            var code = (e.keyCode ? e.keyCode : e.which);
            if(code == 13){
                searchModif();
            }
        });
        unsafeWindow.jQuery('#incident_grid>.k-grid-content>.k-selectable>tbody>tr>td[role="gridcell"]>a').attr('onClick','window.open(this.href, "_blank", "location=yes");return false;');
        document.getElementById('lnkResolver').innerHTML = "CompuCom Resolver Portal by Petri Trebilcock";
        document.getElementById('search_filter_title').parentElement.innerHTML += "<input type=\"button\" style=\"display: none; margin-right: 10px;\" name=\"addFilterButton\" value=\"Add Filter\" onclick=\"$('#addFilterWindow').data('kendoWindow').open();\" id=\"addFilterButton\" class=\"k-button\"><input type=\"button\" name=\"showFilterButton\" value=\"Show Filters\" onclick=\"showFilters();\" id=\"showFilterButton\" class=\"k-button\"><input type=\"button\" style=\"margin-left: 5px;\" name=\"refreshButton\" value=\"Refresh\" onclick=\"refresh();\" id=\"refreshButton\" class=\"k-button\"><input id=\"enableRefresh\" type=\"checkbox\"><label for=\"enableRefresh\">Auto-refresh values every </label><input id=\"refreshMinutes\" type=\"number\" min=\"3\" value=\"5\"><label for=\"refreshMinutes\"> minutes.</label> <input type=\"button\" onclick=\"startRefreshTimer();\" value=\"Submit\">";
        ticketCount();
        document.getElementById('lblIncident').outerHTML += "<input type=\"button\" style=\"margin-left: 5px;\" name=\"copyTicketButton\" value=\"Copy\" onclick=\"copyToClipboard(IncidentNumber);\" id=\"copyTicketButton\" class=\"Button\">";
        unsafeWindow.selectFilter = exportFunction (selectFilter, unsafeWindow);
        unsafeWindow.showFilters = exportFunction (showFilters, unsafeWindow);
        unsafeWindow.copyToClipboard = exportFunction (copyToClipboard, unsafeWindow);
        unsafeWindow.refresh = exportFunction (refresh, unsafeWindow);
        unsafeWindow.ticketCount = exportFunction (ticketCount, unsafeWindow);
        unsafeWindow.thirtyDay = exportFunction (thirtyDay, unsafeWindow);
        unsafeWindow.searchModif = exportFunction (searchModif, unsafeWindow);
        unsafeWindow.startRefreshTimer = exportFunction (startRefreshTimer, unsafeWindow);
        unsafeWindow.refreshTimer = 0;
    }

    if(document.location.pathname.toLowerCase() == "/login_locate_sso.do"){
        var ccLogo = document.createElement("div");
        ccLogo.id = "newLogoDiv";
        var reference = document.getElementById('loginPage').firstChild.firstChild.firstChild.firstChild;
        reference.appendChild(ccLogo);
    }

    //Redirects for various CompuCom landing pages
    if(document.location.pathname.toLowerCase() == "/common/sute/signin.aspx"){
        setTimeout(function(){
            window.location.replace("https://iaas.service-now.com/login_locate_sso.do");
        },5);
    }
    if(document.location.pathname.toLowerCase() == "/nav_to.do"){
        setTimeout(function(){
            window.location.replace("https://iaas.service-now.com/login_locate_sso.do");
        },5);
    }
})();
function thirtyDay(){
    var $ = unsafeWindow.jQuery;
    //The next 4 lines are just because the id "30 Day+" has a plus sign in it and jQuery has a stroke with selectors that contain special characters. Beautiful pure Javascript.
    var parentNode = document.getElementById("30\ Day\+").querySelectorAll("td:first-child")[0];
    var newNode = document.createElement('span');
    newNode.innerHTML = '(0)';
    newNode.className = 'totals';
    var referenceNode = document.getElementById("30\ Day\+").querySelectorAll(".filtersetting")[0];
    parentNode.insertBefore(newNode, referenceNode);
    //This code could easily be its own function but I'm too lazy to fight with Userscript scopes.
    var body = "{\"take\":150,\"skip\":0,\"page\":1,\"pageSize\":0,\"sort\":[{\"field\":\"number\",\"dir\":\"asc\"}],\"filter\":{\"logic\":\"and\",\"filters\":[{\"logic\":null,\"field\":\"listtype\",\"value\":\"myincidents_all\",\"operator\":\"=\",\"FilterType\":{\"_type\":0}},{\"logic\":null,\"field\":null,\"value\":null,\"operator\":null,\"FilterType\":{\"_type\":0},\"filters\":[{\"logic\":null,\"field\":\"assigned_to\",\"value\":\"Petri Trebilcock\",\"operator\":\"eq\",\"FilterType\":{\"_type\":0}}]},{\"logic\":null,\"field\":null,\"value\":null,\"operator\":null,\"FilterType\":{\"_type\":0},\"filters\":[{\"logic\":null,\"field\":\"incident_state\",\"value\":\"6,7\",\"operator\":\"NOT IN\",\"FilterType\":{\"_type\":0}}]},{\"filters\":[{\"field\":\"sys_created_on\",\"operator\":\"lt\",\"value\":\"javascript:gs.daysAgoStart(30)\"}]}]},\"choiceListSelections\":\"incident_state:Resolved, Closed^sys_created_on:Last 30 days^\"}";
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        async: true,
        data: body,
        url: "https://support.compucom.com/Incidents/WebMethods/IncidentWS.asmx/getIncidentLite_SaveLastAppliedFilters",
        error: function(){
            document.getElementById("30 Day+").getElementsByClassName("totals")[0].textContent = "(0)";
        },
        success: function(data){
            document.getElementById("30 Day+").getElementsByClassName("totals")[0].textContent = '('+data.d.Data.TotalCount+')';
        }
    });
}

function ticketCount(){
    if (!document.getElementById('My Open Tickets')) {
        setTimeout(ticketCount, 10);
    } else {
        var $ = unsafeWindow.jQuery;
        $('.k-grid-content').append('<div class="k-loading-mask" style="width: 100%; height: 100%; top: 0px; left: 0px;"><span class="k-loading-text">Loading...</span><div class="k-loading-image"></div><div class="k-loading-color"></div></div>');
        thirtyDay();
        var myTickets = document.getElementById('myincidents').firstChild.firstElementChild.innerText;
        var groupTickets = document.getElementById('mygroupincidents').firstChild.firstElementChild.innerText;
        var groupUnassigned = document.getElementById('mygroupincidents_unassigned').firstChild.firstElementChild.innerText;
        groupUnassigned = groupUnassigned.slice(0, -1);
        document.getElementById('My Open Tickets').firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstChild.data = 'My Open Tickets ('+myTickets+')';
        //document.getElementById('Canada Field Services Tickets').firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstChild.data = 'Canada Field Services Tickets ('+groupTickets+')';
        //document.getElementById('Canada Field Services Unassigned').firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstChild.data = 'Canada Field Services Unassigned ('+groupUnassigned+')';
        for(var i = 0; i < document.getElementById('inc_liSavedFilters').getElementsByClassName('k-link').length; i++) {
            document.getElementById('inc_liSavedFilters').getElementsByClassName('k-link')[i].addEventListener("click", selectFilter());
        }
        document.getElementById('lblIncident').setAttribute("onclick", "window.open('IncidentsDetails.aspx?IncidentID=' + IncidentNumber, '_blank', 'location=yes')");
        var evt1 = document.createEvent("MouseEvents");
        evt1.initEvent("click", true, true);
        document.getElementById('My Open Tickets').dispatchEvent(evt1);
        unsafeWindow.teamName = null;
        $('li[id*="@G"]').each(function(){
            $(this).html($(this).html().replace("@G", ""));
            var teamID = $(this).attr("id");
            teamID = teamID.substring(2, teamID.length);
            unsafeWindow.teamName = teamID;
            $(this).attr("id",teamID);
        });
        document.getElementById(unsafeWindow.teamName).firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstChild.data = unsafeWindow.teamName+' Tickets ('+groupTickets+')';
        document.getElementById('@U').firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstChild.data = unsafeWindow.teamName+' Unassigned ('+groupUnassigned+')';
        $('li[id*="@T"]').appendTo($('#inc_leftnav_savedFilters.leftnavSavedTeam'));
        $('li[id*="@T"]').each(function(){
            $(this).html($(this).html().replace("@T", ""));
            var teamID = $(this).attr("id");
            teamID = teamID.substring(2, teamID.length);
            $(this).attr("id",teamID);
            $(this).find('.filtersetting').before('(<span class="totals">0</span>)');
        });
        $('.leftnavSavedTeam .k-link').each(function(){
            var member = $(this).attr("id");
            var body = "{\"take\":150,\"skip\":0,\"page\":1,\"pageSize\":0,\"sort\":[{\"field\":\"number\",\"dir\":\"asc\"}],\"filter\":{\"logic\":\"and\",\"filters\":[{\"field\":\"listtype\",\"operator\":\"=\",\"value\":\"myincidents_all\"},{\"filters\":[{\"field\":\"assigned_to\",\"operator\":\"eq\",\"value\":\""+ member +"\"}]},{\"filters\":[{\"field\":\"incident_state\",\"operator\":\"NOT IN\",\"value\":\"6,7\"}]}]},\"choiceListSelections\":\"incident_state:Resolved, Closed^\"}";
            $.ajax({
                type: "POST",
                contentType: "application/json; charset=utf-8",
                async: true,
                data: body,
                url: "https://support.compucom.com/Incidents/WebMethods/IncidentWS.asmx/getIncidentLite_SaveLastAppliedFilters",
                error: function(){
                    $(this).find('.totals').innerHTML = "0";
                },
                success: function(data){
                    document.getElementById(member).getElementsByClassName("totals")[0].textContent = data.d.Data.TotalCount;
                }
            });
        });
        $('span.k-icon[title="Delete this filter."]').hide();
    }
}

function showFilters(){
  if(document.getElementById('filterButtons').style.display == "" || document.getElementById('filterButtons').style.display == "none"){
    document.getElementById('filterButtons').style.display = "inline";
    document.getElementById('addFilterButton').style.display = "inline";
    document.getElementById('showFilterButton').value = "Hide Filters";
  }else{
    document.getElementById('filterButtons').style.display = "none";
    document.getElementById('addFilterButton').style.display = "none";
    document.getElementById('showFilterButton').value = "Show Filters";
  }
}
function refresh(){
    var $ = unsafeWindow.jQuery;

    var thirtydayrequestbody = "{\"take\":150,\"skip\":0,\"page\":1,\"pageSize\":0,\"sort\":[{\"field\":\"number\",\"dir\":\"asc\"}],\"filter\":{\"logic\":\"and\",\"filters\":[{\"logic\":null,\"field\":\"listtype\",\"value\":\"myincidents_all\",\"operator\":\"=\",\"FilterType\":{\"_type\":0}},{\"logic\":null,\"field\":null,\"value\":null,\"operator\":null,\"FilterType\":{\"_type\":0},\"filters\":[{\"logic\":null,\"field\":\"assigned_to\",\"value\":\"Petri Trebilcock\",\"operator\":\"eq\",\"FilterType\":{\"_type\":0}}]},{\"logic\":null,\"field\":null,\"value\":null,\"operator\":null,\"FilterType\":{\"_type\":0},\"filters\":[{\"logic\":null,\"field\":\"incident_state\",\"value\":\"6,7\",\"operator\":\"NOT IN\",\"FilterType\":{\"_type\":0}}]},{\"filters\":[{\"field\":\"sys_created_on\",\"operator\":\"lt\",\"value\":\"javascript:gs.daysAgoStart(30)\"}]}]},\"choiceListSelections\":\"incident_state:Resolved, Closed^sys_created_on:Last 30 days^\"}";
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        async: true,
        data: thirtydayrequestbody,
        url: "https://support.compucom.com/Incidents/WebMethods/IncidentWS.asmx/getIncidentLite_SaveLastAppliedFilters",
        beforeSend: function(){
            document.getElementById("30 Day+").getElementsByClassName("totals")[0].textContent = "(Updating...)";
        },
        error: function(){
            document.getElementById("30 Day+").getElementsByClassName("totals")[0].textContent = "(Err.)";
        },
        success: function(data){
            document.getElementById("30 Day+").getElementsByClassName("totals")[0].textContent = '('+data.d.Data.TotalCount+')';
        }
    });
    var openticketsrequestbody = "{\"forWhom\":\"myitems\",\"page\":\"incident\"}";
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        async: true,
        data: openticketsrequestbody,
        url: "https://support.compucom.com/Incidents/WebMethods/IncidentWS.asmx/getItemsCount",
        beforeSend: function(){
            document.getElementById('My Open Tickets').firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstChild.data = "My Open Tickets (Updating...)";
        },
        error: function(){
            document.getElementById('My Open Tickets').firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstChild.data = 'My Open Tickets (Err.)';
        },
        success: function(data){
            document.getElementById('My Open Tickets').firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstChild.data = 'My Open Tickets ('+data.d.Data.Count+')';
        }
    });
    var teamticketsrequestbody = "{\"forWhom\":\"mygroupitems\",\"page\":\"incident\"}";
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        async: true,
        data: teamticketsrequestbody,
        url: "https://support.compucom.com/Incidents/WebMethods/IncidentWS.asmx/getItemsCount",
        beforeSend: function(){
            document.getElementById(unsafeWindow.teamName).firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstChild.data = unsafeWindow.teamName+' Tickets (Updating...)';
        },
        error: function(){
            document.getElementById(unsafeWindow.teamName).firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstChild.data = unsafeWindow.teamName+' Tickets (Err.)';
        },
        success: function(data){
            document.getElementById(unsafeWindow.teamName).firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstChild.data = unsafeWindow.teamName+' Tickets ('+data.d.Data.Count+')';
        }
    });
    var teamunassignedrequestbody = "{\"forWhom\":\"mygroup_unassigneditems\",\"page\":\"incident\"}";
    $.ajax({
        type: "POST",
        contentType: "application/json; charset=utf-8",
        async: true,
        data: teamunassignedrequestbody,
        url: "https://support.compucom.com/Incidents/WebMethods/IncidentWS.asmx/getItemsCount",
        beforeSend: function(){
            document.getElementById('@U').firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstChild.data = unsafeWindow.teamName+' Unassigned (Updating...)';
        },
        error: function(){
            document.getElementById('@U').firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstChild.data = unsafeWindow.teamName+' Unassigned (Err.)';
        },
        success: function(data){
            document.getElementById('@U').firstElementChild.firstElementChild.firstElementChild.firstElementChild.firstChild.data = unsafeWindow.teamName+' Unassigned ('+data.d.Data.Count+')';
        }
    });
    $('.leftnavSavedTeam .k-link').each(function(){
        var member = $(this).attr("id");
        var body = "{\"take\":150,\"skip\":0,\"page\":1,\"pageSize\":0,\"sort\":[{\"field\":\"number\",\"dir\":\"asc\"}],\"filter\":{\"logic\":\"and\",\"filters\":[{\"field\":\"listtype\",\"operator\":\"=\",\"value\":\"myincidents_all\"},{\"filters\":[{\"field\":\"assigned_to\",\"operator\":\"eq\",\"value\":\""+ member +"\"}]},{\"filters\":[{\"field\":\"incident_state\",\"operator\":\"NOT IN\",\"value\":\"6,7\"}]}]},\"choiceListSelections\":\"incident_state:Resolved, Closed^\"}";
        $.ajax({
            type: "POST",
            contentType: "application/json; charset=utf-8",
            async: true,
            data: body,
            url: "https://support.compucom.com/Incidents/WebMethods/IncidentWS.asmx/getIncidentLite_SaveLastAppliedFilters",
            beforeSend: function(){
                document.getElementById(member).getElementsByClassName("totals")[0].textContent = 'Updating...';
            },
            error: function(){
                $(this).find('.totals').innerHTML = "0";
            },
            success: function(data){
                document.getElementById(member).getElementsByClassName("totals")[0].textContent = data.d.Data.TotalCount;
            }
        });
    });
}

function startRefreshTimer(){
    var $ = unsafeWindow.jQuery;
    if($('#enableRefresh')[0].value="off" && unsafeWindow.refreshTimer != 0){
        clearInterval(unsafeWindow.refreshTimer);
        unsafeWindow.refreshTimer = 0;
    }else if($('#enableRefresh')[0].value="on" && unsafeWindow.refreshTimer != 0){
        clearInterval(unsafeWindow.refreshTimer);
        var time = $('#refreshMinutes')[0].valueAsNumber;
        var mins = time * 60000;
        unsafeWindow.refreshTimer = setInterval(function(){
            refresh();
        },mins);
    }else{
        var time = $('#refreshMinutes')[0].valueAsNumber;
        var mins = time * 60000;
        unsafeWindow.refreshTimer = setInterval(function(){
            refresh();
        },mins);
    }
}

function copyToClipboard(text){
    var dummy = document.createElement("input");
    document.body.appendChild(dummy);
    dummy.setAttribute('value', text);
    dummy.select();
    document.execCommand("copy");
    document.body.removeChild(dummy);
}

function selectFilter() {
  return function() {
    for(var i = 0; i < document.getElementsByClassName('selected').length; i++) {
      document.getElementsByClassName('selected')[i].classList.remove('selected');
    }
    if(document.getElementById('search_filter_title').textContent.slice(0, -1) != 'Filters'){
    	var currentFilter = document.getElementById('search_filter_title').textContent.slice(0, -1)
      document.getElementById(currentFilter).firstElementChild.classList.add('selected');
    }else if (document.getElementById('search_filter_title').textContent.slice(0, -1) == '@U'){
        document.getElementById(currentFilter).firstElementChild.classList.add('selected');
        document.getElementById('search_filter_title').textContent = currentFilter;
        var currentFilter = unsafeWindow.teamName+' Unassigned';
    }
  };
}

function searchModif() {
 if(typeof $ == 'undefined'){ var $ = unsafeWindow.jQuery; }
 var invalidNumberErrorMsg = "<div style='text-align:left;margin:0 20px 0 20px;'>The record was not found. Please confirm the record number and try again.</div>";
 var searchval = $("#txtSingleSearch").val();
 searchval = $.trim(searchval);
 if (searchval === '') return;
 var webmethodURL = "", detailPageUrl = "";
 if (searchval.toLowerCase().indexOf("inc") == 0) {
     webmethodURL = "https://support.compucom.com/Incidents/WebMethods/IncidentWS.asmx/" + "getIncidents";
     detailPageUrl = "/incidents/IncidentsDetails.aspx?IncidentID=";
 }
 else if (searchval.toLowerCase().indexOf("ctask") == 0) {
     webmethodURL = unsafeWindow.ct_baseURL + "getChangeTasks";
     detailPageUrl = "/CTasks/CTasksDetails.aspx?CTaskID=";
 }
 else if (searchval.toLowerCase().indexOf("chg") == 0) {
     webmethodURL = unsafeWindow.cr_baseURL + "getChangeRequests";
     detailPageUrl = "/ChangeRequest/ChangeRequestDetails.aspx?ChangeRequestID=";
 }
 else if (searchval.toLowerCase().indexOf("task") == 0) {
     webmethodURL = unsafeWindow.sct_baseURL + "getCatalogs";
     detailPageUrl = "/Catalog/CatalogDetails.aspx?ServiceCatalogTaskID=";
 }
 else {
     $.publish('common/controls/leftnav/displayMessageWindow', ['info', 'red', invalidNumberErrorMsg]);
     return;
 }

 //kendo.ui.progress($("#spanSingleSearch"), true);
 $("#imgLoading").css("display", "inline");
 var myfilter = {
     logic: "", filters: [{ field: "number", value: searchval, operator: "=", logic: ""}]
 };
 var settings = { skip: 0, take: 1, page: 1, pageSize: 1, sort: {}, filter: myfilter };
 $.ajax({
     type: "POST",
     contentType: "application/json; charset=utf-8",
     data: unsafeWindow.kendo.stringify(settings),
     dataFilter: function (text) {
         try {
             var data = $.parseJSON(text);
             if (data.d != null && data.d.Data != null) {
                 if (data.d.Data.error && data.d.Data.error != '') {
                     $.publish('common/controls/leftnav/displayMessageWindow', ['info', 'red', data.d.Data.error]);
                     $("#imgLoading").css("display", "none");
                     return "";
                 } else {
                     if (data.d.Data.TotalCount > 0) {
                       window.open(detailPageUrl + data.d.Data.Items[0].number, '_blank', 'location=yes');
                       //window.location = detailPageUrl + data.d.Data.Items[0].number;
                       $("#imgLoading").css("display", "none");
                       return false;
                     }
                     else {
                         $.publish('common/controls/leftnav/displayMessageWindow', ['info', 'red', invalidNumberErrorMsg]);
                         //kendo.ui.progress($("#spanSingleSearch"), false);
                         $("#imgLoading").css("display", "none");
                     }
                 }
             }
         } catch (e) {
             //kendo.ui.progress($("#spanSingleSearch"), false);
             $("#imgLoading").css("display", "none");
         }
     },
     url: webmethodURL
 });
}
