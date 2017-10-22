'use strict'

var http_client = require('node-app-http-client');

module.exports = new Class({
  Extends: http_client,
  
  options: {
	  
	  //scheme: 'http',
	  //url:'127.0.0.1',
	  //port: 8081,
	  
	  logs: { 
			path: './logs' 
		},
		
	  /*requests : {
			info: [
				{ api: { get: {uri: ''} } },
			],
			status: [
				{ api: { get: {uri: ''} } },
			],
			
		},*/
		
		routes: {
		},
		
		jar: true,
		
		/*authentication: {
			username: 'lbueno',
			password: '123',
			sendImmediately: true,
		},
		
		authorization: {
			config: path.join(__dirname,'./config/rbac.json'),
		},*/
		
		
		api: {
			
			version: '1.0.0',
			
			path: '/nginx/vhosts',
			
			routes: {
				get: [
					{
						path: ':uri',
						callbacks: ['get'],
						version: '',
					},
					{
						path: '',
						callbacks: ['get'],
						version: '',
					},
				]
			},
			
		},
  },
  get: function (err, resp, body, req){
		console.log('NGINX VHOSTS get');
		//console.log(this.options.requests.current);
		
		if(err){
			console.log(err);
			
			if(req.uri != ''){
				this.fireEvent('on'+req.uri.charAt(0).toUpperCase() + req.uri.slice(1)+'Error', err);//capitalize first letter
			}
			else{
				this.fireEvent('onGetError', err);
			}
			
			//this.fireEvent(this.ON_DOC_ERROR, err);
			
			/*if(this.options.requests.current.type == 'info'){
				this.fireEvent(this.ON_INFO_DOC_ERROR, err);
			}
			else{
				this.fireEvent(this.ON_STATUS_DOC_ERROR, err);
			}*/
		}
		else{
			//console.log('success');
			//console.log(JSON.decode(body));
			
			if(req.uri != ''){
				this.fireEvent('on'+req.uri.charAt(0).toUpperCase() + req.uri.slice(1), JSON.decode(body));//capitalize first letter
			}
			else{
				this.fireEvent('onGet', body);
			}
			
			//this.fireEvent(this.ON_DOC, JSON.decode(body));
			
			/*if(this.options.requests.current.type == 'info'){
				this.fireEvent(this.ON_INFO_DOC, JSON.decode(body));
			}
			else{
				//var original = JSON.decode(body);
				//var doc = {};
				
				//doc.loadavg = original.loadavg;
				//doc.uptime = original.uptime;
				//doc.freemem = original.freemem;
				//doc.totalmem = original.totalmem;
				//doc.cpus = original.cpus;
				//doc.networkInterfaces = original.networkInterfaces;
				
				this.fireEvent(this.ON_STATUS_DOC, JSON.decode(body));
				
				//console.log('STATUS');
			}*/
			
			
		}
		
  },
  /*get: function (err, resp, body, req){
		console.log('NGINX VHOSTS get');
		
		console.log('error');
		console.log(err);
		
		//console.log('resp');
		//console.log(resp);
		
		console.log('body');
		console.log(body);
  },*/
  initialize: function(options){
		
		this.parent(options);//override default options
		
		this.log('nginx-vhosts', 'info', 'nginx-vhosts started');
  },
});

