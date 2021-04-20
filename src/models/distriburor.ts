import {
  Model, Schema, model
} from 'mongoose';
import TimeStampPlugin, {
  ITimeStampedDocument
} from './plugins/timestamp-plugin';

export interface IDistributor extends ITimeStampedDocument {
  _id: string;
  name: string;
  description: string;
  user: string;
  tags: Array<string>;
  sendRestricted: boolean;
  subscribeRestricted: boolean;
}

interface IDistributorModel extends Model<IDistributor> {
}

const schema = new Schema<IDistributor>({
  name: {
    unique: true,
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  user: {
    unique: true,
    type: String,
    required: true
  },
  tags: {
    type: String,
    unique: true,
    required: true
  },
  sendRestricted: {
    type: Boolean,
    required: true,
    default: true
  },
  subscribeRestricted: {
    type: Boolean,
    required: true,
    default: false
  }
});
schema.plugin(TimeStampPlugin);

const Distributor: IDistributorModel = model<IDistributor, IDistributorModel>('Distributor', schema);

export default Distributor;
