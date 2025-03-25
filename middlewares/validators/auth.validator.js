import Joi from "joi";

const registerSchema = Joi.object({
    email: Joi.string().email().required().messages({
        'string.email' : 'Invalid email address',
        'string.empty' : 'Email is required',
    }),
    password: Joi.string().min(8).required().messages({
        'string.empty' : 'Password is required',
        'string.min'   : 'Password must be at least 8 characters long',
    }),
    confirmPassword: Joi.string().required().valid(Joi.ref('password')).messages({
        'any.only': 'Passwords do not match',
        'string.empty': 'Confirm password is required',
    })
})

const loginSchema = Joi.object({
    email: Joi.string().required().email().messages({
        'string.empty'  : 'Email is required',
        'string.email'  : 'Invalid email address'
    }),
    password: Joi.string().required().min(8).messages({
        'string.empty': 'Password is required',
        'string.min'  : 'Password must be at least 8 characters long'
    })
})

const validateRegister = (req, res, next) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
}

const validateLogin  = (req,res,next) => {
    const {error} = loginSchema.validate(req.body);
    console.log('error', error)
    if(error){
        return res.status(400).json({error: error.details[0].message})
    }
    next();
}

export { validateRegister, validateLogin };
