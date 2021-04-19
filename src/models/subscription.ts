import {
  Model, Schema, model
} from 'mongoose';
import TimeStampPlugin, {
  ITimeStampedDocument
} from './plugins/timestamp-plugin';

export interface ISubscription extends ITimeStampedDocument {
  _id: string;
  email: string;
  distributor: string;
}

interface ISubscriptionModel extends Model<ISubscription> { }

const schema = new Schema<ISubscription>({
  email: { type: String, index: true, required: true },
  author: { type: String, index: true, required: true }
});

// Add timestamp plugin for createdAt and updatedAt in miliseconds from epoch
schema.plugin(TimeStampPlugin);

const Subscription: ISubscriptionModel = model<ISubscription, ISubscriptionModel>('Subscription', schema);

export default Subscription;
