# Prestan
#### A node module to interact and consume the PrestaShop shop API.

## Example
``` JavaScript
var Prestan = require('prestan'),
    prestan = new Prestan('http://myPrestaShopSiteUrl.com', 'MYAPIKEY000000');

prestan.get('orders').then(function(response) {
    console.log(response);
}).catch(function(errors) {
    console.log(errors);
});

//Or

prestan.get('orders', {id: 1}).then(function(response) {
    console.log(response);
}).catch(function(errors) {
    console.log(errors);
});

//And you can even use the filter querystrings

prestan.get('orders', {
    'display': 'full',
    'filter[id]': 1
}).then(function(response) {
    console.log(response);
}).catch(function(errors) {
    console.log(errors);
});
```