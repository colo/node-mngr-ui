var loginBodyModel = {};

head.js({ mdl: "/public/mdl/material.min.js" }); //no dependencies
head.js({ mootools: "/public/apps/login/mootools-core-1.4.5-full-nocompat-yc.js" }); //no dependencies
head.js({ crypto: "/public/apps/login/bower/cryptojslib/rollups/sha1.js" }); //no dependencies

//head.js({ jQuery: "/public/bower/jquery/dist/jquery.min.js" }); 
head.load([
	{ ko: "/public/bower/knockoutjs/dist/knockout.js" },//no dependencies
	{ jQuery: "/public/bower/jquery/dist/jquery.min.js" }//no dependencies
], function() {

	/**
	 * styling
	 * 
	 * */
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
		/**
		 * finish styling
		 * */
		 
	var LoginModel = function(){
		//Cookie.options = {domain : '192.168.0.80:8080'};
			
		var error = Cookie.read('bad') || false;
		//console.log('cookie: ');
		//console.log(error);
		//console.log(document.cookie);

		self = this;
		
	 	//self.clearpasswordname = Math.random().toString(36).substring(7);
		
		self.error = ko.observable(error);
		
		self.clearpassword = ko.observable();
		
		self.password = ko.observable(null);
		
		self.crypt = function(form){
			//console.log(form.clearpassword.value);
			
			//console.log(self.clearpassword());
			
			var hash = CryptoJS.SHA1(form.clearpassword.value);
	 	  //console.log(hash.toString());
			
			self.password(hash.toString());
			
	 	  //console.log(self.password());
			
			form.clearpassword.value = "";
			return true;
		};
  };
  
  loginBodyModel = {
		login: new LoginModel()
  }
  
  ko.applyBindings(loginBodyModel, document.getElementById("main-body"));
		
});




