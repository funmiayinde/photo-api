'use stict';

import _ from 'underscore';
import AppResponse from './app.response';
import AppError from './app.error';
import {HTTP_BAD_REQUEST} from "../../utils/status-codes";

/**
 * The processor class
 * */
class AppProcessor {
	/**
	 * @param {Object} model The schema model
	 * @param {String} id The id of the resource to find
	 * @param {Object} queryParser  The query parser
	 * @return {Promise<Object>}
	 * */
	static async getObject(model, id, queryParser) {
		let query = model.findOne({_id: id, deleted: false});
		if (queryParser.population) {
			query = query.populate(queryParser.population);
		}
		return query.exec();
	}

	/**
	 * @param {Object} model The schema model
	 * @param {Object} object The schema model
	 * @param {Integer} code The schema model
	 * @param {Object} meta The query parser
	 * @param {String} message the id of the resource to find
	 * @param {Object} queryParser  The query parser
	 * @return {Promise<Object>}
	 **/
	static async getResponseObject(model, object, code, meta = AppResponse.getSuccess(), message = "Operation was successful", queryParser = null) {
		_.extend(message, {status_code: code});
		if (queryParser && queryParser.population) {
			object = await model.populate(object, queryParser.population);
		}
		if (message) {
			meta.message = message;
		}
		return AppResponse.format(meta, object);
	}

	/**
	 * @param {Object} model The schema model
	 * @param {Object} object The schema model
	 * @param {Integer} code The schema model
	 * @param {String} message the id of the resource to find
	 * @param {Object} queryParser  The query parser
	 * @return {Promise<Object>}
	 **/
	static async getSimpleResponse(model, object, code, message, queryParser = null) {
		const meta = AppResponse.getSuccess();
		_.extend(meta, {status_code: code});
		// if (queryParser && queryParser.population) {
		// 	object = await model.population(object, queryParser.population);
		// }
		if (message) {
			meta.message = message;
		}
		return AppResponse.format(meta, object);
	}

	/**
	 * @param {Object} req The request object
	 * @return {Promise<Object>}
	 * */
	static async prepareBodyObject(req) {
		let body = req.body;
		if (req.userId) {
			const user = req.userId;
			await _.extend(body, {user, owner, created_by: user});
		}
		return body;
	}

	/**
	 * @param {Object} model The schema model
	 * @param {Object} pagination The pagination object
	 * @param {Object} queryParser The query parser
	 * @return {Object}
	 * */
	static buildQuery(model, pagination, queryParser = null) {
		let query = model.find(queryParser.query);
		if (queryParser.shouldSearch && model.filterSearch) {
			const searchQuery = model.filterSearch(queryParser.search);
			queryParser.query = {
				$or: [...searchQuery],
				...queryParser.search
			};
			query = model.find({...queryParser.query});
		}
		if (queryParser.population) {
			query = query.populate(queryParser.population);
		}
		if (queryParser.dateRange && model.rangeFilter) {
			console.log('searching... by date range');
			queryParser.query = model.rangeFilter(queryParser);
			query = model.find({...queryParser.query});
		}
		if (!queryParser.getAll) {
			query = query.skip(pagination.skip)
				.limit(pagination.perPage)
				.sort((pagination && pagination.sort)
					? Object.assign(pagination.sort, {createdAt: -1}) : '-createdAt');
		}
		return query;
	}

	/**
	 * @param {Object} model The schema model
	 * @param {Object} object The schema model
	 * @param {Integer} code The response code
	 * @param {String} message The id of the resource to find
	 * @param {Integer} count The total number of query
	 * @param {Object} pagination The pagination object
	 * @param {Object} queryParser The query parser
	 * @return {Promise<Object>}
	 * */
	static async getPaginatedResponseObject(model, object, code, message = 'Operation was successful', count, pagination, queryParser) {
		const _meta = AppResponse.getSuccess();
		_.extend(_meta, {status_code: code});
		if (queryParser && queryParser.population) {
			object = await model.populate(object, queryParser.population);
		}
		if (message) {
			_meta.message = message;
		}
		if (!queryParser.getAll) {
			pagination.totalCount = count;
			if (pagination.morePages(count)) {
				pagination.next = pagination.current + 1;
			}
			_meta.pagination = pagination.done();
		}
		return AppResponse.format(_meta, object);
	}

	/**
	 * @param {Object} model The schema model
	 * @param {String} type The type of validation to perform
	 * @param {Object} body The object to validate
	 * @param {String} error The object to validate
	 * @return {Object}
	 */
	static validate(model, type, body, error) {
		const {validator, validated} = model.validations(type, body);
		if (!validated) {
			return new AppError(error, HTTP_BAD_REQUEST, validator.errors.all());
		}
		return null;
	}
}

export default AppProcessor;
