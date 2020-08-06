import Validator from 'validatorjs';


export default {

	/**
	 * @param {Object} obj The Object validation will be performed on
	 * */
	create: (obj) => {
		const rules = {};
		const validator = new Validator(obj, rules);
		return {
			validator,
			validated: validator.passes()
		};
	}
}
