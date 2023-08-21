import { select, settings, templates, classNames } from "../settings.js";
import utils from "../utils.js";
import AmountWidget from "./AmountWidget.js";
import DatePicker from "./DatePicker.js";
import HourPicker from "./HourPicker.js";

class Booking {
  constructor(element) {
    this.filteredStarters = [];

    this.render(element);
    this.initWidgets();
    this.getData();
    this.filterStarters();
  }

  getData() {

    const startDateParam =
      settings.db.dateStartParamKey +
      "=" +
      utils.dateToStr(this.dateWidget.minDate);
    const endDateParam =
      settings.db.dateEndParamKey +
      "=" +
      utils.dateToStr(this.dateWidget.maxDate);

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };
    const urls = {
      booking:
        settings.db.url +
        "/" +
        settings.db.booking +
        "?" +
        params.booking.join("&"),

      eventsCurrent:
        settings.db.url +
        "/" +
        settings.db.event +
        "?" +
        params.eventsCurrent.join("&"),

      eventsRepeat:
        settings.db.url +
        "/" +
        settings.db.event +
        "?" +
        params.eventsRepeat.join("&"),
    };

    Promise.all([
      fetch(urls.booking),
      fetch(urls.eventsCurrent),
      fetch(urls.eventsRepeat),
    ])
      .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
          bookingsResponse.json(),
          eventsCurrentResponse.json(),
          eventsRepeatResponse.json(),
        ]);
      })

      .then(([bookings, eventsCurrent, eventsRepeat]) => {
        //console.log(bookings);
        //console.log(eventsCurrent);
        //console.log(eventsRepeat);

        this.parseData(bookings, eventsCurrent, eventsRepeat);
        //console.log(this.parseData);
      });
  }
  parseData(bookings, eventsCurrent, eventsRepeat) {
    this.booked = {};

    for (let item of bookings) {
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    for (let item of eventsCurrent) {
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    const minDate = this.dateWidget.minDate;
    const maxDate = this.dateWidget.maxDate;


    for (let item of eventsRepeat) {
      if (item.repeat == "daily") {
        for (
          let loopDate = minDate;
          loopDate <= maxDate;
          loopDate = utils.addDays(loopDate, 1)
        ) {
          this.makeBooked(
            utils.dateToStr(loopDate),
            item.hour,
            item.duration,
            item.table
          );
        }
      }
    }
    this.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    if (typeof this.booked[date] == "undefined") {
      this.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for (
      let hourBlok = startHour;
      hourBlok < startHour + duration;
      hourBlok += 0.5
    ) {
      if (typeof this.booked[date][hourBlok] == "undefined") {
        this.booked[date][hourBlok] = [];
      }
      this.booked[date][hourBlok].push(table);
    }
  }
  updateDOM() {
    this.date = this.dateWidget.value;
    this.hour = utils.hourToNumber(this.timeWidget.value);

    let allAvailable = false;

    if (
      typeof this.booked[this.date] === "undefined" ||
      typeof this.booked[this.date][this.hour] === "undefined"
    ) {
      allAvailable = true;
    }

    for (let table of this.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (
        !allAvailable &&
        this.booked[this.date][this.hour].includes(tableId)
      ) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
        table.classList.remove(classNames.booking.tableSelected);
      }
    }
  }

  render(elemenet) {
    /* generate HTML based on temaplte */
    const generatedHTML = templates.bookingWidget();
    this.element = utils.createDOMFromHTML(generatedHTML);

    this.dom = [];
    this.dom.wrapper = elemenet;
    this.dom.peopleAmount = this.element.querySelector(
      select.booking.peopleAmount
    );
    this.dom.totalPeopleAmount = this.element.querySelector(
      select.booking.totalPeopleAmount
    );
    this.dom.hoursAmount = this.element.querySelector(
      select.booking.hoursAmount
    );
    this.dom.totalHoursAmount = this.element.querySelector(
      select.booking.totalHoursAmount
    );
    this.dom.datePicker = this.element.querySelector(
      select.widgets.datePicker.wrapper
    );
    this.dom.hourPicker = this.element.querySelector(
      select.widgets.hourPicker.wrapper
    );
    this.dom.tables = this.element.querySelectorAll(select.booking.tables);
    this.dom.mapFloor = this.element.querySelector(select.booking.mapFloor);
    this.dom.phoneNumber = this.element.querySelector(select.cart.phone);
    this.dom.address = this.element.querySelector(select.cart.address);
    this.dom.form = this.element.querySelector(select.booking.form);
    this.dom.optionStarters = this.element.querySelector(
      select.booking.optionStarters
    );
    this.dom.wrapper.appendChild(this.element);
  }
  initWidgets() {
    this.peopleWidget = new AmountWidget(this.dom.peopleAmount);
    this.hoursWidget = new AmountWidget(this.dom.hoursAmount);
    this.dateWidget = new DatePicker(this.dom.datePicker);
    this.timeWidget = new HourPicker(this.dom.hourPicker);

    this.dom.wrapper.addEventListener("updated", () => {
      this.updateDOM();
    });
    this.dom.mapFloor.addEventListener("click", (event) => {
      event.preventDefault();
      this.initTables(event);
    });
    this.dom.form.addEventListener("click", (event) => {
      event.preventDefault();
      this.sendBooking();
    });
  }

  initTables(event) {
    for (let table of this.dom.tables) {
      //debugger;
      if (table !== event.target) {
        table.classList.remove(classNames.booking.tableSelected);
      }
    }
    if (!event.target.classList.contains(classNames.booking.tableBooked)) {
      event.target.classList.toggle(classNames.booking.tableSelected);

      this.infoChangeTable = +event.target.getAttribute(
        settings.booking.tableIdAttribute
      ); // +event zminia na wartość na liczbę
    } else {
      alert("This table is not available during these hours");
    }
  }

  filterStarters() {
    this.dom.optionStarters.addEventListener("click", event => {
      const clickedElement = event.target;

      console.log("clickedElement ", clickedElement.value);
      //debugger;
      if (
        clickedElement.tagName == "INPUT" &&
        clickedElement.type == "checkbox" &&
        clickedElement.name == "starter"
      ) {
        if (clickedElement.checked) {
          this.filteredStarters.push(clickedElement.value);
        } else {
          const valueArray = this.filteredStarters.indexOf(
            clickedElement.value
          );
          this.filteredStarters.splice(valueArray, 1);
        }
      }
    });
  }

  sendBooking() {
    const url = settings.db.url + "/" + settings.db.booking;
    console.log(url);

    const payload = {
      date: this.dateWidget.value,
      hour: this.timeWidget.value,
      table: this.infoChangeTable,
      duration: +this.dom.totalHoursAmount.value,
      ppl: +this.dom.totalPeopleAmount.value,
      starters: this.filteredStarters,
      phone: this.dom.phoneNumber.value,
      address: this.dom.address.value,
    };

    console.log("payLoad", payload);

    const options = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then((parseResponse) => {
        console.log("parasedResponse ", parseResponse);
        this.makeBooked(
          payload.date,
          payload.hour,
          payload.duration,
          payload.table
        );
      });
  }
}
export default Booking;
