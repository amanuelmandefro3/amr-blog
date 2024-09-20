const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { check, validationResult } = require("express-validator");

/**
* @swagger
* components:
*   schemas:
*     User:
*       type: object
*       required:
*         - name
*         - email
*         - password
*       properties:
*         name:
*           type: string
*           description: The user's name
*         email:
*           type: string
*           description: The user's email
*         password:
*           type: string
*           description: The user's password
*/

/**
* @swagger
* /auth/register:
*   post:
*     summary: Register a new user
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             $ref: '#/components/schemas/User'
*     responses:
*       200:
*         description: User registered successfully
*       400:
*         description: User already exists or validation error
*       500:
*         description: Server error
*/
router.post(
 "/register",
 [
   check("name", "Name is required").not().isEmpty(),
   check("email", "Please include a valid email").isEmail(),
   check("password", "Password must be at least 6 characters").isLength({
     min: 6,
   }),
 ],
 register
);

/**
* @swagger
* /auth/login:
*   post:
*     summary: Login a user
*     tags: [Auth]
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               email:
*                 type: string
*               password:
*                 type: string
*     responses:
*       200:
*         description: User logged in successfully
*       400:
*         description: Invalid credentials
*       500:
*         description: Server error
*/
router.post(
 "/login",
 [
   check("email", "Please include a valid email").isEmail(),
   check("password", "Password is required").exists(),
 ],
 login
);


module.exports = router;
