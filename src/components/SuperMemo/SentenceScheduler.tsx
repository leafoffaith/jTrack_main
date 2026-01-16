import GenericScheduler from './GenericScheduler';
import { SENTENCE_CONFIG } from './configs/deckConfigs';

const SentenceScheduler = (): JSX.Element => {
  return <GenericScheduler config={SENTENCE_CONFIG} />;
};

export default SentenceScheduler;
