import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mode } from "@/lib/utils";
import { useOrbit } from "@/context/orbit-context";
import { CloudLightning, Cog, Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function ModeSwitcher() {
  const { 
    mode, 
    setMode, 
    showModeSwitcher, 
    setShowModeSwitcher 
  } = useOrbit();

  return (
    <Dialog open={showModeSwitcher} onOpenChange={setShowModeSwitcher}>
      <DialogContent className="sm:max-w-md rounded-3xl border border-gray-800 bg-card">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-medium text-center">Switch Mode</DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-3 p-2 rounded-2xl bg-surface/50 backdrop-blur-sm">
          <Button
            variant={mode === "build" ? "modeActive" : "mode"}
            onClick={() => setMode("build")}
            className="flex flex-col"
          >
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="mb-1"
            >
              <CloudLightning className="h-6 w-6 text-[#9F7AEA]" />
            </motion.div>
            <span className="font-medium">Build</span>
          </Button>
          
          <Button
            variant={mode === "maintain" ? "modeActive" : "mode"}
            onClick={() => setMode("maintain")}
            className="flex flex-col"
          >
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="mb-1"
            >
              <Cog className="h-6 w-6 text-[#76E4F7]" />
            </motion.div>
            <span className="font-medium">Maintain</span>
          </Button>
          
          <Button
            variant={mode === "recover" ? "modeActive" : "mode"}
            onClick={() => setMode("recover")}
            className="flex flex-col"
          >
            <motion.div 
              whileHover={{ scale: 1.1 }}
              className="mb-1"
            >
              <Heart className="h-6 w-6 text-[#FC8181]" />
            </motion.div>
            <span className="font-medium">Recover</span>
          </Button>
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
