import { useNavigate } from "react-router-dom"

export default function VictoryPage(){

const navigate = useNavigate()

return(

<div
className="min-h-screen flex flex-col items-center justify-center text-white bg-cover bg-center"
style={{
backgroundImage:"url('/src/assets/victory.jpg')"
}}
>

<div className="bg-slate-800/90 backdrop-blur p-12 rounded-xl text-center border border-amber-400 shadow-2xl">

<h1 className="text-4xl font-bold text-amber-400 mb-6">

🏆 Victory!

</h1>

<p className="text-lg mb-8">

The royal trials are complete.  
You have proven your skills in the arena.

</p>

<button
onClick={()=>navigate("/")}
className="bg-amber-500 text-black font-bold px-8 py-3 rounded-lg hover:bg-amber-400 transition-all"
>

Return to Royal Hall

</button>

</div>

</div>

)

}