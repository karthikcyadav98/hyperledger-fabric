/*'use strict';
const testContract = require('./chaincode');
module.export.contracts = [testContract];*/

'use strict';

const FabCar = require('./chaincode');

module.exports.FabCar = FabCar;
module.exports.contracts = [ FabCar ];
