"use strict";
const debug = require("debug")("agenda:every");

/**
 * Creates a scheduled job with given interval and name/names of the job to run
 * @name Agenda#every
 * @function
 * @param {String|Number} interval - run every X interval
 * @param {String|Array<String>} names - String or strings of jobs to schedule
 * @param {Object} [data] - data to run for job
 * @param {Object} [options] - options to run job for
 * @param {Object} [additional] contains additional parameters to add to job
 * @returns {Promise} Job/s created. Resolves when schedule fails or passes
 */
module.exports = async function(interval, names, data, options, additional) {
  /**
   * Internal method to setup job that gets run every interval
   * @param {Number} interval run every X interval
   * @param {String} name String job to schedule
   * @param {Object} data data to run for job
   * @param {Object} options options to run job for
   * @param {Object} additional contains additional parameters to add to job
   * @returns {Job} instance of job
   */
  const createJob = async (interval, name, data, options, additional) => {
    const job = this.create(name, data, additional);

    job.attrs.type = "single";
    job.repeatEvery(interval, options);
    await job.save();

    return job;
  };

  /**
   * Internal helper method that uses createJob to create jobs for an array of names
   * @param {Number} interval run every X interval
   * @param {Array<String>} names Strings of jobs to schedule
   * @param {Object} data data to run for job
   * @param {Object} options options to run job for
   * @param {Object} additional contains additional parameters to add to job
   * @returns {Array<Job>} array of jobs created
   */
  const createJobs = (interval, names, data, options, additional) => {
    try {
      let jobs;
      if (additional && Array.isArray(additional)) {
        jobs = names.map((name, i) =>
          createJob(interval, name, data, options, additional[i])
        );
      } else {
        jobs = names.map(name =>
          createJob(interval, name, data, options, additional)
        );
      }

      debug("every() -> all jobs created successfully");

      return Promise.all(jobs);
    } catch (error) {
      // @TODO: catch - ignore :O
      debug("every() -> error creating one or more of the jobs", error);
    }
  };

  if (typeof names === "string" || names instanceof String) {
    debug("Agenda.every(%s, %O, %O, %O)", interval, names, options, additional);
    const jobs = await createJob(interval, names, data, options, additional);

    return jobs;
  }

  if (Array.isArray(names)) {
    debug("Agenda.every(%s, %s, %O, %O)", interval, names, options, additional);
    const jobs = await createJobs(interval, names, data, options, additional);

    return jobs;
  }
};
