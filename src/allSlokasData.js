// Aggregates all slokas from all slokas_*.json files for random selection
// and for search across all prayers

import slokas_Akrura from '../slokas_Akrura.json';
import slokas_Arjuna from '../slokas_Arjuna.json';
import slokas_bhishma from '../slokas_bhishma.json';
import slokas_Brahma from '../slokas_Brahma.json';
import slokas_Demigods from '../slokas_Demigods.json';
import slokas_Devahuti from '../slokas_Devahuti.json';
import slokas_Dhruva from '../slokas_Dhruva.json';
import slokas_Gajendra from '../slokas_Gajendra.json';
import slokas_Gopis from '../slokas_Gopis.json';
import slokas_Indra from '../slokas_Indra.json';
import slokas_Kardama_Muni from '../slokas_Kardama_Muni.json';
import slokas_King_Citraketu from '../slokas_King_Citraketu.json';
import slokas_Ladies_of_Hastinapura from '../slokas_Ladies_of_Hastinapura.json';
import slokas_Maharaja_Prthu from '../slokas_Maharaja_Prthu.json';
import slokas_Muchukunda from '../slokas_Muchukunda.json';
import slokas_Nala_Kubera from '../slokas_Nala_Kubera.json';
import slokas_Prahlada from '../slokas_Prahlada.json';
import slokas_Queen_Kunti from '../slokas_Queen_Kunti.json';
import slokas_Satyavrata from '../slokas_Satyavrata.json';
import slokas_Sukadeva_Goswami from '../slokas_Sukadeva_Goswami.json';
import slokas_Vedas from '../slokas_Vedas.json';
import slokas_Vritrasura from '../slokas_Vritrasura.json';
import slokas_Vyasadeva from '../slokas_Vyasadeva.json';
import slokas_Wives_of_Kaliya from '../slokas_Wives_of_Kaliya.json';

const allSources = [
  { fileName: 'slokas_Akrura.json', prayerTitle: 'Prayers by Akrura', data: slokas_Akrura },
  { fileName: 'slokas_Arjuna.json', prayerTitle: 'Prayers by Arjuna', data: slokas_Arjuna },
  { fileName: 'slokas_bhishma.json', prayerTitle: 'Prayers by Bhishma', data: slokas_bhishma },
  { fileName: 'slokas_Brahma.json', prayerTitle: 'Prayers by Brahma', data: slokas_Brahma },
  { fileName: 'slokas_Demigods.json', prayerTitle: 'Prayers by Demigods', data: slokas_Demigods },
  { fileName: 'slokas_Devahuti.json', prayerTitle: 'Prayers by Devahuti', data: slokas_Devahuti },
  { fileName: 'slokas_Dhruva.json', prayerTitle: 'Prayers by Dhruva', data: slokas_Dhruva },
  { fileName: 'slokas_Gajendra.json', prayerTitle: 'Prayers by Gajendra', data: slokas_Gajendra },
  { fileName: 'slokas_Gopis.json', prayerTitle: 'Prayers by Gopis', data: slokas_Gopis },
  { fileName: 'slokas_Indra.json', prayerTitle: 'Prayers by Indra', data: slokas_Indra },
  { fileName: 'slokas_Kardama_Muni.json', prayerTitle: 'Prayers by Kardama Muni', data: slokas_Kardama_Muni },
  { fileName: 'slokas_King_Citraketu.json', prayerTitle: 'Prayers by King Citraketu', data: slokas_King_Citraketu },
  { fileName: 'slokas_Ladies_of_Hastinapura.json', prayerTitle: 'Prayers by Ladies of Hastinapura', data: slokas_Ladies_of_Hastinapura },
  { fileName: 'slokas_Maharaja_Prthu.json', prayerTitle: 'Prayers by Maharaja Prthu', data: slokas_Maharaja_Prthu },
  { fileName: 'slokas_Muchukunda.json', prayerTitle: 'Prayers by Muchukunda', data: slokas_Muchukunda },
  { fileName: 'slokas_Nala_Kubera.json', prayerTitle: 'Prayers by Nala Kubera', data: slokas_Nala_Kubera },
  { fileName: 'slokas_Prahlada.json', prayerTitle: 'Prayers by Prahlada', data: slokas_Prahlada },
  { fileName: 'slokas_Queen_Kunti.json', prayerTitle: 'Prayers by Queen Kunti', data: slokas_Queen_Kunti },
  { fileName: 'slokas_Satyavrata.json', prayerTitle: 'Prayers by Satyavrata', data: slokas_Satyavrata },
  { fileName: 'slokas_Sukadeva_Goswami.json', prayerTitle: 'Prayers by Sukadeva Goswami', data: slokas_Sukadeva_Goswami },
  { fileName: 'slokas_Vedas.json', prayerTitle: 'Prayers by Vedas', data: slokas_Vedas },
  { fileName: 'slokas_Vritrasura.json', prayerTitle: 'Prayers by Vritrasura', data: slokas_Vritrasura },
  { fileName: 'slokas_Vyasadeva.json', prayerTitle: 'Prayers by Vyasadeva', data: slokas_Vyasadeva },
  { fileName: 'slokas_Wives_of_Kaliya.json', prayerTitle: 'Prayers by Wives of Kaliya', data: slokas_Wives_of_Kaliya },
];

const allSlokasData = allSources.flatMap(source =>
  source.data.map(sloka => ({
    prayerTitle: source.prayerTitle,
    fileName: source.fileName,
    sloka,
  }))
);

export default allSlokasData;
