import React, { Component } from 'react';
import './App.css';
import List from './List';
import scriptLoader from 'react-async-script-loader';
import fetchJsonp from 'fetch-jsonp';
import escapeRegExp from 'escape-string-regexp';

let pins = [];
let infoW = [];
/*
 * Next variables have to do
 * with the images of the markers (pins)
 */ 
let DefaultIcon = 'http://chart.googleapis.com/chart?chst=d_map_spin&chld=.75|0|BA55D3|20|_|%E2%80%A2'
let ChangeIcon ='http://chart.googleapis.com/chart?chst=d_map_spin&chld=.75|0|FFD700|20|_|%E2%80%A2'

/* export the app module*/
class App extends Component {
  constructor(props) {
    /* access this.props in constructor by using super*/
    super(props);
    /* spots I picked for surfing (they are mostly for wind-surfing!) */
    this.state = {
      locations : require('./places.json'),
      map: {},
      query: '',
      requestWasSuccessful: true,
      data: []
    }
  }

  /* This updates the data by getting info from the API */
  updateData = (newData) => {
    this.setState( {
      data:newData
    });
  }

  /* Updates the existing query */
  updateQuery = (query)=> {
    this.setState({query:query.trim()});
  }

  /* 
   * Now that props are passed to the Component instance,
   * it is about time for this function to do its magic
   */
  componentWillReceiveProps({isScriptLoadSucceed}) {
    /* Making sure the script is loaded */
    if (isScriptLoadSucceed) {
      /* Creating the initial's map location */
      const map = new window.google.maps.Map(this.refs.map, {
        zoom: 11,
        /* General location of Naxos island */
        center: new window.google.maps.LatLng(37.06904, 25.35473),
      });
    this.setState({map:map});
  
    /* handle the error if the maps is not loaded */
    } else {
      alert('GoogleMaps error!');
      /* Handle the error - I hope I won't get any */
      this.setState({requestWasSuccessful: false})
    }
  }

  /* 
   * Interaction with markers!!
   * Also, use of infoWindows to display wikipedia's info for each location.
   * I know, the spots I picked are not that famous via wikipedia
   * and only a couple of them has wiki links.
   * But my goal was to have data from 3rd parties.
   */
  updateMarkers(map, showLocations) {
    showLocations.forEach((marker, index) => {
      /* Taking data from wikipedia */
      /* Firstly handle if no contents are being found when using the marker */
      let getData = this.state.data.filter((single) => marker.title === single[0][0]).map(item2 => {
          if (item2.length === 0)
            return 'No Contents Available in Wikipedia, Please search manually via Google'
          else if (item2[1] !=='')
            return item2[1]
          if (item2[3] > 3)
            return item2[2]
          if (item2[2] >2)
            return item2[1]
          else
            return 'No Contents Available in Wikipedia, Please search manually via Google'
        })
      /* 
       * Also, direct user to search via google
       * if no content of location have been found
       */
      let getLink = this.state.data.filter((single) => marker.title === single[0][0]).map(item2 => { 
          if (item2.length === 0)
            return 'https://www.google.com'
          else if (item2[1] !=='')
            return item2[2]
          if (item2[3] > 3)
            return item2[2]
          if (item2[2] >2)
            return item2[1]
          else
            return 'https://www.google.com'
        })

      /*
       * The maxWidth is added so that
       * the infoWindow fits the page.
       * InfoWindow is where the data will be displayed
       */
      let addInfoWindow = new window.google.maps.InfoWindow({
           maxWidth: 200
      });
     
      /* 
       * I put some aria code in infoWindow
       * plus how they 'll be displayed
       * with content and everything
       */  
      addInfoWindow.setContent(`<div tabIndex = "0">
        <h3>${marker.title}</h3>
        <p>${getData}</p>
        <a href = ${getLink}>To learn more, click here</a>
      </div>`)

      /* how the markers will be displayed */
      /* Defining the marker object */
      let addmarker = new window.google.maps.Marker( {
        map: map,
        position: marker.location,
        animation: window.google.maps.Animation.DROP,
        icon: DefaultIcon,
        name : marker.title });

      pins.push(addmarker);
      infoW.push(addInfoWindow);
      /* Set eventListener for marker */
      addmarker.addListener('click', function() {
       /* Closes windows before open the other */
        infoW.forEach(Windows => { Windows.close()
        });
        addInfoWindow.open(map, addmarker);
        this.setIcon(ChangeIcon);
        if (this.getAnimation() !== null) {
         this.setAnimation(null);
        } else {
          /* Add animation when the marker is clicked */
          addmarker.setAnimation(window.google.maps.Animation.BOUNCE);
        }
        setTimeout(() => {this.setIcon(DefaultIcon);
          addmarker.setAnimation(null);}, 1000)
      })
    });
  }

  /* 
   * Interacting with the Native UI
   */ 
  componentDidUpdate() {
    const {locations, query} = this.state;
    let showLocations = locations
    if (query) {
      const match = new RegExp(escapeRegExp(query),'i')
      showLocations = locations.filter((location) => match.test(location.title))
    } else {
      showLocations = locations
    }
  
    pins.forEach(mark => { mark.setMap(null) });
    pins = [];
    this.updateMarkers(this.state.map,showLocations)
  }    
  
  /*
   * Doing ajax requests for wikipedia by
   * putting the location's tilte to be searched
   */
  componentDidMount() {
    window.gm_authFailure = this.gm_authFailure;
    this.state.locations.map((location, index) => {
      return fetchJsonp(`https://en.wikipedia.org/w/api.php?action=opensearch&search=${location.title}&format=json&callback=wikiCallback`)
      .then(response => response.json()).then((responseJson) => {
        let newData = [...this.state.data, [responseJson, responseJson[2][0], responseJson[3][0]]]
        this.updateData(newData)
      }).catch(function(error) {
  console.log(error);
});
    })
  }

  /* This function trigers item when the list is clicked */
  itemOfList = (item) => {
    let selected = pins.filter((currentOne)=> currentOne.name === item.title)
    window.google.maps.event.trigger(selected[0], 'click');
  }

  /* When there is an error to be handdled concerning the map */
  gm_authFailure(){window.alert("Google Maps error!")}

  /* rendering components */  
  render() {
    const {requestWasSuccessful} = this.state;
    
    return (
      /* Map returns because the request was successful*/
      requestWasSuccessful ? ( 
        <div id="container">
          <div id="container-second">
            <List
              locations={this.state.locations}
              settingQuery={(query) => {this.updateQuery(query)}}
              settingList={this.itemOfList}
              pins={pins}
              map={this.state.map}/>
        
            <div id='map-container' tabIndex="-1" role="application">
              <div id="map" ref="map" role="region"></div>
            </div>
          </div>
       </div>):
      (<div><h1>Error on GoogleMap</h1></div>)
    );
  }
}

/*
 * Please, have in mind that I am aware
 * that my GoogleMaps API key is for development purposes only.
 * I read in knowledge that
 * this plays no role in meeting specifications of the project.
 */
export default scriptLoader(
   [`https://maps.googleapis.com/maps/api/js?key=AIzaSyDYzvC1CJZltNC_ynL86a7oJ8unXGRCO7k&v=3.exp&libraries=geometry,drawing,places`]
   )(App);
