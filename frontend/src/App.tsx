import { Routes, Route } from "react-router-dom";
import { CreateGathering } from "./CreateGathering";
import { SubmitResponse } from "./SubmitResponse";
import { ResultsView } from "./ResultsView";
import { Login } from "./Login";
import { VerifyAuth } from "./VerifyAuth";

function App() {
  return (
    <Routes>
      {/* Home page - Create gathering form */}
      <Route path="/" element={<CreateGathering />} />
      {/* Login routes */}
      <Route path="/login" element={<Login />} />
      {/* Verify auth page */}
      <Route path="/auth/verify" element={<VerifyAuth />} />{" "}
      {/* Results page - View gathering details */}
      <Route path="/gathering/:id" element={<ResultsView />} />
      {/* Response page - Submit response for a gathering */}
      <Route path="/gathering/:id/respond" element={<SubmitResponse />} />
    </Routes>
  );
}

export default App;
