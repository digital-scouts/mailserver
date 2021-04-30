import logger from '../logger';
import Distributor, { IDistributor } from '../models/distriburor';

function hasSenderPermission(from: string, mail: string): boolean {
  return false;
}

function distributeMail() {

}

/**
 *
 * @param from    - string sender
 * @param to      - string receiver
 * @param subject - string subject of mail
 * @param text    - string content of mail
 */
export async function handleNewDistribution(
  from: string, to: string, subject: string, text: string
) {
  const mail = to.split('@')[0];
  const distributor: IDistributor = await Distributor.findOne({ user: mail })
    .exec();

  if (distributor.sendRestricted && hasSenderPermission(from, mail)) {
    distributeMail();
  }

  logger.debug('handleNewDistribution');
}
