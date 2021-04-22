import Subscription, { ISubscription } from '../models/subscription';

export function confirmDistributor(id: string): Promise<ISubscription> {
  return Subscription.findOneAndUpdate({ id }, { confirmed: true })
    .exec();
}
