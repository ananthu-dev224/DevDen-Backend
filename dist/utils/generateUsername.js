"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const userRepository_1 = require("../repository/userRepository");
const userRepo = new userRepository_1.UserRepository();
const generateUniqueUsername = async (baseName) => {
    const maxAttempts = 1000; // To prevent infinite loops in case of many duplicates
    const base = baseName.toLowerCase().replace(/[^a-z0-9_]/g, '');
    let attempt = 0;
    let uniqueUsername = base;
    while (attempt < maxAttempts) {
        // Check if the username already exists in the database
        const existingUser = await userRepo.findByUsername(uniqueUsername);
        if (!existingUser) {
            // Username is unique, return it
            return uniqueUsername;
        }
        // If username exists, add a random number or _ to make it unique
        uniqueUsername = `${base}_${Math.floor(Math.random() * 10000)}`;
        attempt += 1;
    }
    throw new Error('Unable to generate a unique username');
};
exports.default = generateUniqueUsername;
