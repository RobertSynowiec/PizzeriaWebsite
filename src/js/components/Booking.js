import { select, templates } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


class Booking {
  constructor(element) {
    this.render(element);
    this.initWidgets();
  }

  render(elemenet) {

    /* generate HTML based on temaplte */
    const generatedHTML = templates.bookingWidget();
    this.element = utils.createDOMFromHTML(generatedHTML);

    this.dom = {};
    this.dom.wrapper = elemenet;

    this.dom.peopleAmount = this.element.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.element.querySelector(select.booking.hoursAmount);
    this.dom.datePicker = this.element.querySelector(select.widgets.datePicker.wrapper);
    this.dom.hourPicker = this.element.querySelector(select.widgets.hourPicker.wrapper);

    this.dom.wrapper.appendChild(this.element);

  }
  initWidgets() {

    this.peopleWidget = new AmountWidget(this.dom.peopleAmount);
    this.hoursWidget = new AmountWidget(this.dom.hoursAmount);
    this.dateWidget = new DatePicker(this.dom.datePicker);
    this.timeWidget = new HourPicker(this.dom.hourPicker);

    this.dom.peopleAmount.addEventListener('updated', function () {
    });
    this.dom.hoursAmount.addEventListener('updated', function () {
    });
    this.dom.datePicker.addEventListener('updated', function () {
    });
    this.dom.hourPicker.addEventListener('updated', function () {
    });
  }
}

export default Booking;