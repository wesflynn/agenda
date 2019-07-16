"use strict";
const debug = require("debug")("agenda:create");
const Job = require("../job");

/**
 * Given a name and some data, create a new job
 * @name Agenda#create
 * @function
 * @param {String} name name of job
 * @param {Object} data data to set for job
 * @param {Object} additional allows additional fields to be added to job on create
 * @returns {Job} instance of new job
 */
module.exports = function(name, data, additional) {
  debug("Agenda.create(%s, [Object])", name);
  const priority = this._definitions[name]
    ? this._definitions[name].priority
    : 0;
  const job = additional
    ? new Job({
        name,
        data,
        type: "normal",
        priority,
        agenda: this,
        ...additional
      })
    : (job = new Job({ name, data, type: "normal", priority, agenda: this }));
  return job;
};
