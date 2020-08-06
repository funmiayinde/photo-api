import _ from 'underscore';
import AppLogger from './app.logger';

/**
 * The QueryParser class
 * */
class QueryParser {
	/**
	 * @constructor
	 * @param {String} query This is a query object of the request
	 * */
	constructor(query) {
		const excluded = ['per_page', 'limit', 'page', 'limit', 'population', 'api_key',
			'nested', 'selection', 'start_date', 'end_date', 'sort', 'all', 'custom', 'includes', 'search'];
		this.obj = _.pick(query, ...excluded);
		this.start_date = query.start_date;
		this.end_date = query.end_date;
		if (query.population) {
			try {
				console.log('population:', JSON.parse(JSON.stringify(query.population)));
				this._population = JSON.parse(query.population);
			} catch (e) {
				console.log('err:', e);
				AppLogger.logger('error').error(e);
			}
		}

		if (query.nested) {
			try {
				const nested = JSON.parse(query.nested);
				for (const key in nested) {
					if (nested.hasOwnProperty(key)) {
						query[key] = nested[key];
					}
				}
			} catch (e) {
				console.log('err:', e);
				AppLogger.logger('error').error(e);
			}
		}

		if (query.selection) {
			try {
				this._selection = JSON.parse(query.selection).join(' ');
			} catch (e) {
				AppLogger.logger('error').error(e);
			}
		}

		if (query.includes) {
			const object = query.includes;
			if (object['key'] && object['value']) {
				query[object['key']] = {$in: object['value']};
			}
		}

		if (query.search) {
			this._search = query.search;
		}
		if (query.sort) {
			this._sort = query.sort;
		}
		query = _.omit(query, ...excluded);
		query = _.extend(query, {deleted: false});
		this._query = query;
		Object.assign(this, query);
	}

	/**
	 * @return {Object} get the parsed array
	 * */
	get getAll() {
		return this.obj['all'];
	}

	/**
	 * @return  {Object} get the parsed query
	 **/
	get query() {
		return this._query;
	}

	/**
	 * @return {Object} query set the parsed array
	 * */
	set query(query) {
		this._query = query;
	}

	/**
	 * @return {Object} get the population object for the query
	 * */
	get population() {
		if (this._population) {
			return this._population;
		}
		return [];
	}

	/**
	 * @return {Object} get the sort object for query
	 * */
	get sort() {
		if (this._sort) {
			return this._sort;
		}
		return '-createdAt';
	}

	/**
	 * @return {Object} get the selection object for query
	 * */
	get selection() {
		if (this._selection) {
			return this._selection;
		}
		return '';
	}

	/**
	 * @return {Object} get the search object for query
	 * */
	get shouldSearch() {
		if (this._search) {
			this._search = true;
		}
		return false;
	}

	/**
	 * @return {Object} get the search object for query
	 * */
	get dateRange() {
		return !!(this.start_date && this.end_date);
	}

	/**
	 * @return {Object} get the value for the whole data status
	 * */
	get all() {
		return this.all;
	}
}

export default QueryParser;
