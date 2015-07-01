# Prestan
#### A node module to interact and consume the PrestaShop shop API.

## Example
```
var Prestan = require('prestan');

var prestan = new Prestan('http://myshop.co.uk', 'MYAPIKEY');

prestan.get('categories', {id: 1}).then(function(response) {
	console.log(response);
}).catch(function(error) {
	console.log(error);
});
```