var loginBodyModel = {};
head.js({ crypto: "/public/apps/login/bower/cryptojslib/rollups/sha1.js" }); //no dependencies


/* head.load([
	{ ko: "/public/bower/knockoutjs/dist/knockout.js" },//no dependencies
	{ resilient: "/public/apps/login/bower/resilient/resilient.min.js" }//no dependencies
]
*/
head.ready('history'
, function() {

	/*
   $(".input input").focus(function() {

      $(this).parent(".input").each(function() {
         $("label", this).css({
            "line-height": "18px",
            "font-size": "18px",
            "font-weight": "100",
            "top": "0px"
         })
         $(".spin", this).css({
            "width": "100%"
         })
      });
   }).blur(function() {
      $(".spin").css({
         "width": "0px"
      })
      if ($(this).val() == "") {
         $(this).parent(".input").each(function() {
            $("label", this).css({
               "line-height": "60px",
               "font-size": "24px",
               "font-weight": "300",
               "top": "10px"
            })
         });

      }
   });

   $(".button").click(function(e) {
      var pX = e.pageX,
         pY = e.pageY,
         oX = parseInt($(this).offset().left),
         oY = parseInt($(this).offset().top);

      $(this).append('<span class="click-efect x-' + oX + ' y-' + oY + '" style="margin-left:' + (pX - oX) + 'px;margin-top:' + (pY - oY) + 'px;"></span>')
      $('.x-' + oX + '.y-' + oY + '').animate({
         "width": "500px",
         "height": "500px",
         "top": "-250px",
         "left": "-250px",

      }, 600);
      $("button", this).addClass('active');
   })

   $(".alt-2").click(function() {
      if (!$(this).hasClass('material-button')) {
         $(".shape").css({
            "width": "100%",
            "height": "100%",
            "transform": "rotate(0deg)"
         })

         setTimeout(function() {
            $(".overbox").css({
               "overflow": "initial"
            })
         }, 600)

         $(this).animate({
            "width": "140px",
            "height": "140px"
         }, 500, function() {
            $(".box").removeClass("back");

            $(this).removeClass('active')
         });

         $(".overbox .title").fadeOut(300);
         $(".overbox .input").fadeOut(300);
         $(".overbox .button").fadeOut(300);

         $(".alt-2").addClass('material-buton');
      }

   })

   $(".material-button").click(function() {

      if ($(this).hasClass('material-button')) {
         setTimeout(function() {
            $(".overbox").css({
               "overflow": "hidden"
            })
            $(".box").addClass("back");
         }, 200)
         $(this).addClass('active').animate({
            "width": "700px",
            "height": "700px"
         });

         setTimeout(function() {
            $(".shape").css({
               "width": "50%",
               "height": "50%",
               "transform": "rotate(45deg)"
            })

            $(".overbox .title").fadeIn(300);
            $(".overbox .input").fadeIn(300);
            $(".overbox .button").fadeIn(300);
         }, 700)

         $(this).removeClass('material-button');

      }

      if ($(".alt-2").hasClass('material-buton')) {
         $(".alt-2").removeClass('material-buton');
         $(".alt-2").addClass('material-button');
      }

   });
	*/
		 
	var LoginModel = function(){
		//Cookie.options = {domain : '192.168.0.80:8080'};
			
		//var error = Cookie.read('bad') || false;
		
		self = this;
		
	 	//self.clearpasswordname = Math.random().toString(36).substring(7);
		
		//self.error = ko.observable(error);
		
		//self.name = "Hola";
		
		self.clearpassword = ko.observable();
		
		self.password = ko.observable(null);
		
		self.submit = function(form){
			console.log(form.clearpassword.value);
			
			//console.log(self.clearpassword());
			
			var hash = CryptoJS.SHA1(form.clearpassword.value);
	 	  console.log(hash.toString());
			
			self.password(hash.toString());
			
	 	  //console.log(self.password());
			
			//form.clearpassword.value = "";
			
			//console.log(window.location.host);
			
			var servers = [
				window.location.protocol+'//'+window.location.host
			];
			var client = resilient({
				 service: { 
					 basePath: '/login/api',
					 headers : { "Content-Type": "application/json" },
					 data: { "username": form.username.value, "password": form.password.value }
				 }
			 });
			client.setServers(servers);
			

			client.post('/', function(err, res){
				if(err){
					console.log('Error:', err);
					console.log('Response:', err.data);
				}
				else{
					console.log('Ok:', res);
					console.log('Body:', res.data);
					//window.location.assign(res.headers.Link.split(';')[0]);
					window.location.replace(res.headers.Link.split(';')[0].replace(/<|>/g, ''));
				}
			});
	
			return false;//don't submit
		};
  };
  
  //mainBodyModel.apps.push('login');
  
  if(mainBodyModel.login() == null){
		
		mainBodyModel.login(new LoginModel());
		
	}
	
  /*
	mainBodyModel.login = new LoginModel();
	
	ko.cleanNode(document.getElementById("main-body"));
	ko.applyBindings(mainBodyModel, document.getElementById("main-body"));
	*/
	
  //mainBodyModel = {
		//login: new LoginModel()
	//}
	
	//ko.applyBindings(loginBodyModel, document.getElementById("loginBodyModel"));
	console.log('Login binding applied');
	
  //head.ready('pager', function(){
		//var page = new pager.Page();
		//loginBodyModel['$__page__'] = page;

		//ko.applyBindings(loginBodyModel, document.getElementById("loginBodyModel"));
	//});
  
		
});

