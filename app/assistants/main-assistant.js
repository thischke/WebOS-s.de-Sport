function MainAssistant() {
	/* this is the creator function for your scene assistant object. It will be passed all the 
	   additional parameters (after the scene name) that were passed to pushScene. The reference
	   to the scene controller (this.controller) has not be established yet, so any initialization
	   that needs the scene controller should be done in the setup function below. */
}

MainAssistant.prototype.setup = function() {
	/* this function is for setup tasks that have to happen when the scene is first created */
		
	/* use Mojo.View.render to render view templates and add them to the scene, if needed */
	
	/* setup widgets here */
	
	/* Button zum Aktualisieren */
	this.controller.setupWidget('button_rss_sport', 
		this.atts = {
			type: Mojo.Widget.activityButton
		}, 
		this.model = {
			buttonLabel: 'Aktualisieren',
			buttonClass: 'affirmative',
			disabled: false
		}
	);
	
	/* Liste */
	this.list_attributes = {
		itemTemplate: 'main/static-list-entry',
		listTemplate: 'main/static-list-container',
	};
	this.list_model = {
		listTitle: "s.de Sport",
	};
	this.controller.setupWidget("rss_sport", this.list_attributes, this.list_model);


	/* add event handlers to listen to events from widgets */
	this.callUpdateRSS = this.callUpdateRSS.bind(this);
	Mojo.Event.listen(this.controller.get('button_rss_sport'),Mojo.Event.tap, this.callUpdateRSS);
	
};

MainAssistant.prototype.callUpdateRSS = function() {
	
	/* RSS sde Sport abholen */
	var request = new Ajax.Request("http://www.sueddeutsche.de/app/service/rss/ressort/sport/rss.xml", {
		method: 'get',
		evalJSON: 'false',
		onSuccess: this.feedRequestSuccess.bind(this),
		onFailure: this.feedRequestFailure.bind(this)
	});
}

MainAssistant.prototype.feedRequestSuccess = function(transport){
	
	if (transport.responseText !== null) {
		Mojo.Log.info("text geholt");
		
		var listItems = [];
		var rssItems = transport.responseXML.getElementsByTagName("item");

		for (i = 0; i < rssItems.length; i++) {
			
			listItems[i] = {
				title: rssItems[i].getElementsByTagName("title").item(0).textContent,
				url:   rssItems[i].getElementsByTagName("guid").item(0).textContent,
				desc:  rssItems[i].getElementsByTagName("description").item(0).textContent
			};
			
			// Strip HTML from text for summary
			listItems[i].desc = listItems[i].desc.replace(/(<([^>]+)>)/ig,"");
			listItems[i].desc = listItems[i].desc.replace(/http:\S+/ig,"");
			listItems[i].desc = listItems[i].desc.replace(/#[a-z]+/ig,"{");
			listItems[i].desc = listItems[i].desc.replace(/(\{([^\}]+)\})/ig,"");
			listItems[i].desc = unescape(listItems[i].desc);
		}
		
		this.controller.get("rss_sport").mojo.noticeUpdatedItems(0, listItems);	
	}
	
	/* Button wieder in Originalzustand bringen */
	this.buttonWidget = this.controller.get('button_rss_sport');
	this.buttonWidget.mojo.deactivate();
	this.spinning = false;
	
	// Watch for taps on the list items	
	this.listTapHandler = this.listTapHandler.bindAsEventListener(this);
	Mojo.Event.listen(this.controller.get('rss_sport'),Mojo.Event.listTap, this.listTapHandler);
}

MainAssistant.prototype.feedRequestFailure = function(transport){
	
	var t = new Template("Status #{status} returned from newsfeed request.");
	var m = t.evaluate(transport);
	
	Mojo.Log.info("Invalid feed - http failure (", m, ")");
	Mojo.Controller.errorDialog("Invalid feed - http failure ("+m+")");
	
	/* Button wieder in Originalzustand bringen */
	this.buttonWidget = this.controller.get('button_rss_sport');
	this.buttonWidget.mojo.deactivate();
	this.spinning = false;
}

MainAssistant.prototype.listTapHandler = function(event){
	
	this.controller.serviceRequest('palm://com.palm.applicationManager', {
		method: 'open',
		parameters: {
			id: 'com.palm.app.browser',
			params: {
				target: event.item.url
			}
		}
	});
}

MainAssistant.prototype.activate = function(event) {
	/* put in event handlers here that should only be in effect when this scene is active. For
	   example, key handlers that are observing the document */
};

MainAssistant.prototype.deactivate = function(event) {
	/* remove any event handlers you added in activate and do any other cleanup that should happen before
	   this scene is popped or another scene is pushed on top */
};

MainAssistant.prototype.cleanup = function(event) {
	/* this function should do any cleanup needed before the scene is destroyed as 
	   a result of being popped off the scene stack */
};
