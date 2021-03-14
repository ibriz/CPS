import React from 'react';
import {Modal, Row, Col} from 'react-bootstrap';
import styles from './PRepListModal.module.css';
import {trackerURL} from 'Redux/ICON/utils';

function PRepListModal({preps, ...props}) {

    let [prepList, setPrepList] = React.useState([]);

    React.useEffect(() => {
        let prepList = preps.slice();
         prepList = prepList.sort(function (a, b) {
            if(a.name.toLowerCase() < b.name.toLowerCase() ) return -1;
            if(a.name.toLowerCase() > b.name.toLowerCase()) return 1;
            return 0;
            })
        setPrepList(prepList);
    }, [preps])

    return (
      <Modal
        {...props}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
            List of P-Reps
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {
              prepList.map(prep => <>
            <a href = {`${trackerURL}/${prep.address}`} target = "_blank" style = {{color: '#262626'}} className = {styles.link}>

              <Row>

                    <Col lg = "5" className = {styles.name}>{prep.name}</Col>
                    <Col lg = "7" className = {styles.address}>
                        {prep.address}
                    </Col>
                </Row>
            </a>
                <hr className = {styles.horizontalRule}/>

                </>
              )
          }


        </Modal.Body>

      </Modal>
    );
  }

  export default PRepListModal