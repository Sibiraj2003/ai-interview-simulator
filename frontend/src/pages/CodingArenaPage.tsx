import { useEffect, useState } from "react"
import Editor from "@monaco-editor/react"
import axios from "axios"
import ArenaGate from "../components/ArenaGate"
import { useSearchParams, useNavigate } from "react-router-dom"
import VideoRecorder from "../components/VideoRecorder"

export default function CodingArenaPage() {

const navigate = useNavigate()
const [params] = useSearchParams()
const type = params.get("type")

const [arena, setArena] = useState<null | "python" | "sql">(
(type as "python" | "sql") || null
)

const [questions, setQuestions] = useState<any[]>([])
const [index, setIndex] = useState(0)

const [code, setCode] = useState("")
const [results, setResults] = useState<any[]>([])
const [stdout, setStdout] = useState("")

const [pythonScore, setPythonScore] = useState(0)
const [sqlScore, setSqlScore] = useState(0)

const question = questions[index] || null


/* -----------------------------
   Load Questions
----------------------------- */

useEffect(() => {

if (!arena) return

axios
.get(`http://127.0.0.1:8000/coding/questions?arena_type=${arena}`)
.then(res => {

const data = res.data || []

const parsed = data.map((q:any)=>({
   ...q,
   test_cases:
     typeof q.test_cases === "string"
       ? JSON.parse(q.test_cases)
       : q.test_cases
 }))
 
setQuestions(parsed)
setIndex(0)
setResults([])
setStdout("")

if (data.length > 0) {
setCode(data[0].starter_code || "")
}

})
.catch(() => {
setStdout("Failed to load questions")
})

}, [arena])


/* -----------------------------
   Run Code
----------------------------- */

const runCode = async () => {

if (!question) return

let endpoint = ""
let payload: any = {}

if (arena === "python") {

endpoint = "http://127.0.0.1:8000/coding/run-python"

payload = {
code: code,
test_cases: question.test_cases || []
}

}

if (arena === "sql") {

endpoint = "http://127.0.0.1:8000/coding/run-sql"

payload = {
query: code,
expected_result: question.expected_result
}

}

try {

const res = await axios.post(endpoint, payload)
console.log("API RESPONSE:", res.data)

if (arena === "python") {

   if (res.data.error) {
     setStdout(res.data.error)
     setResults([])
     return
   }
 
   // unwrap nested response
   const runnerData = res.data.results
 
   const resData = Array.isArray(runnerData?.results)
     ? runnerData.results
     : []
 
   setResults(resData)
   setStdout(runnerData?.stdout || "")
 
   const passed = resData.filter((r:any)=>r.passed).length
   setPythonScore(prev => prev + passed)
 }

if (arena === "sql") {

if (res.data.error) {

setStdout(res.data.error)
setResults([])

} else {

setResults(res.data.rows || [])

if (res.data.correct) {

setSqlScore(prev => prev + 1)
setStdout("✅ Query Correct")

} else {

setStdout("❌ Query Incorrect")

}

}

}

} catch (err:any) {

setStdout("Execution Error: " + err.message)

}

}


/* -----------------------------
   Next Question
----------------------------- */

const nextChallenge = () => {

const next = index + 1

if (next < questions.length) {

setIndex(next)
setCode(questions[next].starter_code || "")
setResults([])
setStdout("")

} else {

navigate(`/coding-result?python=${pythonScore}&sql=${sqlScore}`)

}

}


/* -----------------------------
   Arena Lobby
----------------------------- */

if (!arena) {

return (

<div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">

<h1 className="text-4xl font-bold mb-12 text-blue-400">
⚔ Code Colosseum
</h1>

<div className="grid grid-cols-2 gap-10">

<ArenaGate
title="Python Arena"
onEnter={()=>setArena("python")}
/>

<ArenaGate
title="SQL Arena"
onEnter={()=>setArena("sql")}
/>

</div>

<VideoRecorder sessionId="coding_trial"/>

</div>

)

}


if (!question) {
return <div className="text-white p-6">Loading Arena...</div>
}


/* -----------------------------
   Arena UI
----------------------------- */

return (

<div
className="min-h-screen text-white p-6 bg-cover bg-center"
style={{backgroundImage:"url('/src/assets/arena_bg.jpg')"}}
>

<VideoRecorder sessionId="coding_trial"/>

<h1 className="text-3xl font-bold mb-6 text-blue-400">
⚔ {arena==="python"?"Python Arena":"SQL Arena"}
</h1>


<div className="grid grid-cols-3 gap-6">

<div className="col-span-2 bg-slate-800 p-6 rounded-xl shadow-lg">

<h2 className="text-xl font-bold mb-3">
{question.title}
</h2>

<p className="text-gray-300">
{question.description}
</p>

</div>


<div className="bg-slate-800 p-6 rounded-xl shadow-lg">

<h2 className="font-bold mb-4">
{arena==="python" ? "🧪 Test Cases" : "📊 Query Result"}
</h2>


{arena === "python" && question.test_cases?.map((tc:any,i:number)=>{

const result = results[i]

return (

<div
key={i}
className={`p-3 mb-3 rounded border ${
result
? result.passed
? "border-green-500 bg-green-900/20"
: "border-red-500 bg-red-900/20"
: "border-slate-700 bg-slate-900"
}`}
>

<div className="font-semibold">
Test Case {i+1}
</div>

<div className="text-sm mt-1">

<div>
Input:
<span className="text-blue-300 ml-2">
{JSON.stringify(tc.input)}
</span>
</div>

<div>
Expected:
<span className="text-yellow-300 ml-2">
{result ? result.expected : JSON.stringify(tc.output)}
</span>
</div>

{result && (
<div>
Output:
<span className="text-purple-300 ml-2">
{result.actual}
</span>
</div>
)}

</div>

<div className="mt-2 font-bold">

{result
? result.passed
? "✅ Passed"
: "❌ Failed"
: "Not executed"}

</div>

</div>

)

})}

{stdout && (

<div className="mt-4 bg-black p-3 rounded border border-red-500">

<div className="text-red-400 text-sm mb-1">
Runtime Output
</div>

<pre className="text-red-300 text-sm whitespace-pre-wrap">
{stdout}
</pre>

</div>

)}

</div>

</div>


<div className="mt-6">

<Editor
height="420px"
language={arena==="python"?"python":"sql"}
theme="vs-dark"
value={code}
onChange={(v)=>setCode(v || "")}
/>

</div>


<div className="mt-5 flex gap-4">

<button
onClick={runCode}
className="bg-blue-600 px-6 py-2 rounded hover:bg-blue-700"
>
Run Code
</button>

<button
onClick={nextChallenge}
className="bg-purple-600 px-6 py-2 rounded hover:bg-purple-700"
>
Next Challenge ⚔
</button>

</div>

</div>

)

}