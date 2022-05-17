import { Model, Schema, model, Document } from 'mongoose';
import { IDistributor } from './distriburor';

export interface IMail extends Document {
  _id: string;
  mailId: string;
  date: Date;
  subject: string;
  body: string;
  from: string;
  distributor: IDistributor;
  isAnswer: boolean;
  adminOnly: boolean;
  send: boolean;
}

interface IMailModel extends Model<IMail> {}

const schema = new Schema<IMail>(
  {
    mailId: {
      type: String,
      required: true
    },
    distributor: {
      type: Schema.Types.ObjectId,
      ref: 'Distributor',
      required: true
    },
    date: {
      type: Date,
      required: true
    },
    subject: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    from: {
      type: String,
      required: true
    },
    isAnswer: {
      type: Boolean
    },
    adminOnly: {
      type: Boolean
    },
    send: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

schema.index({ mailId: 1, distributor: 1 }, { unique: true });

const Mail: IMailModel = model<IMail, IMailModel>('Mail', schema);

export default Mail;
