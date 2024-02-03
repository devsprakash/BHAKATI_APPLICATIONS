
const Temple = require('../../models/Temple.model');


exports.templeSave = (data) => Temple(data).save();