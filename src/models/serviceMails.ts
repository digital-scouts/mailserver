import {
  Model, Schema, model
} from 'mongoose';
import TimeStampPlugin, {
  ITimeStampedDocument
} from './plugins/timestamp-plugin';

export interface IServiceMail extends ITimeStampedDocument {
  _id: string;
  user: string;
}

interface IServiceMailModel extends Model<IServiceMail> {
}

const schema = new Schema<IServiceMail>({
  user: {
    unique: true,
    type: String,
    required: true
  }
});
schema.plugin(TimeStampPlugin);

const ServiceMail: IServiceMailModel = model<IServiceMail, IServiceMailModel>('ServiceMail', schema);

export default ServiceMail;
