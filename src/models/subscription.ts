import { Model, Schema, model } from 'mongoose';
import TimeStampPlugin, { ITimeStampedDocument } from './plugins/timestamp-plugin';

export interface ISubscription extends ITimeStampedDocument {
  _id: string;
  name: string;
  email: string;
  distributors: string;
  confirmed: boolean;
}

interface ISubscriptionModel extends Model<ISubscription> {
}

const schema = new Schema<ISubscription>({
  name: { type: String },
  email: {
    type: String,
    unique: true,
    required: true
  },
  distributors: [{ type: String }],
  confirmed: {
    type: Boolean,
    required: true,
    default: false
  }
});

// Add timestamp plugin for createdAt and updatedAt in miliseconds from epoch
schema.plugin(TimeStampPlugin);

const Subscription: ISubscriptionModel = model<ISubscription, ISubscriptionModel>('Subscription', schema);

export default Subscription;
