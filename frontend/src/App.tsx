import { Routes, Route } from "react-router-dom"

import HomePage from "./pages/HomePage"
import InterviewPage from "./pages/interviewPage"
import CodingArenaPage from "./pages/CodingArenaPage"
import CodingResultPage from "./pages/CodingResultPage"
import VictoryPage from "./pages/VictoryPage"

export default function App(){

return(

<Routes>

<Route path="/" element={<HomePage/>} />

<Route path="/interview" element={<InterviewPage/>} />

<Route path="/arena" element={<CodingArenaPage/>} />

<Route path="/coding-result" element={<CodingResultPage/>} />

<Route path="/victory" element={<VictoryPage/>} />

</Routes>

)

}