
head.ready('history'
, function() {
	
	var OSUsersModel = new Class({
		Implements: [Options, Events],
		
		options : {
		},
		
		initialize: function(options){
			
			this.setOptions(options);
			this.key = "value";
			
		}
	});
	
	var OSUsersPage = new Class({
		Extends: Page,
		
		initialize: function(options){
							
			this.parent(options);
			this.model = new OSUsersModel();
			
			if(mainBodyModel.os_users() == null){
		
				mainBodyModel.os_users(this.model);
				
				console.log('os_users binding applied');
				//componentHandler.upgradeDom();
			}
			
		}
		
	});
										
	var os_users_page = new OSUsersPage();
	
	
});
