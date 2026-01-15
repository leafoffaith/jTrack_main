import GenericScheduler from './GenericScheduler';
import { HIRAGANA_CONFIG } from './configs/deckConfigs';

const HiraganaScheduler = (): JSX.Element => {
  return <GenericScheduler config={HIRAGANA_CONFIG} />;
};

export default HiraganaScheduler;
