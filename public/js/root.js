var mainBodyModel = {};

head.js({ mdl: "/public/mdl/material.min.js" }); //no dependencies

/**
 *  @pager
 * 
 * */
//head.js({ ko: "/public/bower/knockoutjs/dist/knockout.js" }); 
//head.js({ jQuery: "/public/bower/jquery/dist/jquery.min.js" }); 
head.load([
	{ ko: "/public/bower/knockoutjs/dist/knockout.js" },//no dependencies
	{ jQuery: "/public/bower/jquery/dist/jquery.min.js" }//no dependencies
], function(){
		
		head.load({ pager: "/public/bower/pagerjs/dist/pager.min.js" },function(){
			head.load({ history: "/public/bower/history.js/scripts/bundled/html4+html5/jquery.history.js"}, function(){
			
				// use HTML5 history
        pager.useHTML5history = true;
        // use History instead of history
        pager.Href5.history = History;

				// extend your view-model with pager.js specific data
				pager.extendWithPage(mainBodyModel);
				// apply the view-model using KnockoutJS as normal
					
				ko.applyBindings(mainBodyModel, document.getElementById("main-body"));

				// start pager.js
				//pager.start();
				// start pager.js
				pager.startHistoryJs();

				//http://stackoverflow.com/questions/15022113/how-to-organize-a-spa-with-knockoutjs-sammyjs-and-pagerjs
			});
		});
		
});

