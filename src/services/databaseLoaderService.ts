import Distributor from '../models/distriburor';
import ServiceMail from '../models/serviceMails';

const distributorData = [
  {
    name: 'Wölflinge',
    description:
      'Verteiler für Neuigkeiten zu Gruppenstunden und Veranstaltungen deiner Wölflingsmeute.',
    mailPrefix: 'woelflinge',
    sendRestricted: true,
    subscribeRestricted: false
  },
  {
    name: 'Jungpfadfinder',
    description:
      'Verteiler für Neuigkeiten zu Gruppenstunden und Veranstaltungen deiner Jungpfadfindersippe.',
    mailPrefix: 'jungpfadfinder',
    sendRestricted: true,
    subscribeRestricted: false
  },
  {
    name: 'Pfadfinder',
    description:
      'Verteiler für Neuigkeiten zu Gruppenstunden und Veranstaltungen deiner Pfadfindersippe.',
    mailPrefix: 'pfadfinder',
    sendRestricted: true,
    subscribeRestricted: false
  },
  {
    name: 'Rover',
    description:
      'Verteiler für Neuigkeiten zu Gruppenstunden und Veranstaltungen deiner Roverrunde.',
    mailPrefix: 'rover',
    sendRestricted: true,
    subscribeRestricted: false
  },
  {
    name: 'Ehemalige',
    description:
      'Verteiler für Neuigkeiten und Veranstaltungen für Ehemalige Mitglieder und Interessierte.',
    mailPrefix: 'ehemalige',
    sendRestricted: true,
    subscribeRestricted: false
  },
  {
    name: 'Leiterrunde',
    description:
      'Verteiler für Neuigkeiten und Informationsaustausch innerhalb der Leiterrunde. Dieser Verteiler benötigt eine Freischaltung durch einen Admin.',
    mailPrefix: 'leiter',
    sendRestricted: false,
    subscribeRestricted: true
  }
];
const serviceMailData = [
  {
    mailPrefix: 'subscribe'
  }
];

async function saveInsert(Mongo: any, element: any) {
  const e = await Mongo.findOne(element).exec();
  if (e === null) {
    new Mongo(element).save();
  }
}

export async function databaseLoaderService() {
  distributorData.map(i => saveInsert(Distributor, i));
  serviceMailData.map(i => saveInsert(ServiceMail, i));
}
