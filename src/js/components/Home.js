import { templates } from "../settings.js";
import utils from "../utils.js";

class Home {
    constructor(element) {
        this.render(element);
    }

    render(elemenet) {
        /* generate HTML based on temaplte */
        const generatedHTML = templates.homePage();
        this.element = utils.createDOMFromHTML(generatedHTML);

        this.dom = {};
        this.dom.wrapper = elemenet;
        this.dom.wrapper.appendChild(this.element);

        console.log('this.dom', this.dom);
    }

}
export default Home;