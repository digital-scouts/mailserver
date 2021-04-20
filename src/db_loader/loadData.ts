import Distributor from '../models/distriburor';
import ServiceMail from '../models/serviceMails';
import logger from '../logger';

const distributorData = [
  {
    name: 'Wölflinge',
    description: 'Verteiler für alle Neuigkeiten zur Gruppenstunden und Veranstaltung deiner Wölflingsmeute.',
    user: 'woelflinge',
    tags: 'woelfling',
    sendRestricted: true,
    subscribeRestricted: false
  },
  {
    name: 'Jungpfadfinder',
    description: 'Verteiler für alle Neuigkeiten zur Gruppenstunden und Veranstaltung deiner Jungpfadfindersippe.',
    user: 'jungpfadfinder',
    tags: 'jungpfadfinder',
    sendRestricted: true,
    subscribeRestricted: false
  },
  {
    name: 'Pfadfinder',
    description: 'Verteiler für alle Neuigkeiten zur Gruppenstunden und Veranstaltung deiner Pfadfindersippe.',
    user: 'pfadfinder',
    tags: 'pfadfinder',
    sendRestricted: true,
    subscribeRestricted: false
  },
  {
    name: 'Rover',
    description: 'Verteiler für alle Neuigkeiten zur Gruppenstunden und Veranstaltung deiner Roverrunde.',
    user: 'rover',
    tags: 'rover',
    sendRestricted: true,
    subscribeRestricted: false
  },
  {
    name: 'Ehemalige',
    description: 'Verteiler für alle Neuigkeiten und Veranstaltung für Ehemalige Mitglieder und Interessierte.',
    user: 'ehemalige',
    tags: 'ehemalige',
    sendRestricted: true,
    subscribeRestricted: false
  },
  {
    name: 'Leiterrunde',
    description: 'Verteiler für alle Neuigkeiten und Informationsaustausch innerhalb der Leiterrunde. Der erhalt von E-Mails aus diesem verteiler muss von einem Administrator bestätigt werden.',
    user: 'leiterrunde',
    tags: 'leiterrunde',
    sendRestricted: true,
    subscribeRestricted: true
  }
];
const serviceMailData = [
  {
    user: 'subscribe'
  }
];

export async function loadData() {
  await Distributor.collection.drop();
  await ServiceMail.collection.drop();

  distributorData.map(i => new Distributor(i).save());
  serviceMailData.map(i => new ServiceMail(i).save());
}
