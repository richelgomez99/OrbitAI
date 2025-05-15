import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mode, getModeTheme } from "@/lib/utils";
import { useOrbit } from "@/context/orbit-context";
import { CloudLightning, Heart, Wind } from "lucide-react"; // Added Wind, removed Cog
import { motion } from "framer-motion";

export default function ModeSwitcher() {
  const { 
    mode, 
    setMode, 
    showModeSwitcher, 
    setShowModeSwitcher 
  } = useOrbit();

  const modeConfig: { 
    key: Mode;
    IconComponent: React.ElementType;
    iconColor: string;
  }[] = [
    { key: "build", IconComponent: CloudLightning, iconColor: "text-[#9F7AEA]" },
    { key: "restore", IconComponent: Heart, iconColor: "text-[#FC8181]" },
    { key: "flow", IconComponent: Wind, iconColor: "text-green-400" },
  ];

  return (
    <Dialog open={showModeSwitcher} onOpenChange={setShowModeSwitcher}>
      <DialogContent className="sm:max-w-md rounded-3xl border border-gray-800 bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-medium text-center">Switch Mode</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-3 p-2 rounded-2xl bg-surface/50 backdrop-blur-sm">
          {modeConfig.map((configItem) => {
            const modeDetails = getModeTheme(configItem.key);
            return (
              <Button
                key={configItem.key}
                variant={mode === configItem.key ? "modeActive" : "mode"}
                onClick={() => setMode(configItem.key)}
                className="flex flex-col flex-1"
              >
                <motion.div 
                  whileHover={{ scale: 1.1 }}
                  className="mb-1"
                >
                  <configItem.IconComponent className={`h-6 w-6 ${configItem.iconColor}`} />
                </motion.div>
                <span className="font-medium">{modeDetails.modeLabel}</span>
              </Button>
            );
          })}
        </div>
        
        <div className="mt-6 flex justify-center">
          <Button onClick={() => setShowModeSwitcher(false)}>
            Apply
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
