import React, { Component } from 'react';
import scriptLoader from 'react-async-script-loader';
import List from './List.js';
import escapeRegExp from 'escape-string-regexp'
import './App.css';
import relode from './images/relode.png';

// Get Locations From FourSquar API
var foursquare = require('react-foursquare')({
  clientID: 'PEEZ12FJCFW01QSIIAB1LYP24CDJ0ZCJUDUVQKRFYRQKEZLG',
  clientSecret: 'E3M5OUVJGXF45JGXLGLQCOHBGLYOWT2QWI2ADV2OZNFIMTWN'  
});

var params = {
  "ll": "25.6872431,32.6396357",
  "query": 'restaurant'
};

// https://stackoverflow.com/questions/41709765/how-to-load-the-google-maps-api-script-in-my-react-app-only-when-it-is-require

class App extends Component {
  constructor(props) {
    super(props);

  }


state={
mapError: false,
query:'',
markers:[],
locations: []

}

  
componentWillReceiveProps({isScriptLoaded,isScriptLoadSucceed}){
  
  if (isScriptLoaded && !this.props.isScriptLoaded) {  //Loud the map
    if (isScriptLoadSucceed) {
      
        var map = new window.google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: {lat: 25.6872431, lng: 32.6396357}
        });
   
       
//Udacity (ud864-master)
//----------------------

          let largeInfowindow = new window.google.maps.InfoWindow(),
              highlightedIcon = makeMarkerIcon('FFFF24'),// new color
              bounds = new window.google.maps.LatLngBounds();
          var restaurantsList=document.querySelectorAll('li');
         
          foursquare.venues.getVenues(params)
          .then(res=> {
            this.setState({ locations: res.response.venues })
            ;
          
          
        for(let i=0; i<this.state.locations.length; i++) {
          
                let position= this.state.locations[i].location,
                    title= this.state.locations[i].name;
           
                let marker = new window.google.maps.Marker({
                    map: map,
                    position: position,
                    title: title,
                    animation: window.google.maps.Animation.DROP,
                });            
       
              this.state.markers.push(marker);
       
        //--- When click popup info window

        marker.addListener('click', function() {
         populateInfoWindow(this, largeInfowindow);
        });
      
        //--- When click change color of marker

        marker.addListener('click', function() {
          this.setIcon(highlightedIcon);
        });
        
        //--- When click focus the same name in list

         marker.addListener('click', function() {
           checkInList(this.title);
        });


         bounds.extend(this.state.markers[i].position);
      }
      map.fitBounds(bounds);
   }
  )};
  
    function populateInfoWindow(marker, infowindow) {

      if (infowindow.marker !== marker) {
        infowindow.marker = marker;
        infowindow.setContent('<div>' + marker.title + '</div>');
        infowindow.open(map, marker);
       
        //make marker bounce
        marker.setAnimation(window.google.maps.Animation.BOUNCE);
               setTimeout(function(){ marker.setAnimation(null); }, 750);
       
        infowindow.addListener('closeclick',function(){
          infowindow.setMarker = null;
        });
      }
  }
 
    function makeMarkerIcon(markerColor) {
      var markerImage = new window.google.maps.MarkerImage(
        'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
        '|40|_|%E2%80%A2',
        new  window.google.maps.Size(21, 34),
        new  window.google.maps.Point(0, 0),
        new  window.google.maps.Point(10, 34),
        new  window.google.maps.Size(21,34));
      return markerImage;
    }

     //--- function to focus the name of clicked marker in the list of restaurants

     function checkInList(title) {
      restaurantsList.forEach(function(item){
        if(item.innerHTML === title){
          item.className = 'active' ;
            setTimeout(function(){
              item.className='item_name';
                },2000);  
              } 
            }); 
          }
          
    }else{
      alert(" Map is not loading.. Check your connection ") // handel error when map doesn't load
      }
   }

//--- function to focus marker when click the list

focusMarker= (listItem)=>{
  console.log(listItem)
    let newMarker=this.state.markers
      newMarker.map(marker=>{
        if(marker.title === listItem.innerHTML) {
          console.log('mached')
            window.google.maps.event.trigger(marker,'click');    
        }else{
          console.log('not matched')
      }
    })
          console.log(listItem);
  }
//  filter markers when user enter new value

 updateQuery=(query)=>{
           let filteredMarkers;
           this.setState({ query: query }, () => {
                if(this.state.query !== '') {
                   const match = new RegExp(escapeRegExp(this.state.query), 'i');

                       filteredMarkers = this.state.markers.filter((m)=> match.test(m.title))
                       .map((marker)=> marker.setVisible(true));
                          console.log(this.state.markers);
                          console.log(filteredMarkers);

                                  
                       filteredMarkers = this.state.markers.filter((m)=> ! (match.test(m.title)))
                       .map((marker)=> marker.setVisible(false));
                          console.log(this.state.markers);
                          console.log(filteredMarkers);
                  }else{

                       this.state.markers.map((marker)=> marker.setVisible(true));
                }
            })

         }
        

 
render(){
 
    return(
      <div>
      
       <div className='container' role='main'>
       
            <List
            setMarker={this.populateInfoWindow} 
            locations={this.state.locations}
            markers={this.state.markers}
            focus={this.focusMarker}
            query={this.state.query}
            onUpdateQuery={this.updateQuery}
           
            />
          <div id="map" role='application'>{
              this.state.mapError?
                <div id='map-error' role='alert'>
                  Google Map did not load.. (ERROR)check your connection
                    </div>
                      :<div className="loading-map">
                        <h4 className="loading-message">Map is loading...</h4>
                          <img src={relode} className="relode" alt="loading indicator" />
                            </div>
          }</div>
        </div>
        <footer></footer>

      </div>
    )
  }
}

export default scriptLoader(
["https://maps.googleapis.com/maps/api/js?key=AIzaSyDrb41GQ4AvQu6fzITuhh2BraPokBzmNhI&v=3"]
)(App)
