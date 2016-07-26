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
					var id = doc._id.split('.os@')[1];//get host | timestamp
          emit([id[0], id[1]], doc);
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
  // find docs where title === 'Lisa Says'
  return db.query('info', {
    key: 'localhost.colo',
    //include_docs: true
  });
}).then(function (result) {
  // handle result
}).catch(function (err) {
  console.log(err);
});
