
/**
    Pitcher calls this function on page scroll. Important: Do not add listeners on Page Init or Page Load, as those can be called when the page is cached! Instead please override the PitcherInit function.
	@override
 */
function pitcherInit(){
	
}

//global variables
var notesShown = false;
var isTwoD = false;
var isPitching = false;
var isAnimated = false;
var blockInteraction = false;
var hasHotspots = false;

/**
    Pitcher Remote Control calls this function to check if this specific slide has notes
    @param {string} title - The title of the book.
	@return {number} The circumference of the circle.
 */
//remote control related functions

/**
    Pitcher Remote Control calls this function to check if this specific slide has notes
 	@return {string} YES/NO
 */
function hasNotes() {
	var hasNotes = $(".notes").html() != null;
	if (hasNotes) return "YES";
	else return "NO";
}

/**
    Pitcher Remote Control calls this function to get the notes
 	@return {string} Contents of the notes to be visible on the device.
 */
function getNotes() {
	return $.trim($(".notes").html().replace(/(<([^>]+)>)/ig, ""));
}

/**
    Adds listeners to update remote devices on video start/pause
 */
function addVideoListeners() {
	try {
		var myVideo = document.getElementById('embeddedVideo');
		myVideo.addEventListener('playing', sendVideoPlay, false);
		myVideo.addEventListener('pause', sendVideoPlay, false);
	} catch (e) {

	}
}

/**
    Listener function to update the status of the video on remote start/pause
 */
function toggleChart() {
	var myVideo = document.getElementById('embeddedVideo');
	if (myVideo != null) {
		if (myVideo.paused == false) {
			myVideo.pause();
		} else {
			myVideo.play();
		}
	}
}

/**
    Communicates with Pitcher framwork to send video messages
 */
function sendVideoPlay() {

	var myVideo = document.getElementById('embeddedVideo');
	if(myVideo.currentTime == 0 && videoHotspot!=null && videoHotspot.thirdParameter > 0){
		myVideo.currentTime = videoHotspot.thirdParameter;
	}
	Ti.App.fireEvent('oPSend');
}

/**
    Reaction function on clicking on OK or the image on remote control.
 */
function okPressedFromRemote() {
	try {
		var video = document.getElementById('embeddedVideo');
		if (video.paused == false) {
			video.pause();
		} else {
			video.play();
		}
		return;
	} catch (e) {

	}
	try {
		toggleChart();
	} catch (e) {

	}
}

//helpers
/**
    Gets the basename of a file path.
    @param {string} path - Full disk path
    @param {string} suffix - A text to remove, such as an extension
	@return {string} Basename of the file path
 */
function basename(path, suffix) {
	var b = path.replace(/^.*[\/\\]/g, '');
	if (typeof(suffix) == 'string' && b.substr(b.length - suffix.length) == suffix) {
		b = b.substr(0, b.length - suffix.length);
	}
	return b;
}

/**
    Gets the basename of a file path.
    @param {string} path - Full disk path
    @param {string} suffix - A text to remove, such as an extension
	@return {string} Basename of the file path
 */
function getPageNumber() {
	var currentPage = window.location.href;
	var basenameV = basename(currentPage, ".html");
	var lastPart = basenameV.replace("slide", "");
	var pageNumber = parseInt(lastPart);
	return pageNumber;
}

/**
    Gets the url parameters of the existing page
    @param {string} name - A certain parameter name, similar to PHPs $_GET function
	@return {string} value - returns the current value of the parameter provided
 */
function gup(name) {
	name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
	var regexS = "[\\?&]" + name + "=([^&#]*)";
	var regex = new RegExp(regexS);
	var results = regex.exec(window.location.href);
	if (results == null) return "";
	else return results[1];
}


//access methods used to launch other contents

/**
    Launches another online page.
    @param {string} pageURL - http:// or https:// full link
    @param {string} title - Title to be rendered
 */
function showPage(pageURL, title) {
	Ti.App.fireEvent('loadWebPage', {
		'urlValue': pageURL,
		'title': pageURL,
		'showBar': true,
		'allowPortrait': true
	});
}

/**
    Tells Pitcher to close the custom window.
 */
function closeModal() {
	Ti.App.fireEvent('closeOpenModal', {});
}

/**
    Tells Pitcher to go back one page, you can use this function to automatically calculate the previous page before a jump
 */
function goBack() {

	Ti.App.fireEvent('goBackToLastSlide', {});
}


/**
    Tells Pitcher to close the active presentation
 */
function closePresentation() {

	Ti.App.fireEvent('closeScrollWeb');
}


/**
    Tells Pitcher to send a custom event to Pitcher Insight engine. You can use this function to keep track of custom clicks
 */
function customEvent(eventName) {
	Ti.App.fireEvent('sendStatsFromHTML', {
		'event_name': "customPresEvent",
		'event_params': eventName,
		'event_extra': getPageNumber()
	});
}


/**
    Tells Pitcher to launch the PDF. You can also use pitcherFile://#/# annotation. For more info please see the Developer manual
    @param {string} filename - Full link to the PDF file on disk
    @param {string} title - Title to be rendered
    @param {string} launchMode - Advanced or Basic mode to be used by default
    @param {string} lockMode - Enable or Disable annotations
    @param {string} references - Custom References to be added (standard References will be ignored)
    @param {string} subFolder - Directory of the PDF on disk
    @param {integer} jumpPage - Page to launch PDF on. 1 based
    @param {integer} fileID - Pitcher file ID, important for links to function properly
 */
