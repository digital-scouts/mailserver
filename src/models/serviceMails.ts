import { Model, Schema, model, Document } from 'mongoose';

export interface IServiceMail extends Document {
  _id: string;
  mailPrefix: string;
}

interface IServiceMailModel extends Model<IServiceMail> {}

const schema = new Schema<IServiceMail>(
  {
    mailPrefix: {
      unique: true,
      type: String,
      required: true
    }
  },
  {
    timestamps: true
  }
);

const ServiceMail: IServiceMailModel = model<IServiceMail, IServiceMailModel>(
  'ServiceMail',
  schema
);

export default ServiceMail;
