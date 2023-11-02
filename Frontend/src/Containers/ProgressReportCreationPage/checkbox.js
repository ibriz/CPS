import React from 'react';
import { callKeyStoreWallet } from '../../Redux/ICON/utils';

const Checkbox = ({ proposalKey, milestoneId, value, id, onChange }) => {
  const [isDisabled, setDisabled] = React.useState();
  // console.log("checkbox check mmiletone id--------------->",milestoneId)
  React.useEffect(() => {
    const fetchStatus = async () => {
      const statusResponse = await callKeyStoreWallet({
        method: 'getMileststoneStatusOf',
        params: {
          proposalKey,
          milestoneId,
        },
      });
      if (statusResponse === '0x1' || statusResponse === '0x3') {
        setDisabled(true);
      } else {
        setDisabled(false);
      }
    };
  
    fetchStatus();
  }, [proposalKey, milestoneId]);

  return (
    <input
      type='checkbox'
      class='custom-control-input'
      value={value}
      disabled={isDisabled}
      // disabled={milestoneStatus === '0x3' || milestoneStatus === '0x0'}
      id={id}
      onChange={onChange}
    />
  );
};

export default Checkbox;
