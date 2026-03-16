import { useState } from "react"
import { useNavigate } from "react-router-dom"
import ArenaGate from "../components/ArenaGate"
import CastleGate from "../components/CastleGate"

export default function HomePage(){

const navigate = useNavigate()

const [gateOpened,setGateOpened] = useState(false)

return(

<div className="relative min-h-screen text-white">

{/* CASTLE DOOR */}

{!gateOpened && (

<CastleGate onOpen={()=>setGateOpened(true)} />

)}

{/* ROYAL HALL */}

<div
className="min-h-screen flex flex-col items-center justify-center bg-cover bg-center"
style={{
backgroundImage:"url('/src/assets/hall.jpg')"
}}
>

<h1 className="text-6xl font-bold mb-20 text-amber-400 drop-shadow-lg">

🏰 Royal Interview Hall

</h1>

<div className="grid grid-cols-2 gap-16">

<ArenaGate
title="MCQ Interview"
onEnter={()=>navigate("/interview")}
/>

<ArenaGate
title="Coding Arena"
onEnter={()=>navigate("/arena")}
/>

</div>

<p className="mt-16 text-gray-200 text-center max-w-xl text-lg">

⚔ Prove thy knowledge in the royal trials.  
Face the MCQ Gauntlet or enter the Coding Colosseum.

</p>

</div>

</div>

)

}