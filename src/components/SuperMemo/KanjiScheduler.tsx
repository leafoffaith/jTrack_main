import GenericScheduler from './GenericScheduler';
import { KANJI_CONFIG } from './configs/deckConfigs';

const KanjiScheduler = (): JSX.Element => {
  return <GenericScheduler config={KANJI_CONFIG} />;
};

export default KanjiScheduler;
