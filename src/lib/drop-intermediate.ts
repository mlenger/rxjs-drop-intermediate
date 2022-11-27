import { Observable } from 'rxjs';

type Timeout = ReturnType<typeof setTimeout>;

export function dropIntermediate() {
  return function <T>(source: Observable<T>): Observable<T> {
    return new Observable((subscriber) => {
      let updateEvent: Timeout | undefined;
      let nextValue: T | undefined;
      let complete = false;
      let error: unknown;

      function scheduleUpdate(value: T): Timeout {
        return setTimeout(() => {
          let currentValue = nextValue ?? value;
          while (currentValue !== undefined) {
            nextValue = undefined;
            subscriber.next(currentValue);
            currentValue = nextValue;
          }
          if (complete) {
            subscriber.complete();
          }
          if (error) {
            subscriber.error(error);
          }
          updateEvent = undefined;
        }, 0);
      }

      return source.subscribe({
        next(value) {
          if (updateEvent === undefined) {
            updateEvent = scheduleUpdate(value);
          } else {
            nextValue = value;
          }
        },
        error(e) {
          error = e;
          if (updateEvent === undefined) {
            subscriber.error(e);
          }
        },
        complete() {
          complete = true;
          if (updateEvent === undefined) {
            subscriber.complete();
          }
        },
      });
    });
  };
}
