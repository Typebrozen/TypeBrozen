import { useMemo, useState } from "react";
import { createHindiState } from "../engines/HindiEngine";

export default function useHindiTyping(initialText = "") {
  const [targetText, setTargetText] = useState(initialText);
  const [typedText, setTypedText] = useState("");

  const state = useMemo(() => {
    return createHindiState(targetText, typedText);
  }, [targetText, typedText]);

  function handleChange(value) {
    setTypedText(value);
  }

  function reset(newText = targetText) {
    setTypedText("");
    setTargetText(newText);
  }

  return {
    targetText,
    typedText,

    setTargetText,
    setTypedText,

    handleChange,
    reset,

    ...state,
  };
}