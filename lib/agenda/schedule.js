"use strict";
const debug = require("debug")("agenda:schedule");

/**
 * Schedule a job or jobs at a specific time
 * @name Agenda#schedule
 * @function
 * @param {String} when when the job gets run
 * @param {Array<String>} names array of job names to run
 * @param {Object} data data to send to job
 * @param {Object} additional contains additional parameters to add to job
 * @returns {Promise<Job|Job[]>} job or jobs created
 */
module.exports = function(when, names, data, additional) {
  const self = this;

  /**
   * Internal method that creates a job with given date
   * @param {String} when when the job gets run
   * @param {String} name of job to run
   * @param {Object} data data to send to job
   * @param {Object} additional contains additional parameters to add to job
   * @returns {Job} instance of new job
   */
  const createJob = async (when, name, data, additional) => {
    const job = self.create(name, data, additional);

    await job.schedule(when).save();

    return job;
  };

  /**
   * Internal helper method that calls createJob on a names array
   * @param {String} when when the job gets run
   * @param {*} names of jobs to run
   * @param {Object} data data to send to job
   * @param {Object} additional contains additional parameters to add to job
   * @returns {Array<Job>} jobs that were created
   */
  const createJobs = async (when, names, data, additional) => {
    try {
      let jobs;
      if (additional && Array.isArray(additional)) {
        jobs = names.map((name, i) =>
          createJob(when, name, data, additional[i])
        );
      } else {
        jobs = names.map(name => createJob(when, name, data, additional));
      }

      debug("Agenda.schedule()::createJobs() -> all jobs created successfully");
      return Promise.all(jobs);
    } catch (error) {
      debug(
        "Agenda.schedule()::createJobs() -> error creating one or more of the jobs"
      );
      throw error;
    }
  };

  if (typeof names === "string" || names instanceof String) {
    debug(
      "Agenda.schedule(%s, %O, [%O], [%O], cb)",
      when,
      names,
      data,
      additional
    );
    return createJob(when, names, data, additional);
  }

  if (Array.isArray(names)) {
    debug("Agenda.schedule(%s, %O, [%O], [%O])", when, names, data, additional);
    return createJobs(when, names, data, additional);
  }
};
