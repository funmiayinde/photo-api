import queryString from 'query-string';
import url, {URL} from 'url';
import config from 'config';


/**
 * The Pagination class
 * @class Pagination
 * */
export default class Pagination {
	/**
	 * @constructor
	 * @param {String} requestUrl This is a query object
	 * */
	constructor(requestUrl) {
		// Default pagination object
		this.pagination = {total_count: 0};
		// Get the full request url
		const resolvedUrl = url.resolve(config.get('app.baseUrl'), requestUrl);
		this.urlObj = new URL(resolvedUrl);
		const urlObj = this.urlObj;
		const search = urlObj.search;
		// Parse the query string into object
		this.query = queryString.parse(search);

		// The Limit(count to returned)
		this._perPage = this.query && this.query.per_page ? parseInt(this.query.per_page, '10') :
			config.get('items_per_page.default');
		this.pagination.per_page = this._perPage;

		// The amount to be skipped
		this._skip = 0;

		const perPage = this.perPage;
		urlObj.searchParams.set('per_page', perPage.toString());

		// Current page number
		this._current = this.query && this.query.page ? parseInt(this.query.page, '10') : 1;
		const page = this._current;
		if (page && page > 1) {
			let urlObj = this.urlObj;
			const previous = page - 1;
			this._skip = previous * perPage;
			urlObj.searchParams.set('page', previous.toString());
			this.pagination.previous_page = urlObj.href;
		}

		this.pagination.current = page;
		urlObj.searchParams.set('page', page.toString());
		this.pagination.current_page = urlObj.href;
	}

	/**
	 * @param {Number} page The next page number
	 * @return {void}
	 * */
	set next(page) {
		let urlObj = this.urlObj;
		this.pagination.next = page;
		urlObj.searchParams.set('page', page.toString());
		this.pagination.next_page = urlObj.href;
	}

	/**
	 * @param {Boolean} boolean Checks if there are more items
	 * @return {void}
	 * */
	set more(boolean) {
		this.pagination.more = boolean;
	}

	/**
	 * @param {Number} count The amount of items to skip
	 * @return {void}
	 * */
	set skip(count) {
		this._skip = count;
	}

	/**
	 * @return {Number}
	 * */
	get skip() {
		return this._skip;
	}

	/**
	 * @param {Number} count The amount of items to skip
	 * @return {void}
	 * */
	set perPage(count) {
		this._perPage = count;
	}

	/**
	 * @return  {Number}
	 * */
	get perPage() {
		return this._perPage;
	}

	/**
	 * @return {Number}
	 * */
	get current() {
		return this._current;
	}

	/**
	 * @param {Number} count The total count of items
	 * @return {void}
	 * */
	set totalCount(count) {
		this.pagination.total_count = count;
	}

	/**
	 * @param {Number} count The total count of items
	 * @return {Boolean}
	 * */
	morePages(count) {
		return count > (this._perPage * this._current);
	}

	/**
	 * @return {Object}
	 * */
	done() {
		if (this.query.custom) {
			this.urlObj.searchParams.set('custom', JSON.stringify(this.query.custom));
		}
		return this.pagination;
	}

}
