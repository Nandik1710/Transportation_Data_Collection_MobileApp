// Token bucket rate limiter for client requests
export class TokenBucket {
  constructor({ capacity = 15, refillInterval = 60000 }) {
    this.capacity = capacity;
    this.tokens = capacity;
    this.refillInterval = refillInterval;
    setInterval(() => {
      this.tokens = capacity;
    }, refillInterval);
  }

  tryRemoveToken() {
    if (this.tokens > 0) {
      this.tokens -= 1;
      return true;
    }
    return false;
  }
}
