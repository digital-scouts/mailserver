import Distributor from '../models/distriburor';
import ServiceMail from '../models/serviceMails';

const distributorData = [
  {
    name: 'Wölflinge',
    description: 'Verteiler für alle Neuigkeiten zur Gruppenstunden und Veranstaltung deiner Wölflingsmeute.',
    user: 'woelflinge',
    sendRestricted: true,
    subscribeRestricted: false
  },
  {
    name: 'Jungpfadfinder',
    description: 'Verteiler für alle Neuigkeiten zur Gruppenstunden und Veranstaltung deiner Jungpfadfindersippe.',
    user: 'jungpfadfinder',
    sendRestricted: true,
    subscribeRestricted: false
  },
  {
    name: 'Pfadfinder',
    description: 'Verteiler für alle Neuigkeiten zur Gruppenstunden und Veranstaltung deiner Pfadfindersippe.',
    user: 'pfadfinder',
    sendRestricted: true,
    subscribeRestricted: false
  },
  {
    name: 'Rover',
    description: 'Verteiler für alle Neuigkeiten zur Gruppenstunden und Veranstaltung deiner Roverrunde.',
    user: 'rover',
    sendRestricted: true,
    subscribeRestricted: false
  },
  {
    name: 'Ehemalige',
    description: 'Verteiler für alle Neuigkeiten und Veranstaltung für Ehemalige Mitglieder und Interessierte.',
    user: 'ehemalige',
    sendRestricted: true,
    subscribeRestricted: false
  },
  {
    name: 'Leiterrunde',
    description: 'Verteiler für alle Neuigkeiten und Informationsaustausch innerhalb der Leiterrunde. Der erhalt von E-Mails aus diesem verteiler muss von einem Administrator bestätigt werden.',
    user: 'leiterrunde',
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
