import { Model, Schema, model, Document } from 'mongoose';
import { IDistributor } from './distriburor';
import logger from '../logger';
import User, { IUser } from './user';

export interface IMail extends Document {
  _id: string;
  mailId: string;
  date: Date;
  subject: string;
  body: string;
  contentType: string;
  from: string;
  distributor: IDistributor;
  isAnswer: boolean;
  senderHasPermission: boolean;
  send: boolean;
  setIsAnswer: Function;
  setHasPermission: Function;
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
    contentType: {
      type: String
    },
    from: {
      type: String,
      required: true
    },
    isAnswer: {
      type: Boolean
    },
    senderHasPermission: {
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

/**
 * Determine if the mail is a answer to a previous email
 */
schema.methods.setIsAnswer = function () {
  logger.debug(
    `(${this.mailId}) isAnswer: ${this.subject.toLowerCase().includes('re:')}`
  );
  this.isAnswer = this.subject.toLowerCase().includes('re:');
};

/**
 * check if sender is allowed to send mail to distributor
 */
schema.methods.setHasPermission = async function () {
  const user: IUser = await User.findOne({ email: this.from }).exec();

  if (!user) {
    logger.warn('Send mail failed. Sender not found');
    this.senderHasPermission = false;
    return;
  }

  const allowed = user.allowedDistributors.find(
    (d: IDistributor) => d._id.toString() === this.distributor.id
  );
  logger.debug(`isAllowed: ${allowed !== undefined}`);
  this.senderHasPermission = allowed !== undefined;
};

schema.pre('save', async function (next) {
  this.setIsAnswer();
  await this.setHasPermission();
  next();
});

const Mail: IMailModel = model<IMail, IMailModel>('Mail', schema);

export default Mail;
