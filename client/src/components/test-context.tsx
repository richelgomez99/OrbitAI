import { useOrbit } from "@/context/orbit-context";
import { useEffect } from "react";

export function TestContext() {
  const { mode } = useOrbit();
  
  useEffect(() => {
    console.log("Mode from context:", mode);
  }, [mode]);
  
  return <div>Testing Context: Current Mode is {mode}</div>;
}