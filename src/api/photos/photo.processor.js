import {Photo} from "./photo.model";


/**
 * @class PhotoProcessor
 */
export class PhotoProcessor {

	/**
	 * @param {Object} obj The object to perform the validation on
	 * @return {Object} The validator object with the specified rules.
	 */
	static query(obj) {
		const query = [];
		query.push({
			$group:
				{
					_id: {full_name: '$camera.full_name'},
					img_src: {$push: '$img_src'},
					count: {$sum: 1}
				}
		});
		return query;
	}

	/**
	 * @param {Object} pagination The object to perform validation on
	 * @param {Object} queryParser The object to perform validation on
	 * @return {Array} The validator object with the specified rules.
	 */
	static async photoAggregation(queryParser, pagination) {
		let queryArray = this.query(queryParser, pagination);
		console.log('photo query:', queryArray);
		if (queryArray.length > 0) {
			const photos = await Photo.aggregate(queryArray);
			const filtered = photos.slice(pagination.skip, (pagination.skip + pagination.perPage));
			return [filtered, photos.length];
		}
		return [null, null];
	}
}
