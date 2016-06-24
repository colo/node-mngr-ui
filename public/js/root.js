var mainBodyModel = {};

//head.js({ mdl: "/public/mdl/material.min.js" }); //no dependencies
head.js({ resilient: "/public/apps/login/bower/resilient/resilient.min.js" }); //no dependencies
head.js({ mootools: "/public/bower/mootools/dist/mootools-core.min.js" }); //no dependencies

//head.js({ mootools: "/public/bower/mootools/dist/mootools-core.min.js" }, function(){
		//head.js({ mootools: "/public/js/MooTools-More-1.6.0-compressed.js" }); //no dependencies
//}); //no dependencies


//head.js({ polymer: "/public/bower/webcomponentsjs/webcomponents.min.js" }); //no dependencies 

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
					
					//console.log(apps);
					
					apps.each(function(app){
						self[app.id] = ko.observable(null);
					});
					
					self.breadcrumbs = ko.observableArray([
						{label: 'dashboard', href: '/dashboard'},
						{label: 'second', href: '/dashboard/more'}
					]); 
					
					//self.apps = ko.observableArray([]);
					 
					//self.apps.subscribe(function(app) {
						////console.log("Suscribe: " + app);
						//self[app] = ko.observable(null);
					//});
					 
					//self.login = ko.observable(null);
					
					//self.dns = ko.observable(null);
					
					//self.test = ko.observable(null);
				}
				
				//var update_view_model = function(apps){//JSONP callback
					////console.log('updating view model...');
					
					//apps.each(function(app){
						//viewModel[app] = ko.observable(null);
					//});
				//}
				
				//var servers = [
					//window.location.protocol+'//'+window.location.host
				//];
				//var client = resilient({
					 //service: { 
						 //basePath: '/',
						 //headers : { "Content-Type": "application/json" },
						 ////data: { "username": form.username.value, "password": form.password.value }
					 //}
				 //});
				 
				//client.setServers(servers);
				

				//client.get('api/apps/?callback=update_view_model', function(err, res){
					//if(err){
						////console.log('Error:', err);
						////console.log('Response:', err.data);
					//}
					//else{
						////console.log('Ok:', res);
						////console.log('Body:', res.data);
						////res.data();
						////window.location.assign(res.headers.Link.split(';')[0]);
						////window.location.replace(res.headers.Link.split(';')[0].replace(/<|>/g, ''));
						
						
					//}
				//});

				//http://knockoutjs.com/documentation/component-custom-elements.html
				//document.createElement('mat-breadcrumb-step');
				//document.createElement('mat-breadcrumb');
				//document.getElementsByClassName('mat-breadcrumb').append('/dashboard/more', 'second');
				//$(document.getElementsByClassName('mat-breadcrumb')).append('/dashboard/more', 'second');
				//document.getElementById('myBreadcrum').append({path: '', value: ''});
				
				//ko.components.register('mat-breadcrumb', {
						//viewModel: function(params) {
							//self = this;
							//self.breadcrumbs = params.items;
							////console.log(params.items()[0]);
							////this.text = ko.observable(params && params.initialText || '');
							////self.elements = '';
							////Array.each(this.breadcrumbs(), function(bc){
								////console.log(bc);
								////self.elements += '<mat-breadcrumb-step label="'+bc.label+'" href="'+bc.href+'"></mat-breadcrumb-step>';
							////});
						//},
						//template: 
						//'<div class="wrapper style-scope mat-breadcrumb">'+
						//'<!-- ko foreach: $root.breadcrumbs -->'+
						//'<mat-breadcrumb-step data-bind="attr: { label: label, href: href }"></mat-breadcrumb-step>'+
						//'<!-- /ko -->'+
						//'</div>'
				//});
				
				
	
				mainBodyModel = new viewModel();
				
				//console.log('viewModel');
				//console.log(mainBodyModel);
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
				
				//ko.bindingHandlers.upgradeElement = {
						//init: function(element, valueAccessor) {
							//console.log('element');
							//console.log($(element));
							//componentHandler.upgradeElement($(element));   // Make the element invisible
						//},
						//update: function(element, valueAccessor) {
							//console.log('element');
							//console.log($(element));
							//componentHandler.upgradeElement($(element));   // Make the element invisible
						//}
				//};

				// start pager.js
				//pager.start();
				// start pager.js
				pager.startHistoryJs();

				//http://stackoverflow.com/questions/15022113/how-to-organize-a-spa-with-knockoutjs-sammyjs-and-pagerjs
				
				//console.log('main-body binding applied');
						
			});
		});
		
		
});

head.ready(document, function() {
	head.js({ bootstrap: "/public/bower/gentelella/vendors/bootstrap/dist/js/bootstrap.min.js" });
	//head.js({ fastclick: "/public/bower/gentelella/vendors/fastclick/lib/fastclick.js" });
	//head.js({ nprogress: "/public/bower/gentelella/vendors/nprogress/nprogress.js" });
	head.js({ gentelella: "/public/bower/gentelella/build/js/custom.min.js" });
});

var load_app_resources = function(page) {//apply on pagerjs external resources
	//console.log('mdl: ');
	//console.log(page);
		//head.ready(function() {
    //// push a function to the end of the page for later execution
    //// runs as soon as the document is ready
    //document.documentElement.classList.add('mdl-js');
		//componentHandler.upgradeAllRegistered();
		//});
		
		head.js({ page: '/public/apps/'+page.currentId+'/index.js' });
		//head.load({ page: '/public/apps/'+page.currentId+'/index.css' });
		//head.ready('page',function(){
			//console.log('loaded...'+page.currentId);
			//document.documentElement.classList.add('mdl-js');
			//componentHandler.upgradeAllRegistered();
		//});
};

//var re_init_mdl = new Event('re_init_mdl');
		
//window.addEventListener('re_init_mdl', function(event){
	//console.log('re_init_mdl ');
	//document.documentElement.classList.add('mdl-js');
	//componentHandler.upgradeAllRegistered();
//});
