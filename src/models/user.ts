import { Model, Schema, model } from 'mongoose';
import TimeStampPlugin, { ITimeStampedDocument } from './plugins/timestamp-plugin';

export interface IUser extends ITimeStampedDocument {
  _id?: string;
  name: string;
  email: string;
  subscribedDistributors: Array<{_id?: string, email: string, confirmed: boolean}>;
  allowedDistributors: Array<string>;
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
    email: String,
    confirmed: Boolean
  }],
  allowedDistributors: [{
    type: String
  }]
});

// Add timestamp plugin for createdAt and updatedAt in miliseconds from epoch
schema.plugin(TimeStampPlugin);

const User: IUserModel = model<IUser, IUserModel>('User', schema);

export default User;
