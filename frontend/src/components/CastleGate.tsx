import { motion } from "framer-motion"
import { useState } from "react"
import doorSound from "../assets/door_open.mp3"

type Props = {
  onOpen: () => void
}

export default function CastleGate({ onOpen }: Props) {

  const [opened, setOpened] = useState(false)

  const openGate = () => {

    setOpened(true)

    const audio = new Audio(doorSound)
    audio.volume = 0.7
    audio.play()

    // wait for the door animation + sound
    setTimeout(() => {
      onOpen()
    }, 4000)
  }

  return (

    <div className="fixed inset-0 z-50 flex">

      {/* LEFT DOOR */}

      <motion.div
        animate={opened ? { x: "-100%" } : { x: 0 }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="w-1/2 h-full bg-[url('/src/assets/ldoor.png')] bg-cover border-r-8 border-amber-700 shadow-2xl flex items-center justify-center"
      >
        <span className="text-4xl text-amber-400">🏰</span>
      </motion.div>

      {/* RIGHT DOOR */}

      <motion.div
        animate={opened ? { x: "100%" } : { x: 0 }}
        transition={{ duration: 4, ease: "easeInOut" }}
        className="w-1/2 h-full bg-[url('/src/assets/rdoor.png')] bg-cover border-l-8 border-amber-700 shadow-2xl flex items-center justify-center"
      >
        <span className="text-4xl text-amber-400">⚔</span>
      </motion.div>

      {/* CENTER BUTTON */}

      {!opened && (
        <div className="absolute inset-0 flex items-center justify-center">

          <button
            onClick={openGate}
            className="bg-amber-500 text-black font-bold px-10 py-4 rounded-xl shadow-xl hover:bg-amber-400 transition"
          >
            Enter the Royal Hall
          </button>

        </div>
      )}

    </div>

  )
}