import _ from 'underscore';
import BaseController from './base.controller';
import QueryPaser from './query.parser';
import AppProcessor from './app.processor';
import lang from '../../lang';
import AppLogger from './app.logger';
import {HTTP_CREATED, HTTP_OK} from '../../utils/status-codes';
import Pagination from "./api.pagination";


/**
 * The App Controller class where other controller inherits or
 * overrides some pre defined and existing resources
 **/
class AppController extends BaseController {
	/**
	 * @param {Model} model The default model object
	 * for the controller . It will be required to create
	 * an instance of the controller
	 * @constructor
	 * */
	constructor(model) {
		super(model);
		this.create = this.create.bind(this);
		this.find = this.find.bind(this);
		this.findOne = this.findOne.bind(this);
	}

	/**
	 * @param {Object} req The request obj
	 * @param {Object} res The response obj
	 * @param {callback} next The callback to handle the next program
	 * @return {Object} res The res Object
	 * */
	async create(req, res, next) {
		const queryParser = new QueryPaser(Object.assign({}), req.query);
		const obj = await AppProcessor.prepareBodyObject(req);
		const validate = AppProcessor.validate(this.model, 'create', obj, lang.get('error').inputs);
		if (validate) {
			return next(validate);
		}
		try {
			let object = new this.model(obj);
			object = await object.save();
			const response = await AppProcessor.getSimpleResponse(this.model, object, HTTP_CREATED, this.lang.create, queryParser);
			return res.status(HTTP_CREATED).json(response);
		} catch (e) {
			AppLogger.logger('error').error('err: ' + e);
		}
	}

	/**
	 * @param {Object} req The request obj
	 * @param {Object} res The response obj
	 * @param {callback} next The callback to handle the next program
	 * @return {Object} res The res Object
	 */
	async findOne(req, res, next) {
		console.log('find one is here');
		const queryParser = new QueryPaser(Object.assign({}, req.query));
		let object = req.object;
		const response = await AppProcessor.getSimpleResponse(this.model, object, HTTP_OK, '', queryParser);
		console.log('req obj', object);
		return res.status(HTTP_OK).json(response);
	}

	/**
	 * @param {Object} req The request obj
	 * @param {Object} res The response obj
	 * @param {callback} next The callback to handle the next program
	 * @return {Object} res The response Object
	 */
	async find(req, res, next) {
		const queryParser = new QueryPaser(Object.assign({}, req.query));
		const pagination = new Pagination(req.originalUrl);
		const query = AppProcessor.buildQuery(this.model, pagination, queryParser);
		try {
			const [objects, count] = await Promise.all([
				query.select(queryParser.selection).exec(),
				this.model.countDocuments(queryParser.query).exec()
			]);

			const response = await AppProcessor.getPaginatedResponseObject(this.model,
				objects, HTTP_OK, '', count, pagination, queryParser);
			return res.status(HTTP_OK).json(response);
		} catch (e) {
			return next(e);
		}
	}
}

export default AppController;
