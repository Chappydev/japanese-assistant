import { LineContext } from "@/contexts/LineContext";
import React, { useContext, useEffect } from "react";
import AccordionChip from "../AccordionChip";
import Chip from "../Chip";
import s from "./ChatBubble.module.scss";

const ChatBubble = ({ role, options = null, children }) => {
  return (
    // Outer div should span full width of container
    <div className={s.wrapper}>
      {/* Inner divs are the actual chat bubble and any chips underneath */}
      <div className={s.innerWrapper}>
        <div className={s.messageBubble} data-role={role}>
          {children}
        </div>
        {role === "assistant" && (
          <div className={s.chips}>
            {options.map((option, ind) => (
              <Chip key={ind} onClick={option.handler}>
                {option.name}
              </Chip>
            ))}
            {/* <AccordionChip
              options={["Translate", "Expand", "Dialect", "Test"]}
            /> */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatBubble;
