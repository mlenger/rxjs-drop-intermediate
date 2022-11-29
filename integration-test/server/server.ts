import { exit } from 'process';
import { OPEN, WebSocketServer } from 'ws';

export class Server {
  private connector?: WebSocketServer;

  start() {
    this.connector = new WebSocketServer({ port: 8090, host: 'localhost' });
    this.connector.on('connection', (socket) => {
      let i = 0;
      setInterval(() => {
        if (socket.readyState === OPEN) {
          socket.send(i++);
        } else {
          exit(0);
        }
      }, 200);
    });
  }
}

new Server().start();
