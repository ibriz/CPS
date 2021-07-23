import React from "react";
import { FormControl, InputGroup } from "react-bootstrap";
import { AiOutlineSearch } from "react-icons/ai";
import styles from "./NavBarInputGroup.module.scss";
// import {FontAwesomeIcon} from '@fortawesome/react-fontawesome'

const NavBarInputGroup = ({
  placeholder,
  value,
  setValue,
  maxWidth = false,
}) => {
  return (
    <InputGroup
      className={styles.inputGroup}
      style={maxWidth === true ? { minWidth: "100%" } : {}}
    >
      <FormControl
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={placeholder}
        aria-label="Recipient's username"
        aria-describedby="basic-addon2"
        type="search"
      />
      <InputGroup.Append className={styles.inputGroupAppend}>
        <InputGroup.Text>
          <AiOutlineSearch />
          {/* {'abc'} */}
          {/* <FontAwesomeIcon icon={["fal", "coffee"]} /> */}
        </InputGroup.Text>
      </InputGroup.Append>
    </InputGroup>
  );
};

export default NavBarInputGroup;
