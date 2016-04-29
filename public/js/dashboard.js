head.js({ mdl: "/public/mdl/material.min.js" }); //no dependencies

/**
 *  @pager
 * 
 * */
//head.js({ ko: "/public/bower/knockoutjs/dist/knockout.js" }); //no dependencies
//head.js({ jQuery: "/public/bower/jquery/dist/jquery.min.js" }); //no dependencies
head.load([
	{ ko: "/public/bower/knockoutjs/dist/knockout.js" },
	{ jQuery: "/public/bower/jquery/dist/jquery.min.js" }
], function(){
		
		head.load({ pager: "/public/bower/pagerjs/dist/pager.min.js" });
		
});

