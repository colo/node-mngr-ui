var PouchDB = require('pouchdb'),
		path = require('path'),
		jsonfile = require('jsonfile');

var db = new PouchDB(path.join(__dirname,'../../../pouchdb/dashboard'));
		
db.info().then(function (info) {
	console.log(info);
})
		
// create a design doc
var ddoc = {
  _id: '_design/info',
  views: {
		by_date: {
      map: function info(doc) {
				if (doc.metadata.type == 'info') {
					//var id = doc._id.split('@');//get host.path | timestamp
					//var host = doc.metadata.domain +'.'+doc.metadata.host;
					//var date = parseInt(id[1]);
					//var date = new Date();
					//date.setTime(id[1]);
					
					//var date_arr = [
						//date.getFullYear(),
						//date.getMonth() + 1,
						//date.getDate(),
						//date.getHours(),
						//date.getMinutes(),
						//date.getSeconds()
					//];
					var host = doc.metadata.domain +'.'+doc.metadata.host;
					
					if(!doc.metadata.timestamp){
						var id = doc._id.split('@');//get host.path | timestamp
						var date = parseInt(id[1]);
					}
					else{
						var date = parseInt(doc.metadata.timestamp);
					}
					
					emit([date, host], null);
				}
      }.toString()
    },
    by_host: {
      map: function info(doc) {
				if (doc.metadata.type == 'info') {
					//var id = doc._id.split('@');//get host.path | timestamp
					//var host = id[0];
					//var date = parseInt(id[1]);
					var host = doc.metadata.domain +'.'+doc.metadata.host;
					
					if(!doc.metadata.timestamp){
						var id = doc._id.split('@');//get host.path | timestamp
						var date = parseInt(id[1]);
					}
					else{
						var date = parseInt(doc.metadata.timestamp);
					}
					
					emit([host, date], null);
				}
      }.toString()
    }
  }
}

var ddoc_status = {
  _id: '_design/status',
  views: {
		by_date: {
      map: function status(doc) {
				if (doc.metadata.type == 'status') {
					//var id = doc._id.split('@');//get host.path | timestamp
					//var host = id[0];
					//var date = parseInt(id[1]);
					var host = doc.metadata.domain +'.'+doc.metadata.host;
					
					if(!doc.metadata.timestamp){
						var id = doc._id.split('@');//get host.path | timestamp
						var date = parseInt(id[1]);
					}
					else{
						var date = parseInt(doc.metadata.timestamp);
					}
					
					emit([date, host], null);
				}
      }.toString()
    },
    by_host: {
      map: function status(doc) {
				if (doc.metadata.type == 'status') {
					//var id = doc._id.split('@');//get host.path | timestamp
					//var host = id[0];
					//var date = parseInt(id[1]);
					var host = doc.metadata.domain +'.'+doc.metadata.host;
					
					if(!doc.metadata.timestamp){
						var id = doc._id.split('@');//get host.path | timestamp
						var date = parseInt(id[1]);
					}
					else{
						var date = parseInt(doc.metadata.timestamp);
					}
					
					emit([host, date], null);
				}
      }.toString()
    }
  }
}
// save the design doc
db.put(ddoc).catch(function (err) {
  if (err.name !== 'conflict') {
    throw err;
  }
  // ignore if doc already exists
}).then(function () {
	
	/**
	* educativa
	* 1469639288755
	* 1469639314750
	* */
	
	/** 
	 * casa
	 * 1469675114071
	 * 1469675132205
	 * */
	
	return db.query('info/by_host', {
		startkey: ["localhost.colo\ufff0"],
		endkey: ["localhost.colo"],
		limit: 1,
		descending: true,
		inclusive_end: true,
		include_docs: true
  });
   
	//return db.query('info/by_date', {
		//startkey: [1469675114071, "localhost.server", "os"],
		//endkey: [1469675114071, "localhost.server\ufff0", "os.mounts\ufff0"],
		////inclusive_end: true
		//include_docs: true
  //});
	
	//return db.query('os/by_date', {
		////startkey: [1469639314750, "com.example.server"],
		////endkey: [99999999999999, "com.example.server"],
		////inclusive_end: true
  //});
  
  //return db.query('os/by_host', {
		//startkey: "1469584391932",
		//endkey: "1469586311057",
		////inclusive_end: true
  //});
  
  //return db.query('os/info', {
		//startkey     : ["", [2015,7,27,14,8,34]],
		//endkey       : [{}, "\uffff"],
  //});
  /**
   * all from one host
   * 
   * */
  //return db.query('os/info', {
		//startkey     : ['localhost.colo'],
		//endkey       : ['localhost.colo\uffff'],
  //});
  /** OR */
  //return db.query('os/info', {
		//startkey     : ['localhost.colo'],
		//endkey       : ['localhost.colo', {}],
  //});
  
  /**
   * last from one host (reverse star & end keys)
   * 
   * */
  //return db.query('os/info', {
		//startkey     : ['localhost.colo\uffff'],
		//endkey       : ['localhost.colo'],
		//limit: 1,
		//descending: true
  //});
  
  /**
   * one host - range from date
   * 
   * */
	//return db.query('os/info', {
		//startkey     : ["localhost.colo",[2016,7,27,14,8,0]],
		//endkey       : ["localhost.colo",[2016,7,27,14,8,34]],
		////inclusive_end: true
    ////include_docs: true
  //});
  
  
  /**
   * all from one domain
   * 
   * */
  //return db.query('os/info', {
		//startkey     : ['localhost'],
		//endkey       : ['localhost\uffff'],
  //});
  
  /**
   * one domain - range from date
   * 
   * */
	//return db.query('os/info', {
		//startkey     : ["localhost",[2016,7,27,14,8,34]],
		//endkey       : ["localhost\uffff",[2016,7,27,14,8, 0]],
		////inclusive_end: true
    ////include_docs: true
  //});
  
  /**
   * all domains - range from date
   * 
   * */
	//return db.query('os/info', {
		//startkey     : ["",[2016,7,26,0,0,0]],
		//endkey       : ["\uffff",[2016,7,27,23,59,59]],
		////inclusive_end: true
    ////include_docs: true
  //});
  
}).then(function (result) {
	
	//console.log(result);
	//result.rows.forEach(function(row){
		//delete row.doc._rev;
		//jsonfile.writeFileSync(path.join(__dirname,'./test/info/',row.doc._id), row.doc);
		////console.log(row.doc);
	//});
  
  result.rows.forEach(function(row){
		console.log(row.key);
	});
}).catch(function (err) {
  console.log(err);
});
