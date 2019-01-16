var request = require('request')
const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.json')
const db = low(adapter)

var plugState = [0,0]
db.defaults({
   plugGauche: {
      info: {},
      data: []
   },
   plugDroite: {
      info: {},
      data: []
   }
}).write()


function checkPlugs() {
   var postData = "requestTypeId=3&searchText=&mapCenterPntLat=0&mapCenterPntLng=0&mapWidth=468&mapHeight=500&userPositionLatLng%5B%5D=46.5534&userPositionLatLng%5B%5D=6.5508&mapBounds%5B%5D=46.779811221035025&mapBounds%5B%5D=6.661203091169796&mapBounds%5B%5D=46.77797440244823&mapBounds%5B%5D=6.658692543531856&authTypes%5B%5D=1&authTypes%5B%5D=4&authTypes%5B%5D=1&authTypes%5B%5D=3&authTypes%5B%5D=5&authTypes%5B%5D=2&plugTypes%5B%5D=0&plugTypes%5B%5D=1&plugTypes%5B%5D=6&plugTypes%5B%5D=7&plugTypes%5B%5D=10&plugTypes%5B%5D=3&plugTypes%5B%5D=4&plugTypes%5B%5D=2&plugTypes%5B%5D=5&plugTypes%5B%5D=8&plugTypes%5B%5D=9&accessibilityTypeId=0&minPower=2&reqCsId="
   request.post({
      headers: {
         'Content-Length': postData.length,
         'Content-Type': 'application/x-www-form-urlencoded'
      },
      url: 'https://www.evpass.ch/ChargingStation/GetChargingStationOnMap',
      body: postData
   }, function (error, response, body) {
      if (!error) {
         var data = JSON.parse(body).response

         var plugDroite = data.chargingstations[0].Plugs[0]
         var plugGauche = data.chargingstations[0].Plugs[2]
         if(plugState[1] != plugDroite.StatusId){
            plugState[1] = plugDroite.StatusId
            addState(1, plugDroite.StatusId)
         }
         if(plugState[0] != plugGauche.StatusId){
            plugState[0] = plugGauche.StatusId
            addState(0, plugGauche.StatusId)
         }
      }
      else{
         console.log(error)
      }
   });
}

function addState(id, status) {
   switch (id) {
      case 0:
         db.get("plugGauche.data").push({
            time: Date.now(),
            status: status
         }).write()
         break;
      case 1:
         db.get("plugDroite.data").push({
            time: Date.now(),
            status: status
         }).write()
         break;
      default:
         break;
   }
}

setInterval(checkPlugs, 10000);
