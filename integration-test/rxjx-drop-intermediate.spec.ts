import { dropIntermediate } from '../src/index';
//import { execSync } from 'child_process';
import { firstValueFrom, map, Subject, take, tap, toArray } from 'rxjs';
import { WebSocket } from 'ws';
import { exec, execSync } from 'child_process';

describe('dropIntermediate - Integration tests', () => {
  jest.setTimeout(10000);
  let webSocket!: WebSocket;
  beforeEach(() => {
    exec('node server/build/server.js');
    execSync('sleep 1');
    webSocket = new WebSocket('ws://localhost:8090');
  });

  afterEach(() => {
    webSocket.close();
    execSync('sleep 1');
  });

  it('should drop intermediate messages received via websocket', async () => {
    const subject = new Subject<string>();
    webSocket.onmessage = (m) => subject.next(m.data.toLocaleString());
    const actual = await firstValueFrom(
      subject.pipe(
        dropIntermediate(),
        map((v) => parseInt(v)),
        tap(() => execSync('sleep 2')),
        take(2),
        toArray(),
        map((a) => a[1] - a[0])
      )
    );

    expect(actual).toBeGreaterThan(5);
  });

  it('should not drop intermediate messages received via websocket when there is no congestion', async () => {
    const subject = new Subject<string>();
    webSocket.onmessage = (m) => subject.next(m.data.toLocaleString());
    const actual = await firstValueFrom(
      subject.pipe(
        dropIntermediate(),
        map((v) => parseInt(v)),
        take(10),
        toArray(),
        map((a) => a[9] - a[0])
      )
    );

    expect(actual).toEqual(9);
  });
});
