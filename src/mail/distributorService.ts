import logger from '../logger';

/**
 *
 * @param from    - string sender
 * @param to      - string receiver
 * @param subject - string subject of mail
 * @param text    - string content of mail
 */
export function handleNewDistribution(from: string, to: string, subject: string, text: string) {
  logger.debug('handleNewDistribution');
}
