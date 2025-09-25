import {Router} from 'express'
import { addHistory, getUserHistory, login, register } from '../controller/User.js';
const router=Router();


router.route('/register').post(register)
router.route('/login').post(login)
router.route('/add_to_activity').post(addHistory)
router.route('/get_all_activity').get(getUserHistory)


export default router
