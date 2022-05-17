import { Model, Schema, model, Document } from 'mongoose';
import { IDistributor } from './distriburor';

export interface IUser extends Document {
  _id?: string;
  name: string;
  email: string;
  subscribedDistributors: Array<{
    _id?: string;
    distributor: IDistributor;
    confirmed: boolean;
  }>;
  allowedDistributors: Array<IDistributor>;
}

interface IUserModel extends Model<IUser> {}

const schema = new Schema<IUser>(
  {
    name: { type: String },
    email: {
      type: String,
      unique: true,
      required: true
    },
    subscribedDistributors: [
      {
        distributor: {
          type: Schema.Types.ObjectId,
          ref: 'Distributor'
        },
        confirmed: Boolean
      }
    ],
    allowedDistributors: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Distributor'
      }
    ]
  },
  {
    timestamps: true
  }
);

const User: IUserModel = model<IUser, IUserModel>('User', schema);

export default User;