function showPDF(filename, title, launchMode, lockMode, references, subFolder, jumpPage, fileID) {
	Ti.App.fireEvent('loadPDF', {
		'file': filename,
		'titleV': title,
		'viewMode': launchMode,
		'lockViewMode': lockMode,
		'references': null,
		'articles': null,
		'annotationEnabled': true,
		"subFolder": subFolder,
		'jumpToPage': (jumpPage - 1),
		'pdfID': fileID
	});
}

/**
    Tells Pitcher to launch the 3D file. You can also use pitcherFile://#/# annotation. For more info please see the Developer manual
    @param {string} filename - Full link to the 3D file on disk
    @param {integer} fileID - Pitcher file ID, important for links to function properly
 */
function load3D(filename, fileID) {
	var folders = filename.split("/");
	if (folders.length != 0) {
		Ti.App.fireEvent('loadThreeD', {
			'model': folders[1],
			'folder': folders[0],
			'title': 'Pre Treatment CT - Dicom',
			'fileID': fileID
		});
	} else {
		Ti.App.fireEvent('loadThreeD', {
			'model': filename,
			'title': 'Pre Treatment CT - Dicom',
			'fileID': fileID
		});
	}

}

function loadMolecule(filename,title,fileID){
	var folders = filename.split("/");
	if(folders.length!=0){

		Ti.App.fireEvent('loadMolecule',{'model':folders[1],'folder':folders[0],'title':title,'fileID':fileID});
	}
	else{
		Ti.App.fireEvent('loadMolecule',{'model':filename,'title':title,'fileID':fileID});

	}
}

/**
    Tells Pitcher to launch the Presentation. You can also use pitcherFile://#/# annotation. For more info please see the Developer manual
    @param {integer} ID - Pitcher file ID
    @param {integer} subID - Sub page to start the presentation on, 1 based
 */
function showPresentation(ID, subID) {
	Ti.App.fireEvent('launchContentWithID', {
		'fileID': ID,
		'subID': subID
	});
}

/**
    Tells Pitcher to launch the Video. You can also use pitcherFile://#/# annotation. For more info please see the Developer manual
   	@param {string} filename - Full link to the video file on disk
	param {boolean} isOnline - Whether online connection is necessary to play the video
    param {integer} fileID - Pitcher file ID, important for links to function properly
 */
function playVideo(filename, isOnline, fileID) {
	Ti.App.fireEvent('loadMovie', {
		'file': filename,
		'isOnline': isOnline,
		'fileID': fileID
	});
}

/**
    Tells Pitcher to launch a survey. You can also use pitcherFile://#/# annotation. For more info please see the Developer manual
   	@param {string} url - Full link to the survey folder on disk
	param {string} title - Title to be rendered
    param {integer} fileID - Pitcher file ID, important for links to function properly
 */
function showSurvey(url, title, fileID) {
	Ti.App.fireEvent('loadWebPageFromFolder', {
		'urlValue': url.replace(".zip", "").replace("surveys", "") + "/index.html",
		'title': title,
		'showBar': true,
		'folderName': "surveys",
		'allowPortrait': false,
		'fileID': fileID
	});

}

/**
    Tells Pitcher to launch an HTML5 file uploaded by the CMS. You can also use pitcherFile://#/# annotation. For more info please see the Developer manual
   	@param {string} url - Full link to the survey folder on disk
	param {string} title - Title to be rendered
    param {integer} fileID - Pitcher file ID, important for links to function properly
 */
function showZip(url, title, fileID) {
	Ti.App.fireEvent('loadWebPageFromFolder', {
		'urlValue': url.replace(".zip", "").replace("zip", "") + "/index.html",
		'title': title,
		'showBar': true,
		'folderName': "zip",
		'allowPortrait': false,
		'fileID': fileID
	});

}






/**
    As webview doesn't support persistent cookies, this function can be used to make persistent values stored in Pitcher encrypted database
 */
function setCookie(value) {

	Ti.App.fireEvent('setLastPage', {
		'p': value
	});
}


/**
    By default Pitcher hides tap highlight color and calls it's JSON loader
 */
$(document).ready(function() {
	document.documentElement.style.webkitTapHighlightColor = "rgba(0,0,0,0.0)";
	pitcherInit();
	
});

/**
    This function parses the JSON, adds hotspots, puts the thermometer on the left side, and starts automatically converted animation is page is marked as animated.
 */

var videoHotspot = null;



function showHotSpots() {
	$(".hotspot").removeClass("visibleHotSpot").addClass("visibleHotSpot");
	isPitching = false;
}

function hideHotSpots() {
	$(".hotspot").removeClass("visibleHotSpot");
	isPitching = true;
}

function showNotes() {
	if (notesShown) {
		$(".notes").hide();
		notesShown = false;
	} else {
		$(".notes").show();
		notesShown = true;
	}
}

function closeNotes() {
	notesShown = false;
	$(".notes").hide();
}
(function() {
	var _alert = window.alert;                   // <-- Reference
	window.alert = function(message,title) {
		// do something additional
			if(title==null){
				title = '';
			}
			Ti.App.fireEvent("showAlertBox",{"title":title,"message":message});
		
		//return _alert.apply(this, arguments);  // <-- The universal method
		// Suits for this case
	};
	})();
	
	function pitcherCanClose() {
		return true;
	}