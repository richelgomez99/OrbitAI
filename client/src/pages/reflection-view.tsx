import { ReflectionCard } from "@/components/reflection-card";
import { useOrbit } from "@/context/orbit-context";
import { motion } from "framer-motion";

export default function ReflectionView() {
  const { addReflection } = useOrbit();
  
  const handleReflectionSubmit = (mood: number, tags: string[], comment?: string) => {
    addReflection({
      mood,
      tags,
      comment,
    });
  };

  return (
    <div className="page-transition animate-fade-in flex flex-col items-center justify-center min-h-[80vh] px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <ReflectionCard onSubmit={handleReflectionSubmit} />
      </motion.div>
    </div>
  );
}
