//imports
import { Route, Routes } from "react-router-dom";
import Learn from "./Learn";

export default function LearnRouter() {
    return (
        <>
            <Learn />
            <Routes>
                <Route path="/learn/hiragana" element={<div>hira</div>} />
                <Route path="/learn/katakana" element={<div>kata</div>} />
                <Route path="/learn/kanji" element={<div>kan</div>} />
            </Routes>
        </>
    )
}