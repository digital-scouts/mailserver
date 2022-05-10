export class MailInputQueue {
  items: any[];

  constructor(...params: any[]) {
    this.items = [...params];
  }

  enqueue(item: any) {
    this.items.push(item);
  }

  dequeue() {
    return this.items.shift();
  }

  getItems() {
    return this.items;
  }
}
