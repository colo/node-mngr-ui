var mainBodyModel = {};

head.js({ resilient: "/public/apps/login/bower/resilient/resilient.min.js" }); //no dependencies
//head.js({ mootools: "/public/bower/mootools/dist/mootools-core.min.js" }); //no dependencies

head.js({ mootools: "/public/bower/mootools/dist/mootools-core.min.js" }, function(){
		head.js({ 'mootools-more': "/public/js/MooTools-More-1.6.0-compressed.js" }); //no dependencies
}); //no dependencies


head.ready('mootools-more', function(){ 
	
	head.load([
		{ ko: "/public/bower/knockoutjs/dist/knockout.js" },//no dependencies
		{ jQuery: "/public/bower/jquery/dist/jquery.min.js" }//no dependencies
	], function(){
	/**
	 *  @pager
	 * 
	 * */
			head.load({ pager: "/public/bower/pagerjs/dist/pager.min.js" },function(){
				head.load({ history: "/public/bower/history.js/scripts/bundled/html4+html5/jquery.history.js"}, function(){
					
					var MainModel = new Class({
						Implements: [Options, Events],
						
						options : {
						},
						
						initialize: function(options){
							var self = this;
							
							self.setOptions(options);
								
							apps.each(function(app){
								//console.log('app');
								//console.log(app);
								self[app.id] = ko.observable(null);
							});
							
							self.breadcrumbs = ko.observableArray([
								{label: 'dashboard', href: '/dashboard'},
								{label: 'second', href: '/dashboard/more'}
							]); 
							
						}
					});
					
					//mainBodyModel = new viewModel();
					
					var Page = new Class({
						Implements: [Options, Events],
						
						JS_LOADED: 'jsLoaded',
						STARTED: 'started',
						
						options: {
							assets: {
								js: {
									//ko: "/public/bower/knockoutjs/dist/knockout.js",
									//jQuery: "/public/bower/jquery/dist/jquery.min.js",
									////pager: "/public/bower/pagerjs/dist/pager.min.js",
									////history: "/public/bower/history.js/scripts/bundled/html4+html5/jquery.history.js"
								},
								css: {
									
								}
							},
						},
						
						initialize: function(options){
							var self = this;
							
							self.setOptions(options);

							//console.log('assets');
							//console.log(this.options.assets.css);
							
							self.addEvent(self.JS_LOADED+'_ko', function(){
								console.log('self.JS_LOADEDko');
								
								//mainBodyModel = new MainModel();
								//self.fireEvent(self.STARTED, mainBodyModel);
							});
							
							self.addEvent(self.JS_LOADED+'_jQuery', function(){
								self.load_js({pager: "/public/bower/pagerjs/dist/pager.min.js"});
							});
							
							self.addEvent(self.JS_LOADED+'_pager', function(){
								self.load_js({history: "/public/bower/history.js/scripts/bundled/html4+html5/jquery.history.js"});
							});
							
							self.addEvent(self.JS_LOADED+'_history', function(js){
								
								//console.log('self.JS_LOADEDhistory');
								
							});
							
							
							if(this.options.assets){
								
								if(this.options.assets.css){
									self.load_css(this.options.assets.css);
								}
								if(this.options.assets.js){
									self.load_js(this.options.assets.js);
								}
							}
							
							mainBodyModel = new MainModel();
							// use HTML5 history
							pager.useHTML5history = true;
							// use History instead of history
							pager.Href5.history = History;

							//console.log('login');
							//console.log(mainBodyModel.login());
							
							// extend your view-model with pager.js specific data
							pager.extendWithPage(mainBodyModel);
							
							ko.applyBindings(mainBodyModel, document.getElementById("main-body"));
							pager.startHistoryJs();
							
							
							console.log('main-body binding applied');
						},
						load_css: function(assets){
							var self = this;
							Object.each(assets, function(css, id){
									
								 var css = Asset.css(css, {
									 id: id,
									 onLoad: function(){
										 self.fireEvent(self.CSS_LOADED+'_'+id, js);
										 self.fireEvent(self.CSS_LOADED, {id: id, js: js});
									 }
								 });
							});
						},
						load_js: function(assets){
							var self = this;
							Object.each(assets, function(js, id){

								 var js = Asset.javascript(js, {
									 id: id,
									 onLoad: function(){
										 self.fireEvent(self.JS_LOADED+'_'+id, js);
										 self.fireEvent(self.JS_LOADED, {id: id, js: js});
									 },
								 });
							});
						},
						
						navigate: function(){
						},
						//apply: function(){
							
						//}
					});
		
					var root_page = new Page();
					
							
				});
			});
			
			
	});
	
	head.ready(document, function() {
		head.js({ bootstrap: "/public/bower/gentelella/vendors/bootstrap/dist/js/bootstrap.min.js" });
		//head.js({ fastclick: "/public/bower/gentelella/vendors/fastclick/lib/fastclick.js" });
		//head.js({ nprogress: "/public/bower/gentelella/vendors/nprogress/nprogress.js" });
		head.js({ gentelella: "/public/bower/gentelella/build/js/custom.min.js" });
	});

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
