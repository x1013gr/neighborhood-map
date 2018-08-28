import React, { Component } from 'react';
import escapeRegExp from 'escape-string-regexp';

/*
 * Using react to extend component
 * for additional functionality
 * (ie use of filtering of the map search)
 */
class List extends Component {

  constructor(props) {
    super(props);
    this.state = {
      query: ''
    };
  }

  render() {

    const {locations, settingQuery, settingList} = this.props;
    let ShowList;

    if(this.state.query) {
      const match = new RegExp(escapeRegExp(this.state.query), 'i')
      ShowList = locations.filter((location) => match.test(location.title))
    } else {
      ShowList = locations
    }
    
    /* This is where some magic happens to make the components work */
    /* Making the search bar work */
    return (
      /* adding also aria to the code for accessability */
      <div id = "list-container">

        <section className = "first">
          <h1>Surfing @ Naxos</h1>
          <form>
          <input type = "text" id="searchbar"
                name = "searchbar"
                placeholder = "Search Surf Beach"
                role = "search"
                tabIndex = "1"
                aria-labelledby = "Search Surf Beach"
                value = { this.state.query }                       
                onChange = {(event) => {
                this.setState({ query: event.target.value });
                settingQuery(event.target.value)}}/>
          </form>
        </section>
        <header className = "second">
          <ul  role = "listbox"
               tabIndex = "1"
               aria-labelledby = "list of all locations">
               {ShowList.map((location, index) => (
               <li key = {index} role = "button"
               tabIndex = {index+1}
               onClick = {(event) => settingList(location, event)}>
               {location.title}</li>))}
          </ul>
        </header>
      </div>

    )

}}

export default List;