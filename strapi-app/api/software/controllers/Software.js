'use strict';

/**
 * Software.js controller
 *
 * @description: A set of functions called "actions" for managing `Software`.
 */

module.exports = {

  /**
   * Retrieve software records.
   *
   * @return {Object|Array}
   */

  find: async (ctx, next, { populate } = {}) => {
    if (ctx.query._q) {
      return strapi.services.software.search(ctx.query);
    } else {
      return strapi.services.software.fetchAll(ctx.query, populate);
    }
  },

  /**
   * Retrieve a software record.
   *
   * @return {Object}
   */

  findOne: async (ctx) => {
    if (!ctx.params._id.match(/^[0-9a-fA-F]{24}$/)) {
      return ctx.notFound();
    }

    return strapi.services.software.fetch(ctx.params);
  },

  /**
   * Count software records.
   *
   * @return {Number}
   */

  count: async (ctx) => {
    return strapi.services.software.count(ctx.query);
  },

  /**
   * Create a/an software record.
   *
   * @return {Object}
   */

  create: async (ctx) => {
    return strapi.services.software.add(ctx.request.body);
  },

  /**
   * Update a/an software record.
   *
   * @return {Object}
   */

  update: async (ctx, next) => {
    return strapi.services.software.edit(ctx.params, ctx.request.body) ;
  },

  /**
   * Destroy a/an software record.
   *
   * @return {Object}
   */

  destroy: async (ctx, next) => {
    return strapi.services.software.remove(ctx.params);
  }
};
