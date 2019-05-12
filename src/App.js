import React from "react";
import { Container, Row, Col } from "reactstrap";
import axios from "axios";
import spEventsParser from "./sp-events-parser";
import moment from "moment";
import "./App.css";

class App extends React.Component {
  url =
    "https://phoxylz.sharepoint.com/sites/prod/_api/web/lists/getbytitle('Calendar')/items?$select=*,Duration,RecurrenceData";

  state = {
    eventsData: undefined
  };

  componentDidMount() {
    let dataPromise = axios.get(this.url, {
      headers: {
        accept: "application/json;odata=verbose"
      }
    });

    dataPromise.then((data) => {
      let parsed = spEventsParser.parseEvents(data.d.results);
      let filtered = this.filterByDates(parsed);
      let sorted = this.sortAscending(filtered);
      this.setState({
        eventsData: sorted
      });
    });

    dataPromise.catch((err) => {
      console.log("Failed to fetch data: \n" + err);
    });
  }

  render() {
    return (
      <div className="App">
        <a href="/sites/prod/Lists/Calendar" onepagenavigationaction="1">
          <h5 className="text-info mt-2">Oppkommende hendelser</h5>
        </a>
        <Container>
          <Row>
            <Col xs="6" className="text-secondary py-1 px-2">
              Tittel
            </Col>
            <Col xs="6" className="text-secondary py-1 px-2">
              Dato
            </Col>
          </Row>
          {this.state.eventsData &&
            this.state.eventsData.map((v) => (
              <Row>
                <Col xs="6" className="py-1 px-2">
                  {v.Title}
                </Col>
                <Col xs="6" className="py-1 px-2">
                  {moment(v.EventDate).format("MM/DD/YYYY")}
                </Col>
              </Row>
            ))}
        </Container>
      </div>
    );
  }

  filterByDates(data) {
    let { curday } = this;
    return data.filter((v) => {
      let fEventDate = moment(v.EventDate).format("MM/DD/YYYY");
      let fCurrentDate = moment(curday("/")).format("MM/DD/YYYY");
      let fCurrentPlusSeven = moment(curday("/"))
        .add(7, "d")
        .format("MM/DD/YYYY");

      if (fEventDate >= fCurrentDate && fEventDate <= fCurrentPlusSeven) {
        return true;
      }
      return false;
    });
  }

  sortAscending(data) {
    return data.sort(
      (a, b) =>
        moment(a.EventDate).format("YYYYMMDD") -
        moment(b.EventDate).format("YYYYMMDD")
    );
  }

  curday(sp) {
    let today = new Date();
    let dd = today.getDate();
    let mm = today.getMonth() + 1;
    let yyyy = today.getFullYear();

    if (dd < 10) dd = "0" + dd;
    if (mm < 10) mm = "0" + mm;
    return mm + sp + dd + sp + yyyy;
  }
}

export default App;
