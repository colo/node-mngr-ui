
head.ready('history'
, function() {
	
	var TestModel = new Class({
		Implements: [Options, Events],
		
		options : {
		},
		
		initialize: function(options){
			
			this.setOptions(options);
			this.key = "value";
			
		}
	});
	
	var TestPage = new Class({
		Extends: Page,
		
		initialize: function(options){
							
			this.parent(options);
			this.model = new TestModel();
			
			if(mainBodyModel.test() == null){
		
				mainBodyModel.test(this.model);
				
				console.log('test binding applied');
				//componentHandler.upgradeDom();
			}
			
		}
		
	});
										
	var test_page = new TestPage();
	
	
});
