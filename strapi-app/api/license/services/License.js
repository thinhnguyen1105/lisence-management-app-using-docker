'use strict';

/* global License */

/**
 * License.js service
 *
 * @description: A set of functions similar to controller's actions to avoid code duplication.
 */

// Public dependencies.
const _ = require('lodash');
const { convertRestQueryParams, buildQuery } = require('strapi-utils');
module.exports = {

  /**
   * Promise to fetch all licenses.
   *
   * @return {Promise}
   */

  fetchAll: (params, populate) => {
    const filters = convertRestQueryParams(params);
    const populateOpt = populate || License.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)

    return buildQuery({
      model: License,
      filters,
      populate: populateOpt,
    });
  },

  /**
   * Promise to fetch a/an license.
   *
   * @return {Promise}
   */

  fetch: (params) => {
    // Select field to populate.
    const populate = License.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    return License
      .findOne(_.pick(params, _.keys(License.schema.paths)))
      .populate(populate);
  },

  /**
   * Promise to count licenses.
   *
   * @return {Promise}
   */

  count: (params) => {
    const filters = convertRestQueryParams(params);

    return buildQuery({
      model: License,
      filters: { where: filters.where },
    })
      .count()
  },

  /**
   * Promise to add a/an license.
   *
   * @return {Promise}
   */

  add: async (values) => {
    // Extract values related to relational data.
    const relations = _.pick(values, License.associations.map(ast => ast.alias));
    const data = _.omit(values, License.associations.map(ast => ast.alias));

    // Create entry with no-relational data.
    const entry = await License.create(data);

    // Create relational data and return the entry.
    return License.updateRelations({ _id: entry.id, values: relations });
  },

  /**
   * Promise to edit a/an license.
   *
   * @return {Promise}
   */

  edit: async (params, values) => {
    console.log('edit', values)
    // Extract values related to relational data.
    const relations = _.pick(values, License.associations.map(a => a.alias));
    const data = _.omit(values, License.associations.map(a => a.alias));

    // Update entry with no-relational data.
    const entry = await License.updateOne(params, data, { multi: true });

    // Update relational data and return the entry.
    return License.updateRelations(Object.assign(params, { values: relations }));
  },

  /**
   * Promise to remove a/an license.
   *
   * @return {Promise}
   */

  remove: async params => {
    // Select field to populate.
    const populate = License.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    // Note: To get the full response of Mongo, use the `remove()` method
    // or add spent the parameter `{ passRawResult: true }` as second argument.
    const data = await License
      .findOneAndRemove(params, {})
      .populate(populate);

    if (!data) {
      return data;
    }

    await Promise.all(
      License.associations.map(async association => {
        if (!association.via || !data._id || association.dominant) {
          return true;
        }

        const search = _.endsWith(association.nature, 'One') || association.nature === 'oneToMany' ? { [association.via]: data._id } : { [association.via]: { $in: [data._id] } };
        const update = _.endsWith(association.nature, 'One') || association.nature === 'oneToMany' ? { [association.via]: null } : { $pull: { [association.via]: data._id } };

        // Retrieve model.
        const model = association.plugin ?
          strapi.plugins[association.plugin].models[association.model || association.collection] :
          strapi.models[association.model || association.collection];

        return model.update(search, update, { multi: true });
      })
    );

    return data;
  },

  /**
   * Promise to search a/an license.
   *
   * @return {Promise}
   */

  search: async (params) => {
    // Convert `params` object to filters compatible with Mongo.
    const filters = strapi.utils.models.convertParams('license', params);
    // Select field to populate.
    const populate = License.associations
      .filter(ast => ast.autoPopulate !== false)
      .map(ast => ast.alias)
      .join(' ');

    const $or = Object.keys(License.attributes).reduce((acc, curr) => {
      switch (License.attributes[curr].type) {
        case 'integer':
        case 'float':
        case 'decimal':
          if (!_.isNaN(_.toNumber(params._q))) {
            return acc.concat({ [curr]: params._q });
          }

          return acc;
        case 'string':
        case 'text':
        case 'password':
          return acc.concat({ [curr]: { $regex: params._q, $options: 'i' } });
        case 'boolean':
          if (params._q === 'true' || params._q === 'false') {
            return acc.concat({ [curr]: params._q === 'true' });
          }

          return acc;
        default:
          return acc;
      }
    }, []);

    return License
      .find({ $or })
      .sort(filters.sort)
      .skip(filters.start)
      .limit(filters.limit)
      .populate(populate);
  },

  generateLicense: async (values) => {
    if (values.key || values.expriedDate) {
      throw new Error('Invalid body');
    }
    values.key = ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g,a=>(a^Math.random()*16>>a/4).toString(16));
    values.isActive = false;
    // Extract values related to relational data.
    const relations = _.pick(values, License.associations.map(ast => ast.alias));
    const data = _.omit(values, License.associations.map(ast => ast.alias));

    // Create entry with no-relational data.
    const entry = await License.create(data);

    // Create relational data and return the entry.
    return License.updateRelations({ _id: entry.id, values: relations });
  },
  verify: async (values) => {
    console.log('values', values)
    const existedKey = await strapi.services.license.fetch({key: values.key});
    console.log('existedKey.expriedDate', existedKey.expriedDate)
    if (existedKey && existedKey.isActive === false && !existedKey.expriedDate) {
      const date = new Date();
      date.setDate(date.getDate() + 1); 
      return strapi.services.license.edit({_id: existedKey._id}, {user: values.user, isActive: true, expriedDate: date});
    } else {
      throw new Error('Invalid key');
    }
  },
};
