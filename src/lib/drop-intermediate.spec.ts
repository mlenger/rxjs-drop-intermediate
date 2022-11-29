import { lastValueFrom, Subject } from 'rxjs';
import { tap, toArray } from 'rxjs/operators';

import { dropIntermediate } from './drop-intermediate';

describe('dopIntermediate', () => {
  it('should drop intermediate values', async () => {
    const subject = new Subject<number>();
    const actualPromise = subject
      .pipe(dropIntermediate(), toArray())
      .toPromise();

    for (let i = 0; i < 3; i++) {
      setTimeout(() => subject.next(i));
    }
    setTimeout(() => subject.complete());
    const actual = await actualPromise;

    expect(actual).toEqual([2]);
  });

  it('should deliver all values if there is enough time', async () => {
    const subject = new Subject<number>();
    const actualPromise = subject
      .pipe(
        dropIntermediate(),
        tap((v) => {
          if (v < 2) {
            setTimeout(() => subject.next(v + 1), 0);
          } else {
            subject.complete();
          }
        }),
        toArray()
      )
      .toPromise();

    setTimeout(() => subject.next(0));
    const actual = await actualPromise;

    expect(actual).toEqual([0, 1, 2]);
  });

  it('should allow recursion', async () => {
    const subject = new Subject<number>();
    const actualPromise = lastValueFrom(
      subject.pipe(
        dropIntermediate(),
        tap((v) => {
          if (v < 2) {
            subject.next(v + 1);
          } else {
            subject.complete();
          }
        }),
        toArray()
      )
    );

    setTimeout(() => subject.next(0));
    const actual = await actualPromise;

    expect(actual).toEqual([0, 1, 2]);
  });

  it('should forward errors correctly', async () => {
    let actual: unknown | undefined;
    const subject = new Subject<number>();
    const error = new Error('Test');
    const actualPromise = lastValueFrom(
      subject.pipe(
        dropIntermediate(),
        tap((v) => {
          if (v < 2) {
            setTimeout(() => subject.next(v + 1), 0);
          } else {
            subject.error(error);
          }
        })
      )
    );

    setTimeout(() => subject.next(0));
    try {
      await actualPromise;
    } catch (e) {
      actual = e;
    }

    expect(actual).toBe(error);
  });

  it('should allow immediate completion', async () => {
    const subject = new Subject<number>();
    const actualPromise = lastValueFrom(
      subject.pipe(dropIntermediate(), toArray())
    );

    subject.complete();
    const actual = await actualPromise;

    expect(actual).toEqual([]);
  });

  it('should forward immediate errors correctly', async () => {
    let actual: unknown | undefined;
    const subject = new Subject<number>();
    const error = new Error('Test');
    const actualPromise = lastValueFrom(subject.pipe(dropIntermediate()));

    subject.error(error);
    try {
      await actualPromise;
    } catch (e) {
      actual = e;
    }

    expect(actual).toBe(error);
  });

  it('should forward values before error correctly', async () => {
    const actual = [];
    const subject = new Subject<number>();
    const error = new Error('Test');
    const actualPromise = lastValueFrom(
      subject.pipe(
        dropIntermediate(),
        tap((v) => {
          actual.push(v);
          if (v < 1) {
            setTimeout(() => subject.next(v + 1), 0);
          } else {
            setTimeout(() => {
              subject.next(2);
              subject.error(error);
            }, 0);
          }
        })
      )
    );

    setTimeout(() => subject.next(0));
    try {
      await actualPromise;
    } catch (e) {
      // ignore
    }

    expect(actual).toEqual([0, 1, 2]);
  });
});
