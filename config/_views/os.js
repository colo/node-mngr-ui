var PouchDB = require('pouchdb'),
		path = require('path');

var db = new PouchDB(path.join(__dirname,'../../../pouchdb/dashboard'));
		
db.info().then(function (info) {
	console.log(info);
})
		
// create a design doc
var ddoc = {
  _id: '_design/os',
  views: {
    info: {
      map: function info(doc) {
				if (doc._id.includes('.os@') && doc.data_type == 'info') {
					var id = doc._id.split('.os@');//get host | timestamp
					var host = id[0];
					var date = new Date();
					date.setTime(id[1]);
					
					var date_arr = [
						date.getFullYear(),
						date.getMonth() + 1,
						date.getDate(),
						date.getHours(),
						date.getMinutes(),
						date.getSeconds()
					];
					
					emit([host, date_arr], null);
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
	
	//return db.query('os/info', {
		//key     : ["localhost.colo",[2016,7,26,22,53,11]],
  //});
  
  
  /**
   * all from one host
   * 
   * */
  //return db.query('os/info', {
		//startkey     : ['localhost.colo'],
		//endkey       : ['localhost.colo\uffff'],
  //});
  
  /**
   * last from one host (reverse star & end keys)
   * 
   * */
  return db.query('os/info', {
		startkey     : ['localhost.colo\uffff'],
		endkey       : ['localhost.colo'],
		limit: 1,
		descending: true
  });
  
  /**
   * one host - range from date
   * 
   * */
	//return db.query('os/info', {
		//startkey     : ["localhost.colo",[2016,7,26,0,0,0]],
		//endkey       : ["localhost.colo",[2016,7,27,23,59,59]],
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
		//startkey     : ["localhost",[2016,7,26,0,0,0]],
		//endkey       : ["localhost\uffff",[2016,7,27,23,59,59]],
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
	console.log(result);
  // handle result
}).catch(function (err) {
  console.log(err);
});
