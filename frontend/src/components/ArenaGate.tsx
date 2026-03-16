import { motion } from "framer-motion"
import { useState } from "react"

export default function ArenaGate({ title, onEnter }: any) {

  const [opening, setOpening] = useState(false)

  const handleEnter = () => {
    setOpening(true)

    setTimeout(() => {
      onEnter()
    }, 500)
  }

  return (

    <motion.div
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.95 }}
      animate={opening ? { scale: 1.4, opacity: 0 } : {}}
      transition={{ duration: 0.5 }}
      onClick={handleEnter}
      className="bg-slate-800/90 backdrop-blur p-14 rounded-xl cursor-pointer text-center border border-blue-500 shadow-2xl w-72 text-white"
    >

      <h2 className="text-2xl font-bold text-blue-400">

        ⚔ {title}

      </h2>

    </motion.div>

  )

}