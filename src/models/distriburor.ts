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
  email: string;
}

interface IDistributorModel extends Model<IDistributor> { }

const schema = new Schema<IDistributor>({
  name: { type: String, index: true, required: true },
  description: { type: String, index: true, required: true },
  email: { type: String, index: true, required: true }
});

// Add timestamp plugin for createdAt and updatedAt in miliseconds from epoch
schema.plugin(TimeStampPlugin);

const Distributor: IDistributorModel = model<IDistributor, IDistributorModel>('Distributor', schema);

export default Distributor;
