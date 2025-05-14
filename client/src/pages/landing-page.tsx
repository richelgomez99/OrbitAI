import { OrbitLogo } from "@/components/orbit-logo";
import { Button } from "@/components/ui/button";
import { MoodPicker } from "@/components/mood-picker";
import { useOrbit } from "@/context/orbit-context";
import { CloudLightning, Brain, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  const { 
    mode, 
    setMode, 
    mood, 
    setMood, 
    energy, 
    setEnergy, 
    startApp 
  } = useOrbit();

  return (
    <div className="page-transition flex flex-col items-center justify-center min-h-screen text-center py-10 px-4">
      {/* Logo Animation */}
      <OrbitLogo className="mb-6" />
      
      {/* App Name */}
      <h1 className="text-4xl font-display font-bold mb-2 text-primary">ORBIT</h1>
      
      {/* Tagline */}
      <p className="text-xl text-secondary mb-12 max-w-md">
        Momentum-first OS for nonlinear builders
      </p>
      
      {/* Mode Picker */}
      <div className="w-full max-w-md mb-10">
        <h2 className="text-lg font-display mb-3 text-primary">Mode Picker</h2>
        <div className="flex gap-2 p-1 rounded-2xl bg-surface/50 backdrop-blur-sm">
          <Button
            variant={mode === "build" ? "modeActive" : "mode"}
            onClick={() => setMode("build")}
          >
            <CloudLightning className="h-5 w-5 text-[#9F7AEA] mr-2" />
            <span className="font-medium">Build</span>
          </Button>
          
          <Button
            variant={mode === "recover" ? "modeActive" : "mode"}
            onClick={() => setMode("recover")}
          >
            <Heart className="h-5 w-5 text-[#FC8181] mr-2" />
            <span className="font-medium">Recover</span>
          </Button>
          
          <Button
            variant={mode === "reflect" ? "modeActive" : "mode"}
            onClick={() => setMode("reflect")}
          >
            <Brain className="h-5 w-5 text-[#76E4F7] mr-2" />
            <span className="font-medium">Reflect</span>
          </Button>
        </div>
      </div>
      
      {/* Mood Intake */}
      <div className="w-full max-w-md mb-10">
        <MoodPicker
          selectedMood={mood}
          energy={energy}
          onMoodChange={setMood}
          onEnergyChange={setEnergy}
        />
      </div>
      
      {/* Begin Button */}
      <motion.div
        className="w-full max-w-md"
        whileHover={{ scale: 1.02 }}
      >
        <Button
          onClick={startApp}
          className="w-full py-4 px-6 text-lg"
        >
          Begin
        </Button>
      </motion.div>
    </div>
  );
}
