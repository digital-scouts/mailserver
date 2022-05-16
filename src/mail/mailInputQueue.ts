import { InboundMail } from "../models/inboundMail";

export class MailInputQueue {
  items: Array<InboundMail>;
  private static _instance: MailInputQueue;

  constructor(...params: Array<InboundMail>) {
    this.items = [...params];
  }

  enqueue(item: InboundMail): void {
    this.items.push(item);
  }

  dequeue(): InboundMail {
    return this.items.shift();
  }

  getItems(): Array<InboundMail> {
    return this.items;
  }

  public static get Instance(): MailInputQueue {
    return this._instance || (this._instance = new this());
  }
}
