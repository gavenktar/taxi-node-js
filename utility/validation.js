import {body} from 'express-validator'


export const registerValidation = [
    body('email','Неверный формат почты').isEmail(),
];
export const postCreateRoute = [
    body('email','Aboba').isLength({min: 3}).isString()
];