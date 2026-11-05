// An in-process job queue with retries, exponential backoff and a dead-letter list.
// `sleep` is injectable so tests run instantly and deterministically.
export class JobQueue {
  #queue = [];
  #running = false;
  dead = [];
  done = [];

  constructor({ handlers = {}, maxAttempts = 3, baseDelayMs = 200, sleep = (ms) => new Promise((r) => setTimeout(r, ms)) } = {}) {
    Object.assign(this, { handlers, maxAttempts, baseDelayMs, sleep });
  }

  /** Add a job and return immediately (this is the "202 Accepted" moment). */
  enqueue(type, payload) {
    if (!this.handlers[type]) throw new Error(`no handler for job type "${type}"`);
    const job = { id: this.done.length + this.dead.length + this.#queue.length + 1, type, payload, attempts: 0 };
    this.#queue.push(job);
    queueMicrotask(() => this.drain());
    return job.id;
  }

  /** Process jobs one at a time until the queue is empty. Resolves when idle. */
  async drain() {
    if (this.#running) return this.#idle;
    this.#running = true;
    this.#idle = (async () => {
      while (this.#queue.length) {
        const job = this.#queue.shift();
        job.attempts += 1;
        try {
          job.result = await this.handlers[job.type](job.payload, job);
          this.done.push(job);
        } catch (err) {
          job.error = err.message;
          if (job.attempts >= this.maxAttempts) {
            this.dead.push(job);
          } else {
            await this.sleep(this.baseDelayMs * 2 ** (job.attempts - 1)); // 200, 400, 800 ...
            this.#queue.push(job);
          }
        }
      }
      this.#running = false;
    })();
    return this.#idle;
  }
  #idle = Promise.resolve();
}
