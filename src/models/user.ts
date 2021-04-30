import { Model, Schema, model } from 'mongoose';
import * as mongoose from 'mongoose';
import TimeStampPlugin, { ITimeStampedDocument } from './plugins/timestamp-plugin';
import { IDistributor } from './distriburor';

export interface IUser extends ITimeStampedDocument {
  _id?: string;
  name: string;
  email: string;
  subscribedDistributors: Array<{ _id?: string, distributor: IDistributor, confirmed: boolean }>;
  allowedDistributors: Array<IDistributor>;
}

interface IUserModel extends Model<IUser> {
}

const schema = new Schema<IUser>({
  name: { type: String },
  email: {
    type: String,
    unique: true,
    required: true
  },
  subscribedDistributors: [{
    distributor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Distributor'
    },
    confirmed: Boolean
  }],
  allowedDistributors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Distributor'
  }]
});

// Add timestamp plugin for createdAt and updatedAt in miliseconds from epoch
schema.plugin(TimeStampPlugin);

const User: IUserModel = model<IUser, IUserModel>('User', schema);

export default User;
