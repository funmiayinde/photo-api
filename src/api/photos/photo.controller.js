import AppController from '../../core/api/app.controller';
import Requestify from '../../utils/requestify';
import {HTTP_METHODS} from '../../utils/request-methods';
import {HTTP_CREATED, HTTP_OK} from '../../utils/status-codes';
import _ from 'underscore';
import AppProcessor from '../../core/api/app.processor';
import QueryPaser from '../../core/api/query.parser';
import Pagination from '../../core/api/api.pagination';
import {PhotoProcessor} from './photo.processor';

/**
 * @class PhotoController
 * */
export class PhotoController extends AppController {
	/**
	 * @param {Object} model The model name
	 * @constructor
	 */
	constructor(model) {
		super(model);
		this.create = this.create.bind(this);
	}

	/**
	 * @param {Object} req The request obj
	 * @param {Object} res The response obj
	 * @param {callback} next The callback to handle the next program
	 * @return {Object} res The res Object
	 * */
	async create(req, res, next) {
		const queryParser = new QueryPaser(Object.assign({}), req.query);
		let options = {
			method: HTTP_METHODS.GET,
			url: 'https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&api_key=6oBhKXqdP2dIIvcayiJryYUE2GLfN41OfCDwRQOe'
		};
		let response = await new Requestify(options).exec();
		let result;
		const object = [];
		if (response.getBody() && response.getCode() === 200) {
			result = response.getBody();
			if (result.photos && _.isArray(result.photos)) {
				for (let i = 0; i < result.photos.length; i++) {
					const photoObj = result.photos[i];
					const data = {
						sol: photoObj.sol,
						camera: photoObj.camera,
						img_src: photoObj.img_src,
						earth_date: photoObj.earth_date,
						rover: photoObj.rover,
					};
					const photo = new this.model(data);
					await photo.save();
					object.push(photo);
				}
			}
		}
		const responseData = await AppProcessor.getSimpleResponse(this.model, object, HTTP_CREATED, this.lang.create, queryParser);
		return res.status(HTTP_CREATED).json(responseData);
	}

	/**
	 * @param {Object} req The Object request
	 * @param {Object} res The Object response
	 * @param {Object} next The callback that handler the next action
	 * @return {Object} res
	 */
	async find(req, res, next) {
		const queryParser = new QueryPaser(Object.assign({}, req.query));
		let pagination = new Pagination(req.originalUrl);
		try {
			const [photos, total] = await PhotoProcessor.photoAggregation(queryParser, pagination);
			const response = await AppProcessor.getPaginatedResponseObject(this.model, photos, HTTP_OK,
				'', total, pagination, queryParser);
			return res.status(HTTP_OK).json(response);
		} catch (e) {
			return next(e);
		}
	}
}
