var mainBodyModel = {};

head.js({ mdl: "/public/mdl/material.min.js" }); //no dependencies
head.js({ resilient: "/public/apps/login/bower/resilient/resilient.min.js" }); //no dependencies

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
				
				var viewModel = function () {
					var self = this;
					
					self.login = ko.observable(null);
					
					self.dns = ko.observable(null);
					
					self.test = ko.observable(null);
				}
				
				mainBodyModel = new viewModel();
				
				// use HTML5 history
        pager.useHTML5history = true;
        // use History instead of history
        pager.Href5.history = History;

				// extend your view-model with pager.js specific data
				pager.extendWithPage(mainBodyModel);
				// apply the view-model using KnockoutJS as normal
				
				//ko.options.deferUpdates = true;
				//ko.tasks.runEarly();
				
				
				
				ko.applyBindings(mainBodyModel, document.getElementById("main-body"));

				// start pager.js
				//pager.start();
				// start pager.js
				pager.startHistoryJs();

				//http://stackoverflow.com/questions/15022113/how-to-organize-a-spa-with-knockoutjs-sammyjs-and-pagerjs
				
				console.log('main-body binding applied');
			});
		});
		
		
});


var mdl_init = function(page) {//apply on pagerjs external resources
	console.log('mdl: ');
	console.log(page);
		
		head.js({ page: '/public/apps/'+page.currentId+'/index.js' });
		head.ready('page',function(){
			console.log('loaded...'+page.currentId);
			document.documentElement.classList.add('mdl-js');
			componentHandler.upgradeAllRegistered();
		});
};
		

