import requestify from 'requestify';

/**
 * @class
 * */
class Requestify {

	/**
	 * @constructor
	 * @param {Object} options The option object
	 * */
	constructor(options) {
		this.options = {...options};
		this.exec = this.exec.bind(this);
	}


	/**
	 * @function
	 * @return {Object} The request response
	 * */
	async exec() {
		return await requestify.request(this.options.url, {
			method: this.options.method,
			body: this.options.body,
			headers: this.options.headers,
			params: this.options.params
		});
	}

}

export default Requestify;
