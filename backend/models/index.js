/**
 * ================================================================
 * MODELS INDEX
 * ================================================================
 *
 * Central export point for all Mongoose models.
 * Allows clean imports: const { User, Blog, Comment } = require('./models')
 *
 * @module models/index
 * @author Daily Blogs Team
 * @version 1.0.0
 */

const User = require("./User");
const Blog = require("./Blog");
const Comment = require("./Comment");

module.exports = {
  User,
  Blog,
  Comment,
};
