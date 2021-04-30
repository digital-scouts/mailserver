import User, { IUser } from '../models/user';

export async function confirmDistributor(id: string): Promise<IUser> {
  return User.findOneAndUpdate({ 'subscribedDistributors._id': id }, {
    $set: {
      'subscribedDistributors.$._id': id,
      'subscribedDistributors.$.confirmed': true
    }
  })
    .exec();
}
