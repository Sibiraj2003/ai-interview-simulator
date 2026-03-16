import { useSearchParams, useNavigate } from "react-router-dom"

export default function CodingResultPage(){

const [params] = useSearchParams()
const navigate = useNavigate()

const python = Number(params.get("python")) || 0
const sql = Number(params.get("sql")) || 0

const total = python + sql

const pythonDone = python > 0
const sqlDone = sql > 0

return(

<div
className="min-h-screen flex items-center justify-center text-white bg-cover bg-center"
style={{
  backgroundImage: "url('/src/assets/arena_bg.jpg')"
}}
>

<div className="min-h-screen w-full flex items-center justify-center bg-black/70">

<div className="bg-slate-900/90 backdrop-blur p-10 rounded-xl text-center w-[520px] border border-blue-500 shadow-2xl">

<h1 className="text-3xl font-bold text-blue-400 mb-6">
⚔ Knight's Coding Trial
</h1>

<div className="space-y-4 text-lg">

<div>
🐍 Python Trials: <span className="text-green-400">{python}</span>
</div>

<div>
📜 SQL Trials: <span className="text-green-400">{sql}</span>
</div>

<div className="text-xl font-bold pt-4 border-t border-slate-600">
🏆 Final Honor Score: {total}
</div>

</div>


{/* Buttons */}

<div className="mt-8 flex flex-col gap-4">

{/* Continue Python */}

{!pythonDone && (

<button
onClick={()=>navigate("/arena?type=python")}
className="bg-purple-600 px-6 py-3 rounded-lg hover:bg-purple-700 transition-all"
>
⚔ Continue Python Arena
</button>

)}

{/* Continue SQL */}

{pythonDone && !sqlDone && (

<button
onClick={()=>navigate("/arena?type=sql")}
className="bg-purple-600 px-6 py-3 rounded-lg hover:bg-purple-700 transition-all"
>
⚔ Continue SQL Arena
</button>

)}

{/* Finish always visible */}

<button
onClick={()=>navigate("/victory")}
className="bg-amber-500 text-black font-bold px-8 py-3 rounded-lg hover:bg-amber-400 transition-all shadow-lg"
>
🏆 Finish Trial
</button>

</div>

</div>

</div>

</div>

)

}