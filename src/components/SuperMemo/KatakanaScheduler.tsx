import GenericScheduler from './GenericScheduler';
import { KATAKANA_CONFIG } from './configs/deckConfigs';

const KatakanaScheduler = (): JSX.Element => {
  return <GenericScheduler config={KATAKANA_CONFIG} />;
};

export default KatakanaScheduler;
