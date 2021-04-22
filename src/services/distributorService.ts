import Distributor from '../models/distriburor';

export function getAllDistributors() {
  return Distributor.find({}, 'name description user')
    .exec();
}
