import { Model, Schema, model, Document } from 'mongoose';
import { IUser } from './user';

export interface IDistributor extends Document {
  _id: string;
  name: string;
  description: string;
  mailPrefix: string;
  sendRestricted: boolean;
  subscribeRestricted: boolean;
  admins: Array<IUser>;
}

interface IDistributorModel extends Model<IDistributor> {}

const schema = new Schema<IDistributor>(
  {
    name: {
      unique: true,
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    mailPrefix: {
      unique: true,
      type: String,
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
    },
    admins: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: false
      }
    ]
  },
  {
    timestamps: true
  }
);

const Distributor: IDistributorModel = model<IDistributor, IDistributorModel>(
  'Distributor',
  schema
);

export default Distributor;
