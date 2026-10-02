import { body, validationResult } from 'express-validator';

const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validateLogin = [
    body("email")
        .trim()
        .notEmpty()
        .withMessage("L'email est obligatoire")
        .isEmail()
        .withMessage("L'email doit être valide")
        .normalizeEmail(),

    body("password")
        .notEmpty()
        .withMessage("Le mot de passe est obligatoire")
];

const validateProfileUpdate = [
    body("nom")
        .trim()
        .notEmpty()
        .withMessage("Le nom est obligatoire")
        .isLength({ min: 2, max: 100 })
        .withMessage("Le nom doit contenir entre 2 et 100 caractères"),

    body("email")
        .trim()
        .notEmpty()
        .withMessage("L'email est obligatoire")
        .isEmail()
        .withMessage("L'email doit être valide")
        .normalizeEmail()
];

export { validateLogin, validateProfileUpdate, handleValidationErrors };