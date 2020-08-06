import {Router} from 'express';
import {Photo} from "./photo.model";
import {PhotoController} from "./photo.controller";


const router = Router();
const photoCtrl = new PhotoController(Photo);

router.route('/photos')
	.post(photoCtrl.create)
	.get(photoCtrl.find);


export default router;
